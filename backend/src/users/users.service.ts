import { PrismaService } from "../prisma/prisma.service";
import { QueryUsersDto } from "./dto/query-users.dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private buildUserWhere(
    query: QueryUsersDto,
    opts?: { includeBannedFilter?: boolean },
  ): Prisma.UserWhereInput {
    const { role, search, isBanned } = query;
    const includeBanned = opts?.includeBannedFilter !== false;

    const searchTrim = search?.trim();
    const idNum =
      searchTrim && /^\d+$/.test(searchTrim)
        ? parseInt(searchTrim, 10)
        : undefined;

    const searchOr: Prisma.UserWhereInput[] | undefined = searchTrim
      ? [
          { email: { contains: searchTrim } },
          { fullname: { contains: searchTrim } },
          { username: { contains: searchTrim } },
          ...(idNum !== undefined ? [{ id: idNum }] : []),
        ]
      : undefined;

    const whereBase: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(searchOr ? { OR: searchOr } : {}),
    };

    if (includeBanned && typeof isBanned === "boolean") {
      return { ...whereBase, isBanned };
    }
    return whereBase;
  }

  async findAll(query: QueryUsersDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const whereBase = this.buildUserWhere(query, { includeBannedFilter: false });
    const whereList = this.buildUserWhere(query, { includeBannedFilter: true });

    const [
      data,
      total,
      totalUsers,
      activeUsers,
      bannedUsers,
    ] = await Promise.all([
      this.prisma.user.findMany({
        where: whereList,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          username: true,
          fullname: true,
          role: true,
          reputationScore: true,
          createdAt: true,
          isBanned: true,
        },
      }),
      this.prisma.user.count({ where: whereList }),
      this.prisma.user.count({ where: whereBase }),
      this.prisma.user.count({
        where: { ...whereBase, isBanned: false },
      }),
      this.prisma.user.count({
        where: { ...whereBase, isBanned: true },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
      stats: {
        totalUsers,
        activeUsers,
        bannedUsers,
      },
    };
  }
  async updateRole(id: number, role: Role) {
    // Kiểm tra user có tồn tại không
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User không tồn tại");
    // Cập nhật role và trả về user sau khi cập nhật
    return this.prisma.user.update({
      where: { id }, // tìm đúng user theo id
      data: { role }, // chỉ cập nhật trường role, các trường khác giữ nguyên
      select: {
        id: true,
        email: true,
        role: true,
        password: false,
        reputationScore: true,
        createdAt: true,
      },
    });
  }

  async getProfile(id: number) {
    const [user, totalReports] = await Promise.all([
      // Query 1: lấy thông tin user, select để không trả password ra ngoài
      this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          reputationScore: true,
          createdAt: true,
        },
      }),
      // Query 2: đếm tổng số báo cáo user đã gửi
      this.prisma.report.count({
        where: { userId: id },
      }),
    ]);
    if (!user) throw new NotFoundException("Khoong tìm thấy user");
    return { ...user, totalReports };
  }

  async banUser(id: number, isBanned: boolean){
    const user=await this.prisma.user.findUnique({where: {id}})
    if (!user) throw new NotFoundException('Không tìm thấy người dùng')

    await this.prisma.user.update({
      where: {id}, data:{isBanned}
    })

    return {message: isBanned ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản'}
  }
}
