import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 BẮT BUỘC PHẢI CÓ DÒNG NÀY để module khác dùng ké
})
export class PrismaModule {}
