import { Test, TestingModule } from '@nestjs/testing';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { CreateConfigDto } from './create-config.dto';
import { Config } from './config.entity';
import { TextAlign, WatermarkPosition } from './config.enums';

describe('ConfigController', () => {
  let controller: ConfigController;
  let service: ConfigService;

  const mockConfigService = {
    saveConfig: jest.fn(),
    getConfigById: jest.fn(),
    updateConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<ConfigController>(ConfigController);
    service = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('saveConfig', () => {
    it('should save configuration and return config ID', async () => {
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

      const configId = 'test-id-123';
      mockConfigService.saveConfig.mockResolvedValue(configId);

      const result = await controller.saveConfig(createConfigDto);

      expect(mockConfigService.saveConfig).toHaveBeenCalledWith(createConfigDto);
      expect(result).toEqual({ id: configId });
    });

    it('should handle service errors', async () => {
      const createConfigDto: CreateConfigDto = {
        topText: 'Test',
        fontFamily: 'Arial',
      };

      const error = new Error('Database error');
      mockConfigService.saveConfig.mockRejectedValue(error);

      await expect(controller.saveConfig(createConfigDto)).rejects.toThrow('Database error');
      expect(mockConfigService.saveConfig).toHaveBeenCalledWith(createConfigDto);
    });
  });

  describe('getConfigById', () => {
    it('should return configuration when found', async () => {
      const configId = 'test-id-123';
      const mockConfig: Config = {
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

      mockConfigService.getConfigById.mockResolvedValue(mockConfig);

      const result = await controller.getConfigById(configId);

      expect(mockConfigService.getConfigById).toHaveBeenCalledWith(configId);
      expect(result).toEqual(mockConfig);
    });

    it('should handle not found error', async () => {
      const configId = 'non-existent-id';
      const error = new Error('Config not found');
      mockConfigService.getConfigById.mockRejectedValue(error);

      await expect(controller.getConfigById(configId)).rejects.toThrow('Config not found');
      expect(mockConfigService.getConfigById).toHaveBeenCalledWith(configId);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration and return updated config', async () => {
      const configId = 'test-id-123';
      const updateDto: CreateConfigDto = {
        topText: 'Updated Top',
        fontSize: 30,
      };

      const updatedConfig: Config = {
        id: configId,
        topText: 'Updated Top',
        bottomText: 'Test Bottom',
        fontFamily: 'Arial',
        fontSize: 30,
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

      mockConfigService.updateConfig.mockResolvedValue(updatedConfig);

      const result = await controller.updateConfig(configId, updateDto);

      expect(mockConfigService.updateConfig).toHaveBeenCalledWith(configId, updateDto);
      expect(result).toEqual(updatedConfig);
    });

    it('should handle update errors', async () => {
      const configId = 'test-id-123';
      const updateDto: CreateConfigDto = {
        topText: 'Updated Top',
      };

      const error = new Error('Update failed');
      mockConfigService.updateConfig.mockRejectedValue(error);

      await expect(controller.updateConfig(configId, updateDto)).rejects.toThrow('Update failed');
      expect(mockConfigService.updateConfig).toHaveBeenCalledWith(configId, updateDto);
    });
  });
});
