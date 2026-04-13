import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

/**
 * Trạng thái admin gửi lên — khớp giá trị lưu trong cột `reports.status` (VALIDATED | REJECTED).
 */
export enum AdminReportStatus {
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED', // Phẩn DEV C thêm: Thêm trạng thái RESOLVED cho flow
}

export class UpdateReportStatusDto {
  @ApiProperty({
    enum: AdminReportStatus,
    example: AdminReportStatus.VALIDATED,
    // [Cũ] Sửa: description cũ của Dev A (comment lại, không xoá):
    // description: 'VALIDATED → lưu VALIDATED trong DB và cộng reputation; REJECTED → từ chối báo cáo.',
    description:
      'VALIDATED → lưu VALIDATED trong DB và cộng reputation; REJECTED → từ chối; RESOLVED → đã khắc phục.',
  })
  @IsEnum(AdminReportStatus)
  status: AdminReportStatus;
}
