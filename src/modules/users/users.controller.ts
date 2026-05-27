import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport'; // Import thư viện bảo vệ
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'; // 👈 Import Swagger

@ApiTags('Người dùng (Users)') // 👈 Gom nhóm trên giao diện Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🟢 ĐỂ MỞ: Hàm Đăng ký (Ai cũng gọi được để tạo tài khoản)
  @Post()
  @ApiOperation({ summary: 'Tạo tài khoản người dùng mới (Public)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 🔴 KHÓA LẠI: Yêu cầu phải có Token hợp lệ
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // 👈 Kích hoạt biểu tượng ổ khóa cho API này
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (Yêu cầu Token)' })
  findAll() {
    return this.usersService.findAll();
  }

  // 🔴 KHÓA LẠI + Tinh chỉnh ParseIntPipe an toàn
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một người dùng theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // 🔴 KHÓA LẠI + Tinh chỉnh ParseIntPipe an toàn
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // 🔴 KHÓA LẠI + Tinh chỉnh ParseIntPipe an toàn
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng khỏi hệ thống' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
