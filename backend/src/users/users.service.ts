import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getModuleInfo() {
    return { module: 'users', note: 'Quản lý người dùng & reputation — sẽ nối Prisma ở giai đoạn 01.' };
  }
}
