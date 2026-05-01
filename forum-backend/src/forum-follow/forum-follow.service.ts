import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ForumFollowService {
  constructor(private prisma: PrismaService) {}

  async toggleFollow(currentUserId: string, targetUserId: string) {
    if (!currentUserId) {
      throw new BadRequestException('Bạn chưa đăng nhập')
    }

    if (!targetUserId) {
      throw new BadRequestException('Thiếu ID người dùng')
    }

    if (currentUserId === targetUserId) {
      throw new BadRequestException('Không thể tự follow chính mình')
    }

    const targetUser = await this.prisma.forumUser.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    })

    if (!targetUser) {
      throw new NotFoundException('Không tìm thấy người dùng')
    }

    const existing = await this.prisma.forumFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    })

    if (existing) {
      await this.prisma.forumFollow.delete({
        where: { id: existing.id },
      })

      return {
        followed: false,
        message: 'Đã bỏ theo dõi',
      }
    }

    await this.prisma.forumFollow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    })

    return {
      followed: true,
      message: 'Đã theo dõi',
    }
  }

  async isFollowing(currentUserId: string, targetUserId: string) {
    if (!currentUserId) {
      throw new BadRequestException('Bạn chưa đăng nhập')
    }

    if (!targetUserId) {
      throw new BadRequestException('Thiếu ID người dùng')
    }

    const follow = await this.prisma.forumFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    })

    return { isFollowing: !!follow }
  }

  async getFollowers(userId: string) {
    const followers = await this.prisma.forumFollow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return followers.map((item) => item.follower)
  }

  async getFollowing(userId: string) {
    const following = await this.prisma.forumFollow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return following.map((item) => item.following)
  }
}