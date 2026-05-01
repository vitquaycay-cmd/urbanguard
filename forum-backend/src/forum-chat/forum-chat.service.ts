import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ForumChatService {
  constructor(private prisma: PrismaService) {}

  // ================= START CHAT =================
  async startConversation(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new Error("Không thể chat với chính mình");
    }

    const userOneId =
      currentUserId < targetUserId ? currentUserId : targetUserId;
    const userTwoId =
      currentUserId < targetUserId ? targetUserId : currentUserId;

    let conversation = await this.prisma.forumConversation.findUnique({
      where: {
        userOneId_userTwoId: {
          userOneId,
          userTwoId,
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.forumConversation.create({
        data: {
          userOneId,
          userTwoId,
        },
      });
    }

    return conversation;
  }

  // ================= GET CONVERSATIONS =================
  async getConversations(userId: string) {
    const conversations = await this.prisma.forumConversation.findMany({
      where: {
        OR: [{ userOneId: userId }, { userTwoId: userId }],
      },
      include: {
        userOne: true,
        userTwo: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return conversations.map((conv) => {
      const otherUser =
        conv.userOneId === userId ? conv.userTwo : conv.userOne;

      return {
        id: conv.id,
        user: {
          id: otherUser.id,
          fullName: otherUser.fullName,
          avatarUrl: otherUser.avatarUrl,
        },
        lastMessage: conv.messages[0] || null,
      };
    });
  }

  // ================= GET MESSAGES =================
  async getMessages(conversationId: string) {
    const messages = await this.prisma.forumMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return messages;
  }

  // ================= SEND MESSAGE =================
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ) {
    const conversation = await this.prisma.forumConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
    }

    const message = await this.prisma.forumMessage.create({
      data: {
        conversationId,
        senderId,
        content,
      },
    });

    await this.prisma.forumConversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  }
}