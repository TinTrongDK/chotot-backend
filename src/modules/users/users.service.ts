import {
  ConflictException,
  Injectable,
  NotFoundException, // 👈 Thêm thư viện bắt lỗi 404
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/prisma/prisma.service'; // 👈 Dùng Path Alias chuẩn
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: passwordHash,
        roleId: createUserDto.roleId,
      },
    });

    // 🌟 THỦ THUẬT PRO: Tách password ra khỏi object user, chỉ lấy các thông tin còn lại
    const { password, ...userInfo } = user;

    // Trả về format chuẩn có thông báo
    return {
      message: 'Đăng ký thành công!',
      data: userInfo,
    };
  }

  // 🟢 HÀM BỔ SUNG: Dành riêng cho AuthModule gọi sang để Đăng nhập
  async findByEmail(email: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
    });

    // 👈 Bắt lỗi: Nếu tìm không thấy thì báo 404 luôn, không cho chạy tiếp
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // 👈 Tận dụng hàm findOne ở trên để kiểm tra xem ID có thật không trước khi sửa
    await this.findOne(id);

    return await this.prismaService.user.update({
      where: { id: id },
      data: updateUserDto,
    });
  }

  async remove(id: number): Promise<User> {
    // 1. Kiểm tra xem User có tồn tại không trước khi xóa
    await this.findOne(id);

    // 🌟 2. THÊM BƯỚC NÀY: Xóa sạch toàn bộ bài đăng của User này trước để gỡ lỗi khóa ngoại
    await this.prismaService.post.deleteMany({
      where: { userId: id },
    });

    // 3. Bây giờ thì có thể xóa User một cách an toàn mà không bị MySQL chửi nữa
    return await this.prismaService.user.delete({
      where: { id: id },
    });
  }
  // 🟢 HÀM BỔ SUNG: Dành riêng cho AuthModule cập nhật Refresh Token
  async updateRefreshToken(
    id: number,
    refreshToken: string | null,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: { id: id },
      data: { refreshToken: refreshToken },
    });
  }
}
