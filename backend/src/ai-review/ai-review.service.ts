import { Injectable } from '@nestjs/common';

@Injectable()
export class AiReviewService {
  getModuleInfo() {
    return {
      module: 'ai-review',
      note: 'AI nhận diện / gợi ý độ tin cậy — tích hợp model & Report.trustScore sau.',
    };
  }
}
