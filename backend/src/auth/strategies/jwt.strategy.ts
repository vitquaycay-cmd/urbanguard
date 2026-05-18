import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

export type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = config.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // Validate against DB on each protected request so role/ban changes apply before token expiry.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        reputationScore: true,
        isBanned: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.isBanned) {
      throw new UnauthorizedException("Tài khoản đã bị khóa");
    }
    // Keep req.user limited to fields the rest of the app actually needs.
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      reputationScore: user.reputationScore,
    };
  }
}
