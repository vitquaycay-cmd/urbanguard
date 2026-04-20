import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { CleanupCron } from './cleanup.cron';
import { ReportsModule } from '../reports/reports.module'; //  remove() của Dev A

@Module({
  imports: [ReportsModule], //  cleanupCron dùng được ReportsService
  controllers: [StatisticsController],
  providers: [StatisticsService, CleanupCron], // CleanupCron vào providers
  exports: [StatisticsService],
})
export class StatisticsModule {}
