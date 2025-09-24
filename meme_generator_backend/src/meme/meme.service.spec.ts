import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MemeService } from './meme.service';
import { ConfigService } from '../config/config.service';
import { CreateMemePreviewDto } from './create-meme-preview.dto';
import { UpdateMemeItemDto } from './update-meme-item.dto';

// Mock sharp
jest.mock('sharp', () => {
  const mockSharp = jest.fn((input) => {
    // Validate base64 format - sharp receives a Buffer, not a string
    if (Buffer.isBuffer(input) && input.length === 0) {
      throw new Error('Invalid image format. Expected a base64 string with a data URL prefix.');
    }
    return {
      metadata: jest.fn().mockResolvedValue({ width: 800, height: 600 }),
      clone: jest.fn().mockReturnThis(),
      composite: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data')),
      resize: jest.fn().mockReturnThis(),
    };
  });
  return mockSharp;
});

// Mock canvas
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      font: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      textAlign: 'center',
      textBaseline: 'top',
      measureText: jest.fn(() => ({ width: 100 })),
      strokeText: jest.fn(),
      fillText: jest.fn(),
    })),
    toBuffer: jest.fn(() => Buffer.from('mock-canvas-data')),
  })),
  registerFont: jest.fn(),
}));

describe('MemeService', () => {
  let service: MemeService;
  let configService: ConfigService;

  const mockConfigService = {
    getConfigById: jest.fn().mockImplementation((id: string) => {
      if (id === 'test-config') {
        throw new Error('Config not found');
      }
      return Promise.resolve({
        id: 'valid-config',
        topText: 'Test Top',
        bottomText: 'Test Bottom',
        fontFamily: 'Arial',
        fontSize: 24,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        textAlign: 'center',
        padding: 20,
        allCaps: false,
        scaleDown: 0.05,
        watermarkImage: '',
        watermarkPosition: 'bottom-right',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MemeService>(MemeService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableFonts', () => {
    it('should return available fonts', async () => {
      const fonts = await service.getAvailableFonts();
      expect(Array.isArray(fonts)).toBe(true);
      expect(fonts.length).toBeGreaterThan(0);
    });
  });

  describe('generateMeme', () => {
    it('should throw BadRequestException for invalid image format', async () => {
      const dto: CreateMemePreviewDto = {
        image: 'data:image/jpeg;base64,', // Empty base64 data
        configId: 'test-config',
      };

      await expect(service.generateMeme(dto)).rejects.toThrow(
        'Invalid image format. Expected a base64 string with a data URL prefix.'
      );
    });

    it('should generate meme with valid image', async () => {
      const dto: CreateMemePreviewDto = {
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        configId: 'test-config',
      };

      const result = await service.generateMeme(dto);
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should use default config when configId is not provided', async () => {
      const dto: CreateMemePreviewDto = {
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      };

      const result = await service.generateMeme(dto);
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('updateMemeItem', () => {
    it('should throw BadRequestException for invalid image format', async () => {
      const dto: UpdateMemeItemDto = {
        image: 'data:image/jpeg;base64,', // Empty base64 data
        configId: 'test-config',
      };

      await expect(service.updateMemeItem(dto)).rejects.toThrow(
        /Failed to update meme item.*Invalid image format/
      );
    });

    it('should update meme item successfully', async () => {
      const dto: UpdateMemeItemDto = {
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        configId: 'valid-config',
        topText: 'Updated Text',
        fontFamily: 'Arial',
        fontSize: 24,
      };

      const result = await service.updateMemeItem(dto);
      expect(result.success).toBe(true);
      expect(result.image).toContain('data:image/jpeg;base64,');
      expect(result.textConfig?.topText).toBe('Updated Text');
      expect(result.textConfig?.fontFamily).toBe('Arial');
      expect(result.textConfig?.fontSize).toBe(24);
    });
  });
});
