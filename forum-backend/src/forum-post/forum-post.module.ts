import { Module } from "@nestjs/common";
import { ForumPostController } from "./forum-post.controller";
import { ForumPostService } from "./forum-post.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { ForumNotificationModule } from "../forum-notification/forum-notification.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ForumNotificationModule,
  ],
  controllers: [ForumPostController],
  providers: [ForumPostService],
})
export class ForumPostModule {}