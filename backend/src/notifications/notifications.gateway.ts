import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

function socketCorsOrigins(): string | string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return 'http://localhost:3001';
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return list.length <= 1 ? (list[0] ?? 'http://localhost:3001') : list;
}

/**
 * Realtime — đồng bộ marker bản đồ (bước 4 luồng dữ liệu trong architecture.md).
 * Client kết nối namespace `/realtime`, lắng nghe `report:new` / `report:update`.
 */
@WebSocketGateway({
  cors: { origin: socketCorsOrigins(), credentials: true },
  namespace: '/realtime',
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  /** Báo cáo mới (sau create + bước AI) — client bản đồ refetch `/reports/active`. */
  emitReportNew(payload: Record<string, unknown>) {
    this.server.emit('report:new', payload);
  }

  /** Gọi từ Reports / AI sau khi cập nhật trustScore hoặc trạng thái báo cáo. */
  emitReportUpdate(payload: Record<string, unknown>) {
    this.server.emit('report:update', payload);
  }
}
