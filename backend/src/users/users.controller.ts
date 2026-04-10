import { Controller, Get} from "@nestjs/common";
import { UsersService } from "./users.service";
import { Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { QueryUsersDto } from "./dto/query-users.dto";
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
}
