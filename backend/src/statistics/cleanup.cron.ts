import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';

// const HIDE_AFTER_DAYS = 7;     // 7 ngày → ẨN
// const DELETE_AFTER_DAYS = 30; //  30 ngày → XOÁ
const HIDE_AFTER_SECONDS = 10;   // 10 giây → ẨN
const DELETE_AFTER_SECONDS = 60; // 20 giây → XOÁ
const BATCH_SIZE = 100;

@Injectable()
export class CleanupCron {
  private readonly logger = new Logger(CleanupCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
  ) {}

  @Cron('*/30 * * * * *') // 👉 30 giây chạy 1 lần (test)
  async cleanupOldResolvedReports(): Promise<void> {
    this.logger.log('🔄 Bắt đầu dọn dẹp report...');

    const now = new Date();
    
    // const hideDate = new Date();//// 1. ẨN report quá 7 ngày
    // hideDate.setDate(now.getDate() - HIDE_AFTER_DAYS);
    const hideDate = new Date(now.getTime() - HIDE_AFTER_SECONDS * 1000);

    const reportsToHide = await this.prisma.report.findMany({
      where: {
        status: 'RESOLVED',
        updatedAt: { lt: hideDate },
        isHidden: false,
      },
      select: { id: true },
      take: BATCH_SIZE,
    });

    for (const report of reportsToHide) {
      try {
        await this.prisma.report.update({
          where: { id: report.id },
          data: { isHidden: true },
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
    // const deleteDate = new Date();
    // deleteDate.setDate(now.getDate() - DELETE_AFTER_DAYS);
    const deleteDate = new Date(now.getTime() - DELETE_AFTER_SECONDS * 1000);

    const reportsToDelete = await this.prisma.report.findMany({
      where: {
        status: 'RESOLVED',
        updatedAt: { lt: deleteDate },
      },
      select: { id: true },
      take: BATCH_SIZE,
    });

    let deletedCount = 0;
    let failedCount = 0;

    for (const report of reportsToDelete) {
      try {
        await this.reportsService.remove(report.id); // dùng lại logic Dev A
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