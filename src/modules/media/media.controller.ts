import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Media - Quản lý File') // Nhóm API trong Swagger
@Controller('media')
export class MediaController {
  // Tiêm MediaService vào Controller
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload hình ảnh lên hệ thống' })
  @ApiConsumes('multipart/form-data') // Bắt buộc để Swagger nhận diện form upload file
  @ApiBody({
    description: 'Chọn một file ảnh định dạng png, jpg, jpeg hoặc gif',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // Hiển thị nút "Choose File" trên Swagger
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      // 1. Cấu hình nơi lưu và tên file
      storage: diskStorage({
        destination: './uploads', // Lưu vào thư mục uploads ở ngoài cùng dự án
        filename: (req, file, callback) => {
          // Tạo tên ngẫu nhiên: Thời gian hiện tại + số random
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname); // Lấy đuôi file (.png, .jpg)
          callback(null, `file-${uniqueSuffix}${ext}`);
        },
      }),
      // 2. Bộ lọc bảo mật: Chỉ cho phép định dạng ảnh
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException(
              'Hệ thống chỉ chấp nhận định dạng file ảnh!',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Đẩy file đã nhận xuống cho Service xử lý tiếp
    return this.mediaService.uploadFile(file);
  }
}
