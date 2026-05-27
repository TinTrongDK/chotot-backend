import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // 👈 Không truyền gì vào nghĩa là hứng TẤT CẢ mọi loại lỗi
export class GlobalExceptionFilter implements ExceptionFilter {
  // PROD-004: Khởi tạo hệ thống ghi log của NestJS
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Phân loại lỗi: Nếu là lỗi hệ thống biết trước (HttpException) thì lấy mã lỗi đó, không thì mặc định là 500 (Lỗi server)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Trích xuất câu thông báo lỗi
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Đã xảy ra sự cố trên máy chủ (Internal Server Error)';

    // 🔴 PROD-004: Ghi log chi tiết lỗi ra Terminal để Backend dễ debug
    this.logger.error(`[${request.method}] ${request.url} - Status: ${status}`);
    this.logger.error(exception); // In chi tiết nguyên nhân lỗi

    // 🟢 PROD-003: Định dạng lại cục dữ liệu JSON sạch sẽ để gửi về cho Frontend Vue.js
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message['message'] || message, // Lấy câu chữ thân thiện với người dùng
    });
  }
}
