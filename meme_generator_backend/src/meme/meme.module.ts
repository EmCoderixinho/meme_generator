import { Module } from '@nestjs/common';
import { MemeController } from './meme.controller';
import { MemeService } from './meme.service';
import { FontService } from './font.service';
import { TextRenderingService } from './text-rendering.service';
import { WatermarkService } from './watermark.service';
import { ImageProcessingService } from './image-processing.service';
import { ConfigurationModule } from 'src/config/config.module';

@Module({
  imports: [
    ConfigurationModule,
  ],
  controllers: [MemeController],
  providers: [MemeService, FontService, TextRenderingService, WatermarkService, ImageProcessingService],
})
export class MemeModule {}