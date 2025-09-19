import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConfigDto } from 'src/config/create-config.dto';
import { Config } from 'src/config/config.entity';

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
    return config;
  }

  async updateConfig(id: string, dto: CreateConfigDto): Promise<Config> {
    const config = await this.getConfigById(id);
    const updatedDto = { ...dto };
    if (updatedDto.scaleDown == null) {
        updatedDto.scaleDown = config.scaleDown || 0.05;
    }
    this.configRepository.merge(config, updatedDto);
    return this.configRepository.save(config);
    }
}
