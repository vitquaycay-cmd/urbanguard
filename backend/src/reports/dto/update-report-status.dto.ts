import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

/**
 * Trạng thái admin gửi lên — khớp giá trị lưu trong cột `reports.status` (VALIDATED | REJECTED).
 */
export enum AdminReportStatus {
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
}

export class UpdateReportStatusDto {
  @ApiProperty({
    enum: AdminReportStatus,
    example: AdminReportStatus.VALIDATED,
    description:
      'VALIDATED → lưu VALIDATED trong DB và cộng reputation; REJECTED → từ chối báo cáo.',
  })
  @IsEnum(AdminReportStatus)
  status: AdminReportStatus;
}
