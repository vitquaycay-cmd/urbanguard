import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  getModuleInfo() {
    return { module: 'uploads', note: 'Upload ảnh báo cáo — validate & storage sau.' };
  }
}
