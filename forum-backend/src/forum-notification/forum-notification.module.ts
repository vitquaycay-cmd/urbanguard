import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { ForumNotificationService } from "./forum-notification.service";
import { ForumNotificationController } from "./forum-notification.controller";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  providers: [ForumNotificationService],
  controllers: [ForumNotificationController],
  exports: [ForumNotificationService], // 🔥 để module khác dùng
})
export class ForumNotificationModule {}