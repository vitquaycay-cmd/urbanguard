import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
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

const reportUserSelect = {
  id: true,
  email: true,
  fullname: true,
  username: true,
  reputationScore: true,
  role: true,
} as const;

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
    
  ) {}

  private getUserId(user: any): number {
    const rawId = user?.id ?? user?.userId ?? user?.sub;
    const userId = Number(rawId);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new UnauthorizedException("Không xác định được user đăng nhập");
    }

    return userId;
  }

  async createReport(params: {
    user: any;
    body: any;
    image: Express.Multer.File;
  }) {
    const { user, body, image } = params;

    const userId = this.getUserId(user);

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!title) {
      throw new BadRequestException("Thiếu tiêu đề báo cáo");
    }

    if (!description) {
      throw new BadRequestException("Thiếu mô tả báo cáo");
    }

    if (!Number.isFinite(latitude)) {
      throw new BadRequestException("Latitude không hợp lệ");
    }

    if (!Number.isFinite(longitude)) {
      throw new BadRequestException("Longitude không hợp lệ");
    }

    const aiSummary = await this.aiService.analyzeImage(
      image.path,
      image.originalname,
    );

    const detections = Array.isArray(aiSummary?.detections)
      ? aiSummary.detections
      : [];

    const aiLabels = detections
      .map((d: any) => d?.label)
      .filter((label: unknown) => typeof label === "string");

    const relevanceScore = Number((aiSummary as any)?.relevanceScore ?? 0);
    const isRelevant = Boolean((aiSummary as any)?.isRelevant);

    const finalStatus = isRelevant
      ? ReportStatus.VALIDATED
      : ReportStatus.PENDING;

    const imageUrl = `/uploads/reports/${image.filename}`;

    return this.prisma.report.create({
      data: {
        title,
        description,
        latitude,
        longitude,
        imageUrl,
        userId,
        status: finalStatus,
        trustScore: relevanceScore,
        aiSummary: aiSummary as Prisma.InputJsonValue,
        aiLabels: aiLabels as Prisma.InputJsonValue,
      },
    });
  }

  async findActiveReports() {
    return this.prisma.report.findMany({
      where: {
        status: ReportStatus.VALIDATED,
        isHidden: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
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
      },
    });
  }

  async findOne(id: number) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: {
        ...reportSelectFull,
        user: {
          select: reportUserSelect,
        },
      },
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

    const sortBy = dto.sortBy ?? "createdAt";
    const sortOrder = dto.sortOrder ?? "desc";
    const orderBy: Prisma.ReportOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          ...reportSelectFull,
          user: {
            select: reportUserSelect,
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
      select: { id: true },
    });

    if (!report) {
      throw new NotFoundException("Không tìm thấy báo cáo");
    }

    await this.prisma.report.update({
      where: { id },
      data: { isHidden: true },
    });

    return {
      message: "Đã xóa báo cáo",
      deletedId: id,
    };
  }

   /**
     * Helper dọn dẹp file vật lý
     */
    private deletePhysicalFile(imageUrl: string) {
      const filename = imageUrl.replace(/^\/uploads\//, '');
      const filePath = join(process.cwd(), 'uploads', filename);
      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath);
          this.logger.log(`🗑️ [File Cleanup] Đã xoá file thành công: ${filename}`);
        }
      } catch (err) {
        this.logger.warn(
          `⚠️ [File Cleanup] Không thể xóa file ${filePath}: ${(err as Error).message}`,
        );
      }
    }
  async updateStatus(reportId: number, action: AdminReportStatus) {
    // [Cũ] Sửa: Logic cũ phân loại đích đến của Dev A:
    // const nextDbStatus: ReportStatus =
    //   action === AdminReportStatus.VALIDATED
    //     ? REPORT_STATUS_VALIDATED
    //     : REPORT_STATUS_REJECTED;

    // [Mới] Logic thêm flow RESOLVED
    let nextDbStatus: ReportStatus;
    if (action === AdminReportStatus.VALIDATED) nextDbStatus = ReportStatus.VALIDATED;
    else if (action === AdminReportStatus.REJECTED) nextDbStatus = ReportStatus.REJECTED;
    else nextDbStatus = ReportStatus.RESOLVED;

    const result = await this.prisma.$transaction(async (tx) => {
      const report = await tx.report.findUnique({
        where: { id: reportId },
        select: { id: true, status: true, userId: true, trustScore: true },
      });

      if (!report) {
        throw new NotFoundException(`Không tìm thấy báo cáo #${reportId}`);
      }

      // [Cũ] Sửa: Cữ chặn cũ của Dev A (Chỉ duyệt PENDING):
      // if (report.status !== ReportStatus.PENDING) {
      //   throw new BadRequestException(
      //     `Chỉ có thể duyệt báo cáo đang PENDING (hiện tại: ${report.status})`,
      //   );
      // }

      // [Mới] Cữ chặn linh hoạt cho RESOLVED:
      if (report.status === ReportStatus.PENDING && action === AdminReportStatus.RESOLVED) {
        throw new BadRequestException(`Báo cáo PENDING không thể chuyển thẳng thành RESOLVED`);
      }
      if (report.status === ReportStatus.VALIDATED && (action === AdminReportStatus.VALIDATED || action === AdminReportStatus.REJECTED)) {
         throw new BadRequestException(`Báo cáo đang hiển thị (VALIDATED) chỉ có thể chuyển thành đã khắc phục (RESOLVED)`);
      }
      if (report.status === ReportStatus.RESOLVED || report.status === ReportStatus.REJECTED) {
         throw new BadRequestException(`Báo cáo này đã kết thúc, không thể thay đổi trạng thái nữa`);
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

      // Tự động dọn dẹp file khi chuyển sang REJECTED
      if (nextDbStatus === ReportStatus.REJECTED && updated.imageUrl) {
        this.deletePhysicalFile(updated.imageUrl);
      }

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

    // WIRE VÀO FLOW RESOLVED / REJECTED ĐỂ PHÁT SOCKET
    if (adminAction === AdminReportStatus.RESOLVED || adminAction === AdminReportStatus.REJECTED) {
      this.notificationsService.broadcastReportUpdate({
        id: report.id,
        status: adminAction,
      });
    }

    return result;
  }
}
