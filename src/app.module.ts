import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// --- HẠ TẦNG (Infrastructure) ---
import { PrismaModule } from './prisma/prisma.module';

// --- NGHIỆP VỤ (Feature Modules) ---
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PostsModule } from './modules/posts/posts.module';
// Giữ lại đúng 1 dòng import chuẩn xác này:
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    // 1. CẤU HÌNH HỆ THỐNG & HẠ TẦNG (Global/Core)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,

    // 2. CÁC MODULE NGHIỆP VỤ CHÍNH (Features)
    AuthModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    PostsModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
