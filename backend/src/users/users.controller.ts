import { Controller, Get, Patch, Param, Body, ParseIntPipe } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { QueryUsersDto } from "./dto/query-users.dto";
import {UpdateRoleDto} from "./dto/update-role.dto"
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "..." })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 })
  users(@Query() dto: QueryUsersDto) {
    return this.usersService.findAll(dto);
  }

  // PATCH /api/users/:id/role
  // Chỉ ADMIN mới được gọi endpoint này
  @Patch(":id/role")
  @UseGuards(JwtAuthGuard, RolesGuard) // Guard 1: kiểm tra JWT hợp lệ, Guard 2: kiểm tra role ADMIN
  @Roles(Role.ADMIN) // Khai báo role được phép — RolesGuard đọc metadata này
  @ApiBearerAuth()
  @ApiOperation({ summary: "Admin: gán role cho user" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403 }) 
  @ApiResponse({ status: 404, description: "User không tồn tại" }) // NotFoundException từ service
  updateRole(
    @Param("id", ParseIntPipe) id: number, // Lấy :id từ URL, ParseIntPipe ép string → number tự động
    @Body() dto: UpdateRoleDto, // Lấy { role } từ request body
  ) {
    // Gọi service xử lý logic: tìm user → cập nhật role → trả về user mới
    return this.usersService.updateRole(id, dto.role);
  }
}
