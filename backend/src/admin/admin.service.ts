import { Injectable } from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where = { status: ReportStatus.PENDING };

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          latitude: true,
          longitude: true,
          imageUrl: true,
          status: true,
          trustScore: true,
          aiSummary: true,
          aiLabels: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              email: true,
              reputationScore: true,
            },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
