import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("Thiếu token");
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Token không hợp lệ");
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || "forum_secret_123456",
      });

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Token hết hạn hoặc không hợp lệ");
    }
  }
}