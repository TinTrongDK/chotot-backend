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

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';

const multerStorageConfig = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags('Bài viết (Posts)')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ====================================================================
  // 🔴 1. TẠO BÀI ĐĂNG
  // ====================================================================
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo bài đăng mới kèm ảnh đại diện hoặc link ảnh' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: multerStorageConfig,
      fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận file ảnh thật, bỏ qua nếu không phải file
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    }),
  )
  create(
    @Request() req: any,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;

    // 🔍 DEBUG — xem backend nhận được gì (xóa sau khi fix xong)
    console.log('=== DEBUG CREATE POST ===');
    console.log('Body DTO nhận được:', createPostDto);
    console.log('File upload:', file ? file.filename : 'Không có file');
    console.log('thumbnail từ DTO:', createPostDto.thumbnail);

    // Ưu tiên: file upload > link URL text > null
    const thumbnailUrl = file
      ? `/uploads/${file.filename}`
      : createPostDto.thumbnail || null;

    console.log('thumbnailUrl sẽ lưu vào DB:', thumbnailUrl);
    console.log('=========================');

    return this.postsService.create(userId, createPostDto, thumbnailUrl);
  }

  // ====================================================================
  // 🟢 2. LẤY DANH SÁCH BÀI ĐĂNG (Công khai)
  // ====================================================================
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách bài viết (Có phân trang & tìm kiếm)',
  })
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
    return this.postsService.findAll({ page, limit, keyword });
  }

  // ====================================================================
  // 🟢 3. XEM CHI TIẾT BÀI ĐĂNG (Công khai)
  // ====================================================================
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết 1 bài đăng theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  // ====================================================================
  // 🔴 4. SỬA BÀI ĐĂNG
  // ====================================================================
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin bài đăng (bao gồm đổi ảnh)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: multerStorageConfig,
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updatePostDto.thumbnail = `/uploads/${file.filename}`;
    }
    return this.postsService.update(id, updatePostDto);
  }

  // ====================================================================
  // 🔴 5. XÓA BÀI ĐĂNG
  // ====================================================================
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bài đăng khỏi hệ thống' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
