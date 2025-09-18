import { Module } from '@nestjs/common';
import { MemeController } from './meme.controller';
import { MemeService } from './meme.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from '../entity/config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Config])],
  controllers: [MemeController],
  providers: [MemeService],
})
export class MemeModule {}