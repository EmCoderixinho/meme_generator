import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from './config.service';
import { Config } from './config.entity';
import { CreateConfigDto } from './create-config.dto';
import { TextAlign, WatermarkPosition } from './config.enums';

describe('ConfigService', () => {
  let service: ConfigService;
  let repository: Repository<Config>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: getRepositoryToken(Config),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
    repository = module.get<Repository<Config>>(getRepositoryToken(Config));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveConfig', () => {
    it('should save a new configuration and return the ID', async () => {
      const createConfigDto: CreateConfigDto = {
        topText: 'Test Top',
        bottomText: 'Test Bottom',
        fontFamily: 'Arial',
        fontSize: 24,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        textAlign: TextAlign.Center,
        padding: 20,
        allCaps: false,
        scaleDown: 0.05,
        watermarkImage: '',
        watermarkPosition: WatermarkPosition.BottomRight,
      };

      const mockConfig = {
        id: 'test-id-123',
        ...createConfigDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockConfig);
      mockRepository.save.mockResolvedValue(mockConfig);

      const result = await service.saveConfig(createConfigDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createConfigDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockConfig);
      expect(result).toBe('test-id-123');
    });

    it('should set default scaleDown value when not provided', async () => {
      const createConfigDto: CreateConfigDto = {
        topText: 'Test',
        fontFamily: 'Arial',
      };

      const expectedDto = {
        ...createConfigDto,
        scaleDown: 0.05,
      };

      const mockConfig = {
        id: 'test-id-123',
        ...expectedDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockConfig);
      mockRepository.save.mockResolvedValue(mockConfig);

      await service.saveConfig(createConfigDto);

      expect(mockRepository.create).toHaveBeenCalledWith(expectedDto);
    });

    it('should preserve scaleDown value when provided', async () => {
      const createConfigDto: CreateConfigDto = {
        topText: 'Test',
        fontFamily: 'Arial',
        scaleDown: 0.1,
      };

      const mockConfig = {
        id: 'test-id-123',
        ...createConfigDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockConfig);
      mockRepository.save.mockResolvedValue(mockConfig);

      await service.saveConfig(createConfigDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createConfigDto);
    });
  });

  describe('getConfigById', () => {
    it('should return configuration when found', async () => {
      const configId = 'test-id-123';
      const mockConfig = {
        id: configId,
        topText: 'Test Top',
        bottomText: 'Test Bottom',
        fontFamily: 'Arial',
        fontSize: 24,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        textAlign: TextAlign.Center,
        padding: 20,
        allCaps: false,
        scaleDown: 0.05,
        watermarkImage: '',
        watermarkPosition: WatermarkPosition.BottomRight,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockConfig);

      const result = await service.getConfigById(configId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: configId } });
      expect(result).toEqual(mockConfig);
    });

    it('should throw NotFoundException when configuration not found', async () => {
      const configId = 'non-existent-id';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getConfigById(configId)).rejects.toThrow(
        new NotFoundException(`Config with ID ${configId} not found.`)
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: configId } });
    });
  });

  describe('updateConfig', () => {
    it('should update existing configuration and return updated config', async () => {
      const configId = 'test-id-123';
      const updateDto: CreateConfigDto = {
        topText: 'Updated Top',
        fontSize: 30,
      };

      const existingConfig = {
        id: configId,
        topText: 'Original Top',
        bottomText: 'Original Bottom',
        fontFamily: 'Arial',
        fontSize: 24,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        textAlign: TextAlign.Center,
        padding: 20,
        allCaps: false,
        scaleDown: 0.05,
        watermarkImage: '',
        watermarkPosition: WatermarkPosition.BottomRight,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedConfig = {
        ...existingConfig,
        topText: 'Updated Top',
        fontSize: 30,
      };

      mockRepository.findOne.mockResolvedValue(existingConfig);
      mockRepository.merge.mockImplementation((target, source) => {
        Object.assign(target, source);
        return target;
      });
      mockRepository.save.mockResolvedValue(updatedConfig);

      const result = await service.updateConfig(configId, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: configId } });
      expect(mockRepository.merge).toHaveBeenCalledWith(existingConfig, {
        ...updateDto,
        scaleDown: 0.05,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedConfig);
      expect(result).toEqual(updatedConfig);
    });

    it('should set default scaleDown when not provided in update', async () => {
      const configId = 'test-id-123';
      const updateDto: CreateConfigDto = {
        topText: 'Updated Top',
      };

      const existingConfig = {
        id: configId,
        scaleDown: 0.1,
        topText: 'Original Top',
        fontFamily: 'Arial',
        fontSize: 24,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        textAlign: TextAlign.Center,
        padding: 20,
        allCaps: false,
        watermarkImage: '',
        watermarkPosition: WatermarkPosition.BottomRight,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedUpdateDto = {
        ...updateDto,
        scaleDown: 0.1, // Should preserve existing value
      };

      mockRepository.findOne.mockResolvedValue(existingConfig);
      mockRepository.merge.mockReturnValue(existingConfig);
      mockRepository.save.mockResolvedValue(existingConfig);

      await service.updateConfig(configId, updateDto);

      expect(mockRepository.merge).toHaveBeenCalledWith(existingConfig, expectedUpdateDto);
    });

    it('should use default scaleDown when existing config has no scaleDown', async () => {
      const configId = 'test-id-123';
      const updateDto: CreateConfigDto = {
        topText: 'Updated Top',
      };

      const existingConfig = {
        id: configId,
        scaleDown: null,
        topText: 'Original Top',
        fontFamily: 'Arial',
        fontSize: 24,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        textAlign: TextAlign.Center,
        padding: 20,
        allCaps: false,
        watermarkImage: '',
        watermarkPosition: WatermarkPosition.BottomRight,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedUpdateDto = {
        ...updateDto,
        scaleDown: 0.05, // Should use default value
      };

      mockRepository.findOne.mockResolvedValue(existingConfig);
      mockRepository.merge.mockReturnValue(existingConfig);
      mockRepository.save.mockResolvedValue(existingConfig);

      await service.updateConfig(configId, updateDto);

      expect(mockRepository.merge).toHaveBeenCalledWith(existingConfig, expectedUpdateDto);
    });

    it('should throw NotFoundException when trying to update non-existent config', async () => {
      const configId = 'non-existent-id';
      const updateDto: CreateConfigDto = {
        topText: 'Updated Top',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateConfig(configId, updateDto)).rejects.toThrow(
        new NotFoundException(`Config with ID ${configId} not found.`)
      );
    });
  });
});
