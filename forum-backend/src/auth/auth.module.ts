import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: "secret",
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [AuthController], // 🔥 BẮT BUỘC PHẢI CÓ
  providers: [AuthService],
  exports: [JwtModule], // 
})
export class AuthModule {}