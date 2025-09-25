import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MemeService } from './meme.service';
import { ConfigService } from '../config/config.service';
import { FontService } from './font.service';
import { TextRenderingService } from './text-rendering.service';
import { WatermarkService } from './watermark.service';
import { ImageProcessingService } from './image-processing.service';
import { CreateMemePreviewDto } from './create-meme-preview.dto';

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

  const mockFontService = {
    getAvailableFonts: jest.fn().mockResolvedValue(['Impact', 'Arial', 'Times New Roman', 'DejaVu Sans']),
  };

  const mockTextRenderingService = {
    generateTextLayer: jest.fn().mockResolvedValue({
      buffer: Buffer.from('mock-text-layer'),
      height: 50,
    }),
  };

  const mockWatermarkService = {
    processWatermarkFromConfig: jest.fn().mockResolvedValue(null),
    processWatermark: jest.fn().mockResolvedValue(null),
  };

  const mockImageProcessingService = {
    processBase64Image: jest.fn().mockImplementation((base64Image: string) => {
      if (!base64Image.includes('data:image') || base64Image === 'data:image/jpeg;base64,') {
        throw new BadRequestException('Invalid image format. Expected a base64 string with a data URL prefix.');
      }
      return Buffer.from('mock-image-buffer');
    }),
    getImageMetadata: jest.fn().mockResolvedValue({
      width: 800,
      height: 600,
      format: 'jpeg',
      channels: 3,
    }),
    calculateTargetDimensions: jest.fn().mockReturnValue({
      targetWidth: 800,
      targetHeight: 600,
      quality: 95,
    }),
    processImage: jest.fn().mockResolvedValue({
      buffer: Buffer.from('mock-processed-image'),
      metadata: { width: 800, height: 600, format: 'jpeg', channels: 3 },
      originalWidth: 800,
      originalHeight: 600,
      targetWidth: 800,
      targetHeight: 600,
      quality: 95,
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
        {
          provide: FontService,
          useValue: mockFontService,
        },
        {
          provide: TextRenderingService,
          useValue: mockTextRenderingService,
        },
        {
          provide: WatermarkService,
          useValue: mockWatermarkService,
        },
        {
          provide: ImageProcessingService,
          useValue: mockImageProcessingService,
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

});
