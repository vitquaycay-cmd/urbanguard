import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Prisma, ReportStatus } from "@prisma/client";
import { AiService } from "../ai/ai.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
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

  async remove(id: number) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!report) {
      throw new NotFoundException("Không tìm thấy báo cáo");
    }

    return this.prisma.report.update({
      where: { id },
      data: { isHidden: true },
    });
  }
}