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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';

// 👈 Thêm bộ Import của Swagger
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Danh mục (Categories)') // 👈 Gom nhóm trên giao diện Swagger
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // 🔴 KHÓA: Chỉ ai đăng nhập mới được tạo danh mục mới
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // 👈 Kích hoạt ổ khóa Swagger cho API này
  @ApiOperation({ summary: 'Thêm danh mục mới (Yêu cầu đăng nhập)' })
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // 🟢 MỞ: Ai cũng có thể xem danh mục
  @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục (Public)' })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // 🟢 MỞ: Xem chi tiết 1 danh mục
  @ApiOperation({ summary: 'Xem chi tiết 1 danh mục theo ID (Public)' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  // 🔴 KHÓA: Chỉ ai đăng nhập mới được sửa danh mục
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // 👈 Kích hoạt ổ khóa
  @ApiOperation({ summary: 'Cập nhật thông tin danh mục' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  // 🔴 KHÓA: Chỉ ai đăng nhập mới được xóa danh mục
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // 👈 Kích hoạt ổ khóa
  @ApiOperation({ summary: 'Xóa danh mục khỏi hệ thống' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
