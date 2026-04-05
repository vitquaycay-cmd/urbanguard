import { Injectable } from '@nestjs/common';

@Injectable()
export class MapService {
  getModuleInfo() {
    return { module: 'map', note: 'API dữ liệu bản đồ / marker — gắn Report & geo sau.' };
  }
}
