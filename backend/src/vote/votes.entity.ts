import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 🔗 KẾT NỐI: Vote Feature Logic (Refactored)
 * Toàn bộ logic Vote tập trung tại file Entity này (theo yêu cầu của bạn).
 * Mặc dù tên file là .entity.ts, nó hoạt động như một Service để xử lý Database.
 */
@Injectable()
export class VoteService {
  constructor(private readonly prisma: PrismaService) {}

  async voteReport(
    userId: number,
    reportId: number,
    type: 'UPVOTE' | 'DOWNVOTE',
  ) {
    // 1. Kiểm tra báo cáo tồn tại
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, status: true },
    });

    if (!report) {
      throw new NotFoundException(`Không tìm thấy báo cáo #${reportId}`);
    }

    // 2. Tìm vote cũ của user cho báo cáo này
    const existing = await this.prisma.vote.findUnique({
      where: {
        userId_reportId: { userId, reportId },
      },
    });

    let result;
    if (!existing) {
      // TRƯỜNG HỢP 1: Chưa vote bao giờ -> Tạo mới
      result = await this.prisma.vote.create({
        data: { userId, reportId, type },
      });
    } else if (existing.type === type) {
      // TRƯỜNG HỢP 2: Vote trùng loại đã có -> XOÁ (Toggle off)
      await this.prisma.vote.delete({
        where: { id: existing.id },
      });
      result = { message: 'Đã bỏ bình chọn', type: null };
    } else {
      // TRƯỜNG HỢP 3: Vote khác loại đã có -> Cập nhật (Change vote)
      result = await this.prisma.vote.update({
        where: { id: existing.id },
        data: { type },
      });
    }

    // 🔗 KẾT NỐI: Sau khi vote xong, tính toán lại điểm tin cậy
    const updatedReport = await this.recalculateTrustScore(reportId);

    return {
      vote: result,
      newTrustScore: updatedReport.trustScore,
    };
  }

  /**
   * Tính toán lại trustScore = BaseScore + (Upvotes - Downvotes).
   */
  private async recalculateTrustScore(reportId: number) {
    // Đếm số lượng upvote và downvote
    const voteCounts = await this.prisma.vote.groupBy({
      by: ['type'],
      where: { reportId },
      _count: { id: true },
    });

    const upvotes = voteCounts.find((v) => v.type === 'UPVOTE')?._count.id || 0;
    const downvotes = voteCounts.find((v) => v.type === 'DOWNVOTE')?._count.id || 0;

    // Lấy base score: nếu đã VALIDATED thì base là 15, còn lại là 0.
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: { status: true },
    });

    const baseScore = report?.status === 'VALIDATED' ? 15 : 0;
    const newScore = baseScore + upvotes - downvotes;

    // Cập nhật vào DB
    return this.prisma.report.update({
      where: { id: reportId },
      data: { trustScore: newScore },
      select: { id: true, status: true, trustScore: true },
    });
  }
}