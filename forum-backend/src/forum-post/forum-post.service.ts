import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { ForumNotificationService } from "../forum-notification/forum-notification.service";

@Injectable()
export class ForumPostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: ForumNotificationService,
  ) {}

  private includePost(userId?: string) {
    return {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          city: true,
          district: true,
          role: true,
        },
      },
      category: true,
      media: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc" as const,
        },
      },
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    };
  }

  async create(
    userId: string,
    dto: CreatePostDto,
    files: Express.Multer.File[] = [],
  ) {
    const post = await this.prisma.forumPost.create({
      data: {
        title: dto.title,
        content: dto.content,
        city: dto.city,
        district: dto.district,
        userId,
        categoryId: dto.categoryId,
        media: {
          create: files.map((file) => ({
            url: `/uploads/forum/${file.filename}`,
            type: file.mimetype.startsWith("video/") ? "video" : "image",
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          })),
        },
      },
      include: this.includePost(userId),
    });

    return {
      ...post,
      likedByMe: false,
      likes: undefined,
    };
  }

  async findAll(userId?: string) {
    const posts = await this.prisma.forumPost.findMany({
      include: this.includePost(userId),
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts.map((post: any) => ({
      ...post,
      likedByMe: Array.isArray(post.likes) && post.likes.length > 0,
      likes: undefined,
    }));
  }

  async findOne(id: string, userId?: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id },
      include: this.includePost(userId),
    });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài viết");
    }

    return {
      ...post,
      likedByMe:
        Array.isArray((post as any).likes) && (post as any).likes.length > 0,
      likes: undefined,
    };
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài viết");
    }

    const existingLike = await this.prisma.forumPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.$transaction([
        this.prisma.forumPostLike.delete({
          where: {
            id: existingLike.id,
          },
        }),
        this.prisma.forumPost.update({
          where: { id: postId },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
        }),
      ]);

      const updatedPost = await this.prisma.forumPost.findUnique({
        where: { id: postId },
        select: {
          likesCount: true,
        },
      });

      return {
        liked: false,
        likesCount: updatedPost?.likesCount || 0,
      };
    }

    await this.prisma.$transaction([
      this.prisma.forumPostLike.create({
        data: {
          postId,
          userId,
        },
      }),
      this.prisma.forumPost.update({
        where: { id: postId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      }),
    ]);

    if (post.userId !== userId) {
      await this.notificationService.create({
        receiverId: post.userId,
        actorId: userId,
        type: "LIKE",
        title: "Có người thích bài viết",
        message: "đã thích bài viết của bạn",
        postId: post.id,
      });
    }

    const updatedPost = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      select: {
        likesCount: true,
      },
    });

    return {
      liked: true,
      likesCount: updatedPost?.likesCount || 0,
    };
  }

  async addComment(postId: string, userId: string, content: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài viết");
    }

    if (!content || !content.trim()) {
      throw new ForbiddenException("Nội dung bình luận không được để trống");
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.forumComment.create({
        data: {
          postId,
          userId,
          content: content.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.forumPost.update({
        where: { id: postId },
        data: {
          commentsCount: {
            increment: 1,
          },
        },
      }),
    ]);

    if (post.userId !== userId) {
      await this.notificationService.create({
        receiverId: post.userId,
        actorId: userId,
        type: "COMMENT",
        title: "Có bình luận mới",
        message: "đã bình luận bài viết của bạn",
        postId: post.id,
        commentId: comment.id,
      });
    }

    return comment;
  }

  async sharePost(postId: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài viết");
    }

    const updatedPost = await this.prisma.forumPost.update({
      where: { id: postId },
      data: {
        sharesCount: {
          increment: 1,
        },
      },
      select: {
        sharesCount: true,
      },
    });

    return {
      sharesCount: updatedPost.sharesCount,
    };
  }

  async deletePost(postId: string, userId: string, role?: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài viết");
    }

    const isOwner = post.userId === userId;
    const isAdmin = role === "admin";

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        "Chỉ người đăng bài hoặc quản trị viên mới được xoá bài viết này",
      );
    }

    await this.prisma.forumPost.delete({
      where: { id: postId },
    });

    return {
      message: "Xoá bài viết thành công",
    };
  }

  async getStats() {
    const [postsCount, usersCount, commentsCount] = await Promise.all([
      this.prisma.forumPost.count(),
      this.prisma.forumUser.count(),
      this.prisma.forumComment.count(),
    ]);

    return {
      postsCount,
      usersCount,
      commentsCount,
      onlineCount: 0,
    };
  }

  async getFeaturedPosts() {
    return this.prisma.forumPost.findMany({
      take: 5,
      orderBy: [
        { likesCount: "desc" },
        { commentsCount: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        likesCount: true,
        commentsCount: true,
        createdAt: true,
      },
    });
  }

  async getTopUsers() {
    const users = await this.prisma.forumUser.findMany({
      take: 5,
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        city: true,
        district: true,
        posts: {
          select: {
            id: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      city: user.city,
      district: user.district,
      postsCount: user.posts.length,
    }));
  }
}