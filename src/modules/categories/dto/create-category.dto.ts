import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 👈 Import thư viện Swagger

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Tên của danh mục sản phẩm (Dùng để phân loại tin đăng)',
    example: 'Đồ điện tử & Máy tính',
  })
  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name!: string;

  @ApiProperty({
    description: 'Mô tả chi tiết hoặc ghi chú về danh mục này',
    example:
      'Bao gồm điện thoại thoại di động, laptop, máy tính bảng và linh kiện điện tử...',
    required: false, // 👈 Báo cho Swagger biết trường này không bắt buộc nhập
  })
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;
}
