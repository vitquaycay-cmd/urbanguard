import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) { }

  async getOverview() {
    // 1. Nhóm theo trạng thái và đếm số lượng
    const statusCounts = await this.prisma.report.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    let totalReports = 0;
    const byStatus = {
      PENDING: 0,
      VALIDATED: 0,
      VERIFIED: 0,
      RESOLVED: 0,
      REJECTED: 0,
    };

    // 2. Tích luỹ tổng số lượng
    statusCounts.forEach((item) => {
      totalReports += item._count.id;
      // Ép kiểu an toàn hoặc gán trực tiếp vào object bằng key
      const statusKey = item.status as keyof typeof byStatus;
      byStatus[statusKey] = item._count.id;
    });

    // 3. Truy vấn report tự động duyệt (Giả định: VALIDATED và trustScore cao do AI đánh giá)
    // Tạm dùng điều kiện trustScore > 80 vì schema chưa có cập nhật isAutoValidated
    const autoValidatedCount = await this.prisma.report.count({
      where: {
        status: 'VALIDATED',
        trustScore: {
          gt: 80,
        },
      },
    });

    // 4. Tính toán tỷ lệ phần trăm an toàn (tránh lỗi chia cho 0)
    const autoValidatedRate = totalReports > 0 ? (autoValidatedCount / totalReports) * 100 : 0;

    return {
      total: totalReports,
      autoValidatedRate: parseFloat(autoValidatedRate.toFixed(2)),
      byStatus,
    };
  }

  getModuleInfo() {
    return { module: 'statistics', note: 'Thống kê báo cáo, vote — truy vấn aggregate sau khi có DB.' };
  }
}
console.log('DB URL:', process.env.DATABASE_URL);