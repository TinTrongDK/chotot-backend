import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  // 1. Tạo danh mục mới
  async create(createCategoryDto: CreateCategoryDto) {
    return await this.prismaService.category.create({
      data: createCategoryDto,
    });
  }

  // 2. Lấy toàn bộ danh mục (Sau này cho cả User và Admin xem)
  async findAll() {
    return await this.prismaService.category.findMany();
  }

  // 3. Lấy chi tiết 1 danh mục theo ID
  async findOne(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục có ID bằng ${id}`);
    }
    return category;
  }

  // 4. Cập nhật danh mục
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id); // Kiểm tra xem danh mục có tồn tại không trước khi sửa
    return await this.prismaService.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  // 5. Xóa danh mục
  async remove(id: number) {
    await this.findOne(id); // Kiểm tra xem có tồn tại không trước khi xóa
    return await this.prismaService.category.delete({ where: { id } });
  }
}
