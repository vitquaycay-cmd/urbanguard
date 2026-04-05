import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getModuleInfo() {
    return { module: 'admin', note: 'Kiểm duyệt báo cáo, khóa user — bảo vệ route ADMIN sau.' };
  }
}
