import { Module } from "@nestjs/common";
import { ForumChatService } from "./forum-chat.service";
import { ForumChatController } from "./forum-chat.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { ForumNotificationModule } from "../forum-notification/forum-notification.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ForumNotificationModule, // 🔥 thêm dòng này
  ],
  controllers: [ForumChatController],
  providers: [ForumChatService],
})
export class ForumChatModule {}