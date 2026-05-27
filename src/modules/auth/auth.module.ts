import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

// 👇 Đổi dòng import này dùng đường dẫn lùi ra một cấp (../)
import { UsersModule } from '../users/users.module'; // 👈 Chỉ dùng 1 dấu lùi (../)

@Module({
  imports: [
    UsersModule, // 👈 Gọi lại bình thường
    JwtModule.register({
      secret: 'SECRET_KEY_CUA_TIN_2026',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
