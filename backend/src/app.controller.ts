import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { skipAllThrottles } from './common/throttle-skip';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SkipThrottle(skipAllThrottles)
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
