import { Module } from "@nestjs/common";
import { ForumChatService } from "./forum-chat.service";
import { ForumChatController } from "./forum-chat.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module"; // 👈 thêm dòng này

@Module({
  imports: [
    PrismaModule,
    AuthModule, // 👈 thêm vào đây
  ],
  controllers: [ForumChatController],
  providers: [ForumChatService],
})
export class ForumChatModule {}