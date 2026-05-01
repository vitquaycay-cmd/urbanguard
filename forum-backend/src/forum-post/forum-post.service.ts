import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto } from "./dto/create-post.dto";

@Injectable()
export class ForumPostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreatePostDto,
    files: Express.Multer.File[] = [],
  ) {
    return this.prisma.forumPost.create({
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
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            city: true,
            district: true,
          },
        },
        category: true,
        media: true,
      },
    });
  }

  async findAll() {
    return this.prisma.forumPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            city: true,
            district: true,
          },
        },
        category: true,
        media: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            city: true,
            district: true,
          },
        },
        category: true,
        media: true,
      },
    });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài viết");
    }

    return post;
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Không tìm thấy bài viết");
    }

    if (post.userId !== userId) {
      throw new ForbiddenException("Bạn không có quyền xoá bài viết này");
    }

    await this.prisma.forumPost.delete({
      where: { id: postId },
    });

    return {
      message: "Xoá bài viết thành công",
    };
  }
}