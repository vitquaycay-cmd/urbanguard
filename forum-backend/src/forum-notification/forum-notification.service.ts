import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ForumNotificationService {
  constructor(private prisma: PrismaService) {}

  // ================= CREATE =================
  async create(data: {
    receiverId: string;
    actorId?: string;
    type: string;
    title: string;
    message: string;
    postId?: string;
    commentId?: string;
    conversationId?: string;
    messageId?: string;
  }) {
    return this.prisma.forumNotification.create({
      data,
    });
  }

  // ================= GET ALL =================
  async getMyNotifications(userId: string) {
    return this.prisma.forumNotification.findMany({
      where: { receiverId: userId },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  // ================= COUNT UNREAD =================
  async countUnread(userId: string) {
    return this.prisma.forumNotification.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  // ================= MARK ONE =================
  async markAsRead(id: string) {
    return this.prisma.forumNotification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // ================= MARK ALL =================
  async markAllAsRead(userId: string) {
    return this.prisma.forumNotification.updateMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}