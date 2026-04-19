import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { skipAllThrottles } from '../common/throttle-skip';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @SkipThrottle(skipAllThrottles)
  @Get()
  placeholder() {
    return this.notificationsService.getModuleInfo();
  }
}
