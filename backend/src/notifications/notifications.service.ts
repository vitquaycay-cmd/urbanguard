import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

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
    return raw.filter((x): x is string => typeof x === 'string');
  }
  if (typeof raw === 'string') {
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
  constructor(private readonly gateway: NotificationsGateway) {}

  getModuleInfo() {
    return {
      module: 'notifications',
      note: 'Socket.IO namespace /realtime — report:new, report:update.',
    };
  }

  emitReportNew(payload: ReportNewSocketPayload) {
    this.gateway.emitReportNew(payload as unknown as Record<string, unknown>);
  }

  broadcastReportUpdate(payload: { id: number; status: string }) {
    this.gateway.emitReportUpdate(payload as unknown as Record<string, unknown>);
  }
}
