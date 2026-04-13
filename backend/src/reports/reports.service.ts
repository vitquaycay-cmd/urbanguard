import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Prisma } from '@prisma/client';
import { ReportStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildReportNewSocketPayload,
  NotificationsService,
} from '../notifications/notifications.service';
import { AdminReportStatus } from './dto/update-report-status.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
const IMAGE_URL_PREFIX = '/uploads';

/** Điểm uy tín user khi báo cáo được VALIDATED (admin hoặc AI tự động). */
const REPUTATION_BONUS_ON_VALIDATION = 5;

/** Điểm trustScore gán khi AI tự động VALIDATED (confidence > ngưỡng). */
const AUTO_VALIDATED_TRUST_SCORE = 15;

/** Ngưỡng tự duyệt: `detected === true` và `confidence` phải **lớn hơn** giá trị này. */
const CONFIDENCE_AUTO_VALIDATE = 0.7;

const REPORT_STATUS_VALIDATED = 'VALIDATED' as ReportStatus;
const REPORT_STATUS_REJECTED = 'REJECTED' as ReportStatus;

/** Chuẩn hoá nhãn AI: luôn `string[]` (hỗ trợ AI trả chuỗi "a, b"). */
function normalizeAnalysisLabels(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

const reportSelectFull = {
  id: true,
  title: true,
  description: true,
  latitude: true,
  longitude: true,
  imageUrl: true,
  status: true,
  trustScore: true,
  aiSummary: true,
  aiLabels: true,
  createdAt: true,
  userId: true,
} as const;

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Báo cáo đã duyệt — chỉ trạng thái VALIDATED trong DB (hiển thị bản đồ).
   */
  findActiveValidated() {
    return this.prisma.report.findMany({
      where: {
        status: REPORT_STATUS_VALIDATED,
        trustScore: { gt: 0 },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        trustScore: true,
        aiLabels: true,
        createdAt: true,
        status: true,
      },
    });
  }
  async findOne(id: number) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: {
        ...reportSelectFull,
        user: {
          select: {
            id: true,
            email: true,
            reputationScore: true,
            role: true,
          },
        },
      }
    });

    if (!report) {
      throw new NotFoundException(`Không tìm thấy báo cáo #${id}`);
    }
    return report;
  }

  async findAll(dto: QueryReportsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.userId) {
      where.userId = dto.userId;
    }

    if (dto.search) {
      where.OR = [
        { title: { contains: dto.search } },
        { description: { contains: dto.search } },
      ];
    }

    const sortBy = dto.sortBy ?? 'createdAt';
    const sortOrder = dto.sortOrder ?? 'desc';
    const orderBy = { [sortBy]: sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          ...reportSelectFull,
          user: {
            select: {
              id: true,
              email: true,
              reputationScore: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
    async remove(id: number) {
      const report = await this.prisma.report.findUnique({
        where: { id },
        select: { id: true, imageUrl: true },
      });
  
      if (!report) {
        throw new NotFoundException(`Không tìm thấy báo cáo #${id}`);
      }
  
      if (report.imageUrl) {
        const filename = report.imageUrl.replace(/^\/uploads\//, '');
        const filePath = join(process.cwd(), 'uploads', filename);
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        } catch (err) {
          this.logger.warn(
            `Không thể xóa file ${filePath}: ${(err as Error).message}`,
          );
        }
      }
  
      // Vote.report có onDelete: Cascade — không cần deleteMany
  
      await this.prisma.report.delete({ where: { id } });
  
      return { message: `Báo cáo #${id} đã bị xóa`, deletedId: id };
    }
  


  /**
   * Quy trình tạo báo cáo:
   *
   * 1. **Upload:** File đã được Multer lưu `uploads/`; tạo `Report` `PENDING`, `trustScore` 0.
   * 2. **AI:** `AiService` (HttpService) gọi `POST /ai/analyze` với tên file vừa lưu.
   * 3. **Validation & scoring:**
   *    - `detected === true` và `confidence > 0.7` → `VALIDATED`, `trustScore = 15`, `aiLabels`, `aiSummary`.
   *    - Ngược lại → `PENDING`, `trustScore = 0` (không bao giờ VALIDATED + trust 0).
   * 4. **Realtime:** khi `VALIDATED` → `report:new` payload `{ id, latitude, longitude, aiLabels, trustScore }`.
   */
  async create(
    userId: number,
    dto: CreateReportDto,
    file: Express.Multer.File | undefined,
  ) {
    if (!file?.filename) {
      throw new BadRequestException('Thiếu file ảnh (field: image)');
    }

    const imageUrl = `${IMAGE_URL_PREFIX}/${file.filename}`;

    const report = await this.prisma.report.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        imageUrl,
        userId,
        status: ReportStatus.PENDING,
        trustScore: 0,
      },
      select: { id: true },
    });

    let aiSummary: Prisma.InputJsonValue;
    let aiLabels: string[] | null = null;
    let trustScore = 0;
    let status: ReportStatus = ReportStatus.PENDING;

    try {
      const analysis = await this.aiService.analyze(file.filename);
      const conf =
        typeof analysis.confidence === 'number' && Number.isFinite(analysis.confidence)
          ? analysis.confidence
          : 0;
      const labels = normalizeAnalysisLabels(analysis.labels);

      aiSummary = {
        ...analysis,
        labels,
        image_path: file.filename,
        image_filename: file.filename,
      } as Prisma.InputJsonValue;
      aiLabels = labels.length > 0 ? labels : null;

      if (analysis.detected === true && conf > CONFIDENCE_AUTO_VALIDATE) {
        status = REPORT_STATUS_VALIDATED;
        trustScore = AUTO_VALIDATED_TRUST_SCORE;
      } else {
        status = ReportStatus.PENDING;
        trustScore = 0;
      }

      if (status === REPORT_STATUS_VALIDATED && trustScore === 0) {
        trustScore = AUTO_VALIDATED_TRUST_SCORE;
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'AI_SERVICE_UNAVAILABLE';
      this.logger.warn(`AI analyze failed for report #${report.id}: ${message}`);
      aiSummary = `AI_ERROR: ${message}` as unknown as Prisma.InputJsonValue;
      aiLabels = null;
      trustScore = 0;
      status = ReportStatus.PENDING;
    }

    const aiLabelsInput: Prisma.InputJsonValue | typeof Prisma.DbNull =
      aiLabels === null ? Prisma.DbNull : aiLabels;

    let updated;
    if (status === REPORT_STATUS_VALIDATED) {
      updated = await this.prisma.$transaction(async (tx) => {
        const row = await tx.report.update({
          where: { id: report.id },
          data: {
            aiSummary,
            aiLabels: aiLabelsInput,
            trustScore,
            status,
          },
          select: reportSelectFull,
        });
        await tx.user.update({
          where: { id: userId },
          data: { reputationScore: { increment: REPUTATION_BONUS_ON_VALIDATION } },
        });
        return row;
      });
    } else {
      updated = await this.prisma.report.update({
        where: { id: report.id },
        data: {
          aiSummary,
          aiLabels: aiLabelsInput,
          trustScore,
          status,
        },
        select: reportSelectFull,
      });
    }

    if (updated.status === REPORT_STATUS_VALIDATED) {
      this.notificationsService.emitReportNew({
        ...buildReportNewSocketPayload(updated),
        report: updated,
      });
    }
    return updated;
  }

  /**
   * Admin: chỉ từ PENDING → VALIDATED (lưu VALIDATED trong DB) hoặc REJECTED.
   * Khi duyệt VALIDATED, cộng reputationScore cho user tạo báo cáo.
   */
  async updateStatus(reportId: number, action: AdminReportStatus) {
    const nextDbStatus: ReportStatus =
      action === AdminReportStatus.VALIDATED
        ? REPORT_STATUS_VALIDATED
        : REPORT_STATUS_REJECTED;

    const result = await this.prisma.$transaction(async (tx) => {
      const report = await tx.report.findUnique({
        where: { id: reportId },
        select: { id: true, status: true, userId: true, trustScore: true },
      });

      if (!report) {
        throw new NotFoundException(`Không tìm thấy báo cáo #${reportId}`);
      }
      if (report.status !== ReportStatus.PENDING) {
        throw new BadRequestException(
          `Chỉ có thể duyệt báo cáo đang PENDING (hiện tại: ${report.status})`,
        );
      }

      let trustForValidated = report.trustScore;
      if (action === AdminReportStatus.VALIDATED) {
        trustForValidated =
          report.trustScore > 0 ? report.trustScore : AUTO_VALIDATED_TRUST_SCORE;
        if (trustForValidated === 0) {
          trustForValidated = AUTO_VALIDATED_TRUST_SCORE;
        }
      }

      const updated = await tx.report.update({
        where: { id: reportId },
        data: {
          status: nextDbStatus,
          ...(action === AdminReportStatus.VALIDATED
            ? { trustScore: trustForValidated }
            : {}),
        },
        select: reportSelectFull,
      });

      if (action === AdminReportStatus.VALIDATED) {
        await tx.user.update({
          where: { id: report.userId },
          data: {
            reputationScore: { increment: REPUTATION_BONUS_ON_VALIDATION },
          },
        });
      }

      return {
        ...updated,
        adminAction: action,
      };
    });

    const { adminAction, ...report } = result;
    if (adminAction === AdminReportStatus.VALIDATED) {
      this.notificationsService.emitReportNew({
        ...buildReportNewSocketPayload(report),
        report,
      });
    }

    return result;
  }
}
