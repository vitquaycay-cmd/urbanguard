import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

function toFloat(value: unknown): number {
  if (value === '' || value === undefined || value === null) {
    return Number.NaN;
  }
  if (typeof value === 'number') {
    return value;
  }
  return parseFloat(String(value));
}

/**
 * DTO cho multipart/form-data: latitude/longitude là số thực (Double) tương thích Leaflet / WGS84.
 */
export class CreateReportDto {
  @ApiProperty({ example: 'Ổ gà nguy hiểm tại ngã tư' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Mô tả chi tiết vị trí và mức độ sự cố giao thông.' })
  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  description: string;

  @ApiProperty({ example: 10.762622, type: Number, description: 'Vĩ độ (WGS84)' })
  @Transform(({ value }) => toFloat(value))
  @IsNumber({}, { message: 'latitude phải là số (Double)' })
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 106.660172, type: Number, description: 'Kinh độ (WGS84)' })
  @Transform(({ value }) => toFloat(value))
  @IsNumber({}, { message: 'longitude phải là số (Double)' })
  @Min(-180)
  @Max(180)
  longitude: number;
}
