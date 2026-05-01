import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ForumPostModule } from "./forum-post/forum-post.module";
import { ForumChatModule } from "./forum-chat/forum-chat.module";
import { ForumFollowModule } from "./forum-follow/forum-follow.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ForumPostModule,
    ForumChatModule,
    ForumFollowModule,
  ],
})
export class AppModule {}