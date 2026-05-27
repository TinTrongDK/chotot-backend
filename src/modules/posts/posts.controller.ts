import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';

// 👈 Thêm bộ Import của Swagger
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Bài viết (Posts)') // 👈 Gom nhóm API trên Swagger
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 🔴 KHÓA: Phải đăng nhập mới được đăng tin (Đã tích hợp Upload Ảnh)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // Hiện ổ khóa
  @ApiOperation({ summary: 'Tạo bài đăng mới kèm ảnh đại diện' })
  @ApiConsumes('multipart/form-data') // 👈 ĐÂY LÀ LỆNH GỌI NÚT "CHOOSE FILE" HIỆN RA
  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // Băm tên file để không bao giờ bị trùng lặp
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Request() req: any,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const thumbnailUrl = file ? `/uploads/${file.filename}` : null;
    return this.postsService.create(userId, createPostDto, thumbnailUrl);
  }

  // 🟢 MỞ: Hỗ trợ tìm kiếm và phân trang công khai
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách bài viết (Có phân trang & tìm kiếm)',
  })
  // 👇 3 dòng ApiQuery dưới đây sẽ vẽ ra 3 ô nhập liệu cực đẹp trên Swagger
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Số trang (Mặc định: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Số lượng bài/trang (Mặc định: 10)',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm tiêu đề',
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.postsService.findAll({
      page: page ? +page : 1,
      limit: limit ? +limit : 10,
      keyword: keyword || '',
    });
  }

  // 🟢 MỞ: Xem chi tiết 1 bài
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết 1 bài đăng theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  // 🔴 KHÓA: Sửa bài đăng
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // Hiện ổ khóa
  @ApiOperation({ summary: 'Cập nhật thông tin bài đăng' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  // 🔴 KHÓA: Xóa bài đăng
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth() // Hiện ổ khóa
  @ApiOperation({ summary: 'Xóa bài đăng khỏi hệ thống' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
