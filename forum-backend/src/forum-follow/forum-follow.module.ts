import { Module } from '@nestjs/common'
import { ForumFollowService } from './forum-follow.service'
import { ForumFollowController } from './forum-follow.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ForumFollowController],
  providers: [ForumFollowService],
  exports: [ForumFollowService],
})
export class ForumFollowModule {}