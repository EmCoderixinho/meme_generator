import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemeController } from './meme.controller';
import { MemeService } from './meme.service';
import { ConfigurationModule } from 'src/config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    ConfigurationModule,
  ],
  controllers: [MemeController],
  providers: [MemeService],
})
export class MemeModule {}