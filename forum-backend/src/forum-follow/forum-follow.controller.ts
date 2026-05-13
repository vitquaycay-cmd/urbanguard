import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { ForumFollowService } from './forum-follow.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('forum/follow')
@UseGuards(JwtAuthGuard)
export class ForumFollowController {
  constructor(private readonly followService: ForumFollowService) {}

  private getCurrentUserId(req: any) {
    return req.user?.userId || req.user?.id || req.user?.sub
  }

  @Post(':userId')
  toggleFollow(@Param('userId') userId: string, @Req() req: any) {
    return this.followService.toggleFollow(this.getCurrentUserId(req), userId)
  }

  @Get(':userId')
  isFollowing(@Param('userId') userId: string, @Req() req: any) {
    return this.followService.isFollowing(this.getCurrentUserId(req), userId)
  }

  @Get(':userId/followers')
  getFollowers(@Param('userId') userId: string) {
    return this.followService.getFollowers(userId)
  }

  @Get(':userId/following')
  getFollowing(@Param('userId') userId: string) {
    return this.followService.getFollowing(userId)
  }
}