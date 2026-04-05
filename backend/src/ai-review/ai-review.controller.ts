import { Controller, Get } from '@nestjs/common';
import { AiReviewService } from './ai-review.service';

@Controller('ai-review')
export class AiReviewController {
  constructor(private readonly aiReviewService: AiReviewService) {}

  @Get()
  placeholder() {
    return this.aiReviewService.getModuleInfo();
  }
}
