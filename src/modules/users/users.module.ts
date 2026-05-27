import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // 👈 Dùng 2 dấu lùi (../../)

@Module({
  imports: [PrismaModule], // 👈 THÊM DÒNG NÀY ĐỂ GIẢI QUYẾT LỖI
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 👈 CỰC KỲ QUAN TRỌNG: Phải có dòng này để cho Module khác xài ké
})
export class UsersModule {}
