import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Throttle } from "@nestjs/throttler";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Đăng ký — mật khẩu được hash bcrypt trước khi lưu MySQL",
  })
  @ApiResponse({ status: 201, description: "Tạo tài khoản thành công" })
  @ApiResponse({ status: 409, description: "Email đã tồn tại" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ auth: { limit: 5, ttl: 60000 } })
  @Post("login")
  @ApiOperation({ summary: "Đăng nhập — trả về JWT Bearer token" })
  @ApiResponse({ status: 200, description: "Đăng nhập thành công" })
  @ApiResponse({ status: 401, description: "Sai thông tin đăng nhập" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Thông tin user hiện tại (JWT)" })
  me(@Req() req: Request) {
    return req.user;
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Làm mới token — đổi refresh token lấy cặp token mới",
  })
  @ApiResponse({
    status: 200,
    description: "Trả về access_token và refresh_token mới",
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token không hợp lệ hoặc hết hạn",
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }
}
