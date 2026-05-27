import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'; // 👈 Tích hợp Swagger

@ApiTags('Xác thực (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  @ApiResponse({
    status: 200,
    description: 'Trả về Access Token và Refresh Token',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 🟢 API MỚI: Cấp lại Token đã được tinh chỉnh
  @Post('refresh')
  @ApiOperation({ summary: 'Cấp lại Access Token mới bằng Refresh Token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  refreshTokens(@Body('refreshToken') refreshToken: string) {
    /* Lưu ý: 
      Thay vì truyền userId từ Controller (do không dùng Guard nên req.user sẽ rỗng),
      bạn chỉ cần truyền thẳng refreshToken xuống Service. 
      AuthService sẽ tự đi giải mã cái refreshToken này để lấy userId ra và kiểm tra tính hợp lệ.
    */
    return this.authService.refreshTokens(refreshToken);
  }
}
