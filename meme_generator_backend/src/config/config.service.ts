import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConfigDto } from './create-config.dto';
import { Config } from './config.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async saveConfig(dto: CreateConfigDto): Promise<string> {
    const configDto = { ...dto };

    if (configDto.scaleDown == null) {
        configDto.scaleDown = 0.05;
    }

    const config = this.configRepository.create(configDto);
    await this.configRepository.save(config);
    return config.id;
    }

  async getConfigById(id: string): Promise<Config> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) throw new NotFoundException(`Config with ID ${id} not found.`);
    
    // Remove createdAt and updatedAt from response
    const { createdAt, updatedAt, ...configWithoutTimestamps } = config;
    return configWithoutTimestamps as Config;
  }

  async updateConfig(id: string, dto: CreateConfigDto): Promise<Config> {
    const config = await this.getConfigById(id);
    const updatedDto = { ...dto };
    if (updatedDto.scaleDown == null) {
        updatedDto.scaleDown = config.scaleDown || 0.05;
    }
    this.configRepository.merge(config, updatedDto);
    const savedConfig = await this.configRepository.save(config);
    
    // Remove createdAt and updatedAt from response
    const { createdAt, updatedAt, ...configWithoutTimestamps } = savedConfig;
    return configWithoutTimestamps as Config;
  }
}
