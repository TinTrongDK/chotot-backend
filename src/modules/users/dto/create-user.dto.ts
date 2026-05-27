import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 👈 Import Swagger

export class CreateUserDto {
  @ApiProperty({
    description:
      'Mã quyền hạn của người dùng (Ví dụ: 1 cho Admin, 2 cho Khách hàng)',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty({ message: 'Role ID is required' }) // Bổ sung check rỗng
  roleId!: number;

  @ApiProperty({
    description: 'Họ và tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A',
  })
  @IsString()
  @MinLength(4, { message: 'Name must be at least 4 characters long' }) // Cập nhật message cho chuẩn xác
  @IsNotEmpty({ message: 'The name is required' })
  name!: string;

  @ApiProperty({
    description: 'Địa chỉ Email dùng để đăng nhập',
    example: 'nguyenvana@gmail.com',
  })
  @IsEmail({}, { message: 'Invalid email format' }) // Bổ sung message lỗi định dạng
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description:
      'Mật khẩu bảo mật cấp độ cao (Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt)',
    example: 'StrongPass@2024',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Minimum 8 characters required' }) // 👈 Đã sửa số 4 thành 8 để khớp với câu thông báo
  @Matches(/(?=.*[a-z])/, {
    message: 'At least one lowercase character is required',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'At least one uppercase character is required',
  })
  @Matches(/(?=.*\d)/, {
    message: 'At least one digit is required',
  })
  @Matches(/(?=.*[@$!%*?&\-_#.,:;])/, {
    message: 'At least one special character is required (@$!%*?&)',
  })
  password!: string;
}
