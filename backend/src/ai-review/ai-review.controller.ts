import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { skipAllThrottles } from '../common/throttle-skip';
import { AiReviewService } from './ai-review.service';

@Controller('ai-review')
export class AiReviewController {
  constructor(private readonly aiReviewService: AiReviewService) {}

  @SkipThrottle(skipAllThrottles)
  @Get()
  placeholder() {
    return this.aiReviewService.getModuleInfo();
  }
}
