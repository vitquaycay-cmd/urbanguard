import { PrismaService } from "../prisma/prisma.service";
import { QueryUsersDto } from "./dto/query-users.dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(query: QueryUsersDto) {
    // Lấy các query params từ request (filter + phân trang)
    const { role, page = 1, limit = 10 } = query;

    // Lấy các query params từ request (filter + phân trang)
    const skip = (page - 1) * limit;

    // Tạo điều kiện filter:
    // - Nếu có role → lọc theo role
    // - Nếu không → lấy tất cả user
    const where = role ? { role } : {};

    // Gọi database:
    // - findMany: lấy danh sách user theo page
    // - count: đếm tổng số user (phục vụ pagination)
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // sắp xếp user mới nhất lên đầu
        select: {
          id: true,
          email: true,
          password: false,
          role: true,
          reputationScore: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data, // danh sách user
      total, // tổng số user (có filter)
      page, // trang hiện tại
      limit, // trang hiện tại
      totalPages: Math.ceil(total / limit), // tổng số trang
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
}
