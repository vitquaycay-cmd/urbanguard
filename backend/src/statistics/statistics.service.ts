import { Injectable } from '@nestjs/common';

@Injectable()
export class StatisticsService {
  getModuleInfo() {
    return { module: 'statistics', note: 'Thống kê báo cáo, vote — truy vấn aggregate sau khi có DB.' };
  }
}
