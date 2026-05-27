import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 👈 Import thư viện Swagger

export class LoginDto {
  @ApiProperty({
    description: 'Địa chỉ Email đã đăng ký tài khoản',
    example: 'nguyenvana@gmail.com', // 👈 Điền sẵn email mẫu để test nhanh
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập tài khoản',
    example: 'StrongPass@2024', // 👈 Nên để example khớp với mật khẩu lúc CreateUser
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password!: string;
}
