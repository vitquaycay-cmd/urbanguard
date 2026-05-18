import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';

// 7 ngày → ẨN
const HIDE_AFTER_DAYS = 7;

// 30 ngày → XOÁ
const DELETE_AFTER_DAYS = 30;

const BATCH_SIZE = 100;

@Injectable()
export class CleanupCron {
  private readonly logger = new Logger(CleanupCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
  ) {}

  // Chạy mỗi ngày lúc 00:00
  @Cron('0 0 * * *')
  async cleanupOldResolvedReports(): Promise<void> {
    this.logger.log('🔄 Bắt đầu dọn dẹp report...');

    const now = new Date();

    // =========================
    // 1. ẨN report quá 7 ngày
    // =========================
    const hideDate = new Date();
    hideDate.setDate(now.getDate() - HIDE_AFTER_DAYS);

    const reportsToHide = await this.prisma.report.findMany({
      where: {
        status: 'RESOLVED',
        updatedAt: {
          lt: hideDate,
        },
        isHidden: false,
      },
      select: {
        id: true,
      },
      take: BATCH_SIZE,
    });

    for (const report of reportsToHide) {
      try {
        await this.prisma.report.update({
          where: {
            id: report.id,
          },
          data: {
            isHidden: true,
          },
        });
      } catch (err) {
        this.logger.warn(
          `[HIDE] Lỗi report #${report.id}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(`👻 Đã ẩn: ${reportsToHide.length} report`);

    // =========================
    // 2. XOÁ report quá 30 ngày
    // =========================
    const deleteDate = new Date();
    deleteDate.setDate(now.getDate() - DELETE_AFTER_DAYS);

    const reportsToDelete = await this.prisma.report.findMany({
      where: {
        status: 'RESOLVED',
        updatedAt: {
          lt: deleteDate,
        },
      },
      select: {
        id: true,
      },
      take: BATCH_SIZE,
    });

    let deletedCount = 0;
    let failedCount = 0;

    for (const report of reportsToDelete) {
      try {
        // dùng lại logic xoá của ReportsService
        await this.reportsService.remove(report.id);

        deletedCount++;
      } catch (err) {
        failedCount++;

        this.logger.warn(
          `[DELETE] Không thể xóa report #${report.id}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `🗑️ Xóa: ${deletedCount}, lỗi: ${failedCount}`,
    );

    this.logger.log('✅ Cleanup hoàn tất');
  }
}