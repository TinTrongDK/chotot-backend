import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './filters/global-exception.filter'; // 👈 1. Import bộ lọc lỗi toàn cục vừa tạo

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Cấu hình kiểm duyệt dữ liệu đầu vào (DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các trường rác không được định nghĩa trong DTO
      transform: true, // Tự động ép kiểu dữ liệu đầu vào cho khớp với DTO
    }),
  );

  // 2. Kích hoạt phễu hứng lỗi toàn cục & hệ thống ghi log (PROD-003 & PROD-004)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 3. Cấu hình tài liệu API Swagger (Cập nhật tên chuyên nghiệp cho đồ án thương mại điện tử)
  const config = new DocumentBuilder()
    .setTitle('API Hệ Thống Thương Mại Điện Tử') // 👈 Đổi tên tiêu đề lớn
    .setDescription('Tài liệu tích hợp Backend cho nền tảng mua bán trực tuyến') // 👈 Đổi mô tả hệ thống
    .setVersion('1.0')
    .addBearerAuth() // Kích hoạt nút xác thực JWT (ổ khóa) trên giao diện
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Đường dẫn truy cập sẽ là /api

  // 4. Khởi chạy Server và cấu hình đọc cổng linh hoạt từ biến môi trường (PROD-001)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[🚀 SERVER] Ứng dụng đã khởi động thành công tại cổng: ${port}`);
}
bootstrap();
