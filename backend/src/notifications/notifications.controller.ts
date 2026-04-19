import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @SkipThrottle()
  @Get()
  placeholder() {
    return this.notificationsService.getModuleInfo();
  }
}
