import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class MediaService {
  // Hàm xử lý logic sau khi file đã được lưu
  uploadFile(file: Express.Multer.File) {
    // Nếu không có file được gửi lên
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để upload!');
    }

    // Trả về kết quả cho Client
    return {
      statusCode: 201,
      message: 'Upload ảnh thành công!',
      data: {
        // Trả về đường dẫn để Frontend lưu vào trường thumbnail của Post
        url: `uploads/${file.filename}`,
      },
    };
  }
}
