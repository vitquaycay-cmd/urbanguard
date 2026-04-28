import { Injectable } from "@nestjs/common";
import { NotificationType, Prisma } from "@prisma/client";
import { NotificationsGateway } from "./notifications.gateway";
import { PrismaService } from "../prisma/prisma.service";

/** Payload `report:new` — đồng bộ với client refetch `/api/reports/active`. */
export type ReportNewSocketPayload = {
  id: number;
  latitude: number;
  longitude: number;
  aiLabels: string[];
  trustScore: number;
  /** Tùy chọn — client có thể kiểm tra `payload.report` trước khi refetch. */
  report?: unknown;
};

function normalizeAiLabelsJson(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string");
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function buildReportNewSocketPayload(report: {
  id: number;
  latitude: number;
  longitude: number;
  trustScore: number;
  aiLabels: unknown;
}): ReportNewSocketPayload {
  return {
    id: report.id,
    latitude: report.latitude,
    longitude: report.longitude,
    aiLabels: normalizeAiLabelsJson(report.aiLabels),
    trustScore: report.trustScore,
  };
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) {}

  getModuleInfo() {
    return {
      module: "notifications",
      note: "Socket.IO namespace /realtime — report:new, report:update.",
    };
  }

  emitReportNew(payload: ReportNewSocketPayload) {
    this.gateway.emitReportNew(payload as unknown as Record<string, unknown>);
  }

  broadcastReportUpdate(payload: { id: number; status: string }) {
    this.gateway.emitReportUpdate(
      payload as unknown as Record<string, unknown>,
    );
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
    return { count };
  }

  async listForUser(
    userId: number,
    type?: string,
    unreadOnly?: boolean,
  ) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (unreadOnly) where.readAt = null;
    if (
      type &&
      (Object.values(NotificationType) as string[]).includes(type)
    ) {
      where.type = type as NotificationType;
    }
    const rows = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      type: r.type,
      readAt: r.readAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      reportId: r.reportId ?? undefined,
    }));
  }

  async markAllRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async deleteAllForUser(userId: number) {
    await this.prisma.notification.deleteMany({ where: { userId } });
  }

  async markRead(userId: number, id: number) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }
}
