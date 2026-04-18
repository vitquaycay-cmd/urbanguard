import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @SkipThrottle()
  @Get()
  placeholder() {
    return this.adminService.getModuleInfo();
  }
}
