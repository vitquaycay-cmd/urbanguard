import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { CleanupCron } from './cleanup.cron';
import { ReportsModule } from '../reports/reports.module'; // DEV C: dùng remove() của Dev A

@Module({
  imports: [ReportsModule], // DEV C: inject để CleanupCron dùng được ReportsService
  controllers: [StatisticsController],
  providers: [StatisticsService, CleanupCron], // DEV C: thêm CleanupCron vào providers
  exports: [StatisticsService],
})
export class StatisticsModule {}
