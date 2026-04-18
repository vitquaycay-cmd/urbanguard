import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryUsersDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  /** Lọc theo email / fullname / username / id */
  @ApiPropertyOptional({ description: 'Tìm kiếm (email, tên, username, hoặc id)' })
  @IsOptional()
  @IsString()
  search?: string;

  /** Lọc trạng thái khóa (query: true / false) */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isBanned?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page? = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit? = 10;
}