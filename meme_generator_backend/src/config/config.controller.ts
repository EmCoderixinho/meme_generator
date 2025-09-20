import { Body, Controller, Post, Res, Get, Param, Put } from '@nestjs/common';
import { ConfigService } from './config.service';
import type { Response } from 'express';
import { CreateConfigDto } from 'src/config/create-config.dto';

@Controller('api/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  async saveConfig(@Body() body: CreateConfigDto) {
    const configId = await this.configService.saveConfig(body);
    return { id: configId };
  }

  @Get(':id')
  async getConfigById(@Param('id') id: string) {
    return this.configService.getConfigById(id);
  }

  @Put(':id')
  async updateConfig(@Param('id') id: string, @Body() body: CreateConfigDto) {
    return this.configService.updateConfig(id, body);
  }
}