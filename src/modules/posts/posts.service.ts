import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../../prisma/prisma.service';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  // 1. Tạo bài đăng (Đã tích hợp Diệt XSS và Ép kiểu Form-data)
  async create(
    userId: number,
    createPostDto: CreatePostDto,
    thumbnailUrl: string | null,
  ) {
    // Rửa sạch mã độc từ Editor
    const cleanContent = sanitizeHtml(createPostDto.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: false,
    });

    return await this.prismaService.post.create({
      data: {
        title: createPostDto.title,
        content: cleanContent,
        thumbnail: thumbnailUrl, // Lấy từ Controller truyền sang
        price: parseFloat(createPostDto.price as any), // Ép kiểu vì form-data gửi lên là String
        categoryId: parseInt(createPostDto.categoryId as any, 10),
        userId: userId,
      },
    });
  }

  // 2. 🟢 Lấy danh sách (Đã fix lỗi ép kiểu Page/Limit để phân trang chuẩn)
  async findAll(query: { page?: any; limit?: any; keyword?: string }) {
    // Nếu Frontend không gửi lên, mặc định là trang 1, mỗi trang 10 bài
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const keyword = query.keyword || '';
    const skip = (page - 1) * limit;

    const whereCondition = keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { content: { contains: keyword } },
          ],
        }
      : {};

    const posts = await this.prismaService.post.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      include: {
        category: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalItems = await this.prismaService.post.count({
      where: whereCondition,
    });

    return {
      data: posts,
      meta: {
        totalItems,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  // 3. Xem chi tiết
  async findOne(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });
    if (!post)
      throw new NotFoundException(`Không tìm thấy bài đăng có ID ${id}`);
    return post;
  }

  // 4. Cập nhật (Cũng cần diệt XSS nếu người dùng sửa nội dung)
  async update(id: number, updatePostDto: UpdatePostDto) {
    await this.findOne(id); // Check xem bài viết có tồn tại không

    // Xử lý dữ liệu sạch trước khi update
    const dataToUpdate: any = { ...updatePostDto };

    if (updatePostDto.content) {
      dataToUpdate.content = sanitizeHtml(updatePostDto.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: false,
      });
    }

    // Nếu có sửa giá hoặc danh mục, nhớ ép kiểu
    if (updatePostDto.price)
      dataToUpdate.price = parseFloat(updatePostDto.price as any);
    if (updatePostDto.categoryId)
      dataToUpdate.categoryId = parseInt(updatePostDto.categoryId as any, 10);

    return await this.prismaService.post.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // 5. Xóa
  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.post.delete({ where: { id } });
  }
}
