import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VoteController } from './vote.controller';
import { VoteService } from './votes.entity';

@Module({
  imports: [PrismaModule],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}
