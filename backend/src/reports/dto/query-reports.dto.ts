import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ReportStatus } from '@prisma/client';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ReportSortBy {
  CREATED_AT = 'createdAt',
  TRUST_SCORE = 'trustScore',
  STATUS = 'status',
}

export class QueryReportsDto {
  @ApiPropertyOptional({
    enum: ReportStatus,
    example: ReportStatus.PENDING,
    description: 'Lọc theo trạng thái báo cáo',
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    description: 'Lọc theo userId của người tạo báo cáo',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'ổ gà',
    description: 'Tìm kiếm theo title hoặc description',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    minimum: 1,
    description: 'Trang hiện tại (bắt đầu từ 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 20,
    minimum: 1,
    maximum: 100,
    description: 'Số bản ghi mỗi trang (tối đa 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: ReportSortBy,
    example: ReportSortBy.CREATED_AT,
    description: 'Trường dùng để sắp xếp',
  })
  @IsOptional()
  @IsEnum(ReportSortBy)
  sortBy?: ReportSortBy = ReportSortBy.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Chiều sắp xếp: asc (tăng dần) | desc (giảm dần)',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
