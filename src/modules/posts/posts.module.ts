import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../../prisma/prisma.module'; // 👈 Import Prisma

@Module({
  imports: [PrismaModule], // 👈 Nạp vào đây
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
