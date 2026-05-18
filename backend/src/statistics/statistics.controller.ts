import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { skipAllThrottles } from '../common/throttle-skip';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @SkipThrottle(skipAllThrottles)
  @Get('overview')
  async getOverview() {
    return this.statisticsService.getOverview();
  }

  @SkipThrottle(skipAllThrottles)
  @Get('heatmap-data')
  async getHeatmapData() {
    return this.statisticsService.getHeatmapData();
  }

  @SkipThrottle(skipAllThrottles)
  @Get()
  placeholder() {
    return this.statisticsService.getModuleInfo();
  }
}
