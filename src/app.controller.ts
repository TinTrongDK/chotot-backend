import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger'; // 👈 Bổ sung import từ Swagger

@ApiTags('Trang chủ & Hệ thống') // 👈 Nhóm API này lại trên giao diện Swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. API mặc định của NestJS (Đường dẫn gốc: / )
  @Get()
  @ApiOperation({ summary: 'Trang lời chào mặc định' })
  getHello(): string {
    return this.appService.getHello();
  }

  // 2. API Khám sức khỏe dành cho UptimeRobot (Đường dẫn: /health )
  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của Server' })
  checkHealth() {
    return {
      status: 'OK',
      message: 'Server Backend đang hoạt động bình thường!',
      timestamp: new Date().toISOString(),
    };
  }
}
