import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

// Hàm convert sang số (tránh lỗi form-data gửi string)
function toFloat(value: unknown): number {
  if (value === '' || value === undefined || value === null) {
    return Number.NaN;
  }
  if (typeof value === 'number') {
    return value;
  }
  return parseFloat(String(value));
}

export class CreateReportDto {
  @ApiProperty({ example: 'Ổ gà nguy hiểm tại ngã tư' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Mô tả chi tiết vị trí và mức độ sự cố giao thông.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10000)
  description: string;

  @ApiProperty({
    example: 10.762622,
    type: Number,
    description: 'Vĩ độ (latitude) -90 đến 90',
  })
  @Transform(({ value }) => toFloat(value))
  @Type(() => Number)
  @IsNumber({}, { message: 'latitude phải là số hợp lệ' })
  @Min(-90, { message: 'latitude không được nhỏ hơn -90' })
  @Max(90, { message: 'latitude không được lớn hơn 90' })
  latitude: number;

  @ApiProperty({
    example: 106.660172,
    type: Number,
    description: 'Kinh độ (longitude) -180 đến 180',
  })
  @Transform(({ value }) => toFloat(value))
  @Type(() => Number)
  @IsNumber({}, { message: 'longitude phải là số hợp lệ' })
  @Min(-180, { message: 'longitude không được nhỏ hơn -180' })
  @Max(180, { message: 'longitude không được lớn hơn 180' })
  longitude: number;
}
