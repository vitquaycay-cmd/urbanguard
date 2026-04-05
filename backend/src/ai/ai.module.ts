import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 120_000,
      maxRedirects: 0,
    }),
  ],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
