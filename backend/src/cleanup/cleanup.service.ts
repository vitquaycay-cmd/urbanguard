import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

/**
 * 🛠️ CLEANUP SERVICE (Zero-Touch)
 * Tự động dọn dẹp file hình ảnh khi báo cáo bị REJECTED hoặc bị XOÁ.
 * Hoạt động thông qua Prisma Middleware - không cần sửa code ReportsService.
 */
@Injectable()
export class CleanupService implements OnModuleInit {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.registerPrismaCleanupMiddleware();
  }

  private registerPrismaCleanupMiddleware() {
    // ⚠️ Prisma v6 đã gỡ bỏ hoàn toàn .$use (Middleware).
    // Logic dọn dẹp file đã được chuyển trực tiếp vào ReportsService để đảm bảo ổn định.
    this.logger.log('ℹ️ Prisma Middleware ($use) đã được gỡ bỏ để tương thích với Prisma v6.');
  }

  /**
   * Xoá file vật lý trên ổ cứng
   */
  private deletePhysicalFile(imageUrl: string) {
    try {
      // imageUrl thường có dạng "/uploads/12345.jpg"
      const filename = imageUrl.replace(/^\/uploads\//, '');
      const filePath = join(process.cwd(), 'uploads', filename);

      if (existsSync(filePath)) {
        unlinkSync(filePath);
        this.logger.log(`🗑️ Đã xoá file thành công: ${filename}`);
      } else {
        this.logger.warn(`⚠️ File không tồn tại trên đĩa: ${filePath}`);
      }
    } catch (err) {
      this.logger.error(`❌ Lỗi khi xoá file: ${(err as Error).message}`);
    }
  }
}
