import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto } from "./dto/create-post.dto";

@Injectable()
export class ForumPostService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    return this.prisma.forumPost.create({
      data: {
        title: dto.title,
        content: dto.content,
        city: dto.city,
        district: dto.district,
        userId: userId,
        categoryId: "default", // tạm thời
      },
    });
  }
}