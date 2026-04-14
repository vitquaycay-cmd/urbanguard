

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';

// So ngay toi da mot bao cao RESOLVED duoc giu lai truoc khi bi xoa
const MAX_RESOLVED_AGE_DAYS = 7;

// So record toi da xu ly moi lan cron chay (tranh block I/O hang loat)
const BATCH_SIZE = 100;

@Injectable()
export class CleanupCron {
  private readonly logger = new Logger(CleanupCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
  ) {}

  /**
   * Cron chay luc 2:00 sang moi ngay.
   *
   * DE TEST NHANH: doi decorator thanh @Cron('0/30 * * * * *')
   * de no chay moi 30 giay, kiem tra log trong terminal la biet ngay
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldResolvedReports(): Promise<void> {
    this.logger.log('[CleanupCron] Bat dau don bao cao RESOLVED qua han...');

    // Tinh moc thoi gian: 7 ngay truoc tu thoi diem hien tai
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_RESOLVED_AGE_DAYS);

    // Buoc 1: Tim cac report RESOLVED da qua 7 ngay (chi lay ID de nhe RAM)
    const oldReports = await this.prisma.report.findMany({
      where: {
        status: 'RESOLVED',
        updatedAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
      },
      take: BATCH_SIZE,
    });

    if (oldReports.length === 0) {
      this.logger.log('[CleanupCron] Khong co bao cao nao can don.');
      return;
    }

    this.logger.log(
      `[CleanupCron] Tim thay ${oldReports.length} bao cao can xoa (batch <= ${BATCH_SIZE}).`,
    );

    let deletedCount = 0;
    let failedCount = 0;

    // Buoc 2: Vong lap goi reportsService.remove() cua Dev A cho tung record
    // Ham remove() cua Dev A tu xu ly: xoa file vat ly trong uploads/ + xoa record trong DB
    for (const report of oldReports) {
      try {
        await this.reportsService.remove(report.id);
        deletedCount++;
      } catch (err) {
        failedCount++;
        this.logger.warn(
          `[CleanupCron] Khong the xoa report #${report.id}: ${(err as Error).message}`,
        );
        // Khong throw: tiep tuc xoa cac report con lai du co 1 cai bi loi
      }
    }

    this.logger.log(
      `[CleanupCron] Hoan tat: Xoa thanh cong ${deletedCount}, that bai ${failedCount}.`,
    );
  }
}
