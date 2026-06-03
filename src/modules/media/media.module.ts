import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService], // Xuất Service ra ngoài để tái sử dụng sau này
})
export class MediaModule {}
