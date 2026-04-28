import { Module } from "@nestjs/common";
import { ForumPostController } from "./forum-post.controller";
import { ForumPostService } from "./forum-post.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ForumPostController],
  providers: [ForumPostService],
})
export class ForumPostModule {}