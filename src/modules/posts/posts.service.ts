import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../../prisma/prisma.service';
import sanitizeHtml from 'sanitize-html';

// 🌟 1. Nhập thêm enum Status từ Prisma Client
import { Status } from '@prisma/client';

// Khóa chặt kiểu dữ liệu bằng 'as const' để TypeScript không bắt bẻ lỗi 'boolean'
const SANITIZE_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: false as const,
};

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  // ====================================================================
  // 1. TẠO BÀI ĐĂNG (Mặc định Prisma tự gán status = PENDING)
  // ====================================================================
  async create(
    userId: number,
    createPostDto: CreatePostDto,
    thumbnailUrl: string | null,
  ) {
    const cleanContent = sanitizeHtml(createPostDto.content, SANITIZE_OPTIONS);

    return await this.prismaService.post.create({
      data: {
        title: createPostDto.title,
        content: cleanContent,
        thumbnail: thumbnailUrl,
        price: createPostDto.price,
        categoryId: createPostDto.categoryId,
        userId: userId,
      },
    });
  }

  // ====================================================================
  // 2. LẤY DANH SÁCH CÓ PHÂN TRANG, TÌM KIẾM, LỌC TRẠNG THÁI & DANH MỤC
  // ====================================================================
  // 🌟 Thêm categoryId vào tham số nhận vào
  async findAll(query: {
    page?: string;
    limit?: string;
    keyword?: string;
    status?: Status;
    categoryId?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const keyword = query.keyword || '';
    const skip = (page - 1) * limit;

    // Khởi tạo object rỗng trước để dễ dàng nhét thêm điều kiện
    const whereCondition: any = {};

    // 🌟 Lọc theo từ khóa tìm kiếm (nếu có)
    if (keyword) {
      whereCondition.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
      ];
    }

    // 🌟 LỌC THEO DANH MỤC: Bắt chính xác ID danh mục được truyền lên
    if (query.categoryId) {
      whereCondition.categoryId = Number(query.categoryId);
    }

    // 🌟 LOGIC CHỜ DUYỆT:
    // Nếu Admin truyền status vào (VD: gọi API lấy bài PENDING), lấy đúng bài đó.
    // Nếu không truyền (User bình thường vào trang chủ), MẶC ĐỊNH chỉ lấy bài ACTIVE.
    if (query.status) {
      whereCondition.status = query.status;
    } else {
      whereCondition.status = Status.ACTIVE;
    }

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

  // ====================================================================
  // 3. XEM CHI TIẾT
  // ====================================================================
  async findOne(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài đăng có ID ${id}`);
    }

    return post;
  }

  // ====================================================================
  // 4. CẬP NHẬT
  // ====================================================================
  async update(id: number, updatePostDto: UpdatePostDto) {
    await this.findOne(id); // Check xem bài viết có tồn tại không

    const dataToUpdate = { ...updatePostDto };

    // Chỉ làm sạch XSS nếu người dùng có gửi nội dung mới
    if (dataToUpdate.content) {
      dataToUpdate.content = sanitizeHtml(
        dataToUpdate.content,
        SANITIZE_OPTIONS,
      );
    }

    return await this.prismaService.post.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // ====================================================================
  // 5. XÓA
  // ====================================================================
  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.post.delete({ where: { id } });
  }

  // ====================================================================
  // 6. ADMIN CẬP NHẬT TRẠNG THÁI (DUYỆT BÀI / ĐÃ BÁN)
  // ====================================================================
  async updateStatus(id: number, status: Status) {
    await this.findOne(id); // Kiểm tra xem bài đăng có tồn tại không

    return await this.prismaService.post.update({
      where: { id },
      data: { status: status },
    });
  }
}
