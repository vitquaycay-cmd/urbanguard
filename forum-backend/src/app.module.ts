import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ForumPostModule } from "./forum-post/forum-post.module";

@Module({
  imports: [PrismaModule, AuthModule, ForumPostModule],
})
export class AppModule {}