import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // 🟢 HÀM PHỤ: Tạo ra cặp Access Token & Refresh Token
  async getTokens(userId: number, email: string, roleId: number) {
    const payload = { sub: userId, email, roleId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  // 🚀 HÀM LÕI 1: Đăng nhập
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user)
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');

    const isPasswordMatched = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordMatched)
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');

    // Tạo cặp token mới
    const tokens = await this.getTokens(user.id, user.email, user.roleId);

    // Lưu Refresh Token xuống DB
    const hash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.updateRefreshToken(user.id, hash);

    // Tách password và refreshToken cũ ra khỏi thông tin trả về
    const { password, refreshToken, ...userInfo } = user;

    return {
      message: 'Đăng nhập thành công!',
      data: {
        user: userInfo,
        tokens: tokens,
      },
    };
  }

  // 🚀 HÀM LÕI 2: Cấp lại thẻ Token mới (ĐÃ ĐƯỢC TINH CHỈNH)
  async refreshTokens(rt: string) {
    try {
      // 1. Tự tay giải mã Refresh Token để lấy thông tin bên trong
      // Nếu Token hết hạn hoặc bị chế cháo, hàm verifyAsync sẽ ném lỗi và nhảy ngay xuống catch
      const payload = await this.jwtService.verifyAsync(rt);

      // 2. Lôi userId từ trong payload ra (nằm ở trường sub do hàm getTokens quy định)
      const userId = payload.sub;

      // 3. Tìm user trong Database
      const user = await this.usersService.findOne(userId);
      if (!user || !user.refreshToken) {
        throw new ForbiddenException('Truy cập bị từ chối');
      }

      // 4. So sánh Token gửi lên có khớp với Token đã mã hóa trong DB không
      const rtMatches = await bcrypt.compare(rt, user.refreshToken);
      if (!rtMatches) throw new ForbiddenException('Truy cập bị từ chối');

      // 5. Hợp lệ 100%! Tiến hành cấp thẻ mới và lưu lại
      const tokens = await this.getTokens(user.id, user.email, user.roleId);
      const hash = await bcrypt.hash(tokens.refresh_token, 10);
      await this.usersService.updateRefreshToken(user.id, hash);

      // Trả về chung một format chuẩn cho Frontend dễ hứng
      return {
        message: 'Làm mới Token thành công!',
        data: tokens,
      };
    } catch (error) {
      // Bắt tất cả các lỗi liên quan đến Token (hết hạn, sai chữ ký...)
      throw new ForbiddenException(
        'Refresh Token không hợp lệ hoặc đã hết hạn',
      );
    }
  }
}
