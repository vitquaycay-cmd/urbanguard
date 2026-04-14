import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LogoutDto } from "./dto/logout.dto";
import { JwtPayload } from "./strategies/jwt.strategy";
import { ConfigService } from "@nestjs/config";

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException("Email đã được sử dụng");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: passwordHash,
          role: Role.USER,
        },
        select: {
          id: true,
          email: true,
          role: true,
          reputationScore: true,
        },
      });
      return user;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("Email đã được sử dụng");
      }
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }
    // Kiểm tra tài khoản có bị khóa không
    if (user.isBanned) {
      throw new ForbiddenException(
        "Tài khoản đã bị khóa. Vui lòng liên hệ admin.",
      );
    }

    // Tạo cặp token mới và lưu refresh token vào DB
    const { access_token, refresh_token } = this.generateTokens(user);
    await this.saveRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        reputationScore: user.reputationScore,
      },
    };
  }

  private generateTokens(user: { id: number; email: string; role: Role }) {
    // Payload là dữ liệu được mã hóa bên trong token
    // Khi giải mã token sẽ biết được token này thuộc về ai (id, email, role)
    // sub = subject — quy ước JWT, thường là id của user
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    // Access token — sống ngắn (15p theo JWT_EXPIRES_IN trong .env)
    // Không truyền options → jwtService dùng JWT_SECRET và JWT_EXPIRES_IN đã cấu hình sẵn trong AuthModule
    const access_token = this.jwtService.sign(payload);

    // Refresh token — sống dài (7 ngày theo JWT_REFRESH_EXPIRES_IN trong .env)
    // Dùng secret RIÊNG (JWT_REFRESH_SECRET) để 2 loại token không hoán đổi được cho nhau
    // configService.get() đọc giá trị từ file .env
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN"),
    });

    return { access_token, refresh_token };
  }

  // Lưu refresh token vào DB sau khi tạo
  // Mục đích: khi client gửi refresh token lên, server tra DB kiểm tra có tồn tại và còn hạn không
  private async saveRefreshToken(userId: number, token: string) {
    const count = await this.prisma.refreshToken.count({ where: { userId } });
    if (count >= 3) {
      const oldest = await this.prisma.refreshToken.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      if (oldest) {
        await this.prisma.refreshToken.delete({ where: { id: oldest.id } });
      }
    }
    // Tính thời điểm hết hạn = hiện tại + 7 ngày
    // Dùng để check khi client gọi POST /auth/refresh
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Lưu vào bảng refresh_tokens
    return this.prisma.refreshToken.create({
      data: {
        token, // giá trị refresh token
        userId, // id của user sở hữu token này
        expiresAt, // thời điểm hết hạn vừa tính ở trên
      },
    });
  }

  async refresh(token: string) {
    //Tìm token trong DB
    const record = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!record) throw new UnauthorizedException("Refresh token không hợp lệ");

    // Xóa token hết hạn khỏi DB trước (là rác, giữ lại vô nghĩa) rồi mới throw
    if (record.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { token } });
      throw new UnauthorizedException("Refresh token đã hết hạn");
    }

    //Tìm user sở hữu token
    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
    });
    if (!user) throw new UnauthorizedException("Không tim thấy user");

    // Mỗi lần refresh phải hủy token cũ → tránh dùng lại nhiều lần
    await this.prisma.refreshToken.delete({ where: { token } });

    //Tạo cặp token mới, lưu refresh token mới vào DB
    const { access_token, refresh_token } = this.generateTokens(user);
    await this.saveRefreshToken(user.id, refresh_token);
    return { access_token, refresh_token };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    // Tìm user theo id — lấy password hash để so sánh
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Không tìm thấy user");
    // So sánh mật khẩu cũ user nhập với hash trong DB
    const match = await bcrypt.compare(dto.oldPassword, user.password);
    if (!match) throw new UnauthorizedException("Mật khẩu không đúng");
    // Hash mật khẩu mới trước khi lưu — không bao giờ lưu plain text
    const newHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    // Chỉ update trường password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHash },
    });

    return { message: "Đổi mật khẩu thành công" };
  }

  async logout(token: string) {
    // Tìm refresh token trong DB
    // Nếu không tìm thấy → token giả hoặc đã bị xóa trước đó
    const record = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!record) throw new UnauthorizedException("Refresh token không hợp lệ");
    // Xóa refresh token khỏi DB
    // Sau khi xóa, dù token chưa hết hạn cũng không thể refresh được nữa
    await this.prisma.refreshToken.delete({ where: { token } });

    return { message: "Đăng xuất thành công" };
  }
}
