import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/Login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.forumUser.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email đã tồn tại");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.forumUser.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
      },
    });

    return {
      message: "Đăng ký tài khoản forum thành công",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.forumUser.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Email không tồn tại");
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException("Sai mật khẩu");
    }

    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: "Đăng nhập thành công",
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}