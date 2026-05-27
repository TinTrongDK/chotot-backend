import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer'; // 👈 1. Import thêm Type ở đây
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'Tiêu đề hiển thị của tin đăng rao vặt',
    example: 'Bán nhanh iPhone 15 Pro Max 256GB màu Titan Tự Nhiên',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề tin đăng không được để trống' })
  title!: string;

  @ApiProperty({
    description: 'Nội dung mô tả chi tiết sản phẩm',
    example: '<h3>Máy đẹp 99%, nguyên zin chưa qua sửa chữa</h3>',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung tin đăng không được để trống' })
  content!: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Hình ảnh đại diện sản phẩm',
    required: false,
  })
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    description: 'Giá bán mong muốn của sản phẩm (Đơn vị: VNĐ)',
    example: 21500000,
    minimum: 0,
  })
  @Type(() => Number) // 👈 2. Ép kiểu String từ form-data thành Number
  @IsNumber({}, { message: 'Giá bán phải là định dạng số' })
  @Min(0, { message: 'Giá bán không được nhỏ hơn 0' })
  price!: number;

  @ApiProperty({
    description: 'Mã ID của danh mục sản phẩm',
    example: 1,
  })
  @Type(() => Number) // 👈 3. Ép kiểu String từ form-data thành Number
  @IsNumber({}, { message: 'ID Danh mục phải là định dạng số' })
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  categoryId!: number;
}
