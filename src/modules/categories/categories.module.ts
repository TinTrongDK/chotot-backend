import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // 👈 Import Prisma

@Module({
  imports: [PrismaModule], // 👈 Nạp vào đây
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
