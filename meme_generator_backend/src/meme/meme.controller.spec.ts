import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MemeController } from './meme.controller';
import { MemeService } from './meme.service';
import { CreateMemePreviewDto } from './create-meme-preview.dto';

describe('MemeController', () => {
  let controller: MemeController;
  let service: MemeService;

  const mockMemeService = {
    generateMeme: jest.fn(),
    getAvailableFonts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemeController],
      providers: [
        {
          provide: MemeService,
          useValue: mockMemeService,
        },
      ],
    }).compile();

    controller = module.get<MemeController>(MemeController);
    service = module.get<MemeService>(MemeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPreview', () => {
    it('should generate meme preview successfully', async () => {
      const dto: CreateMemePreviewDto = {
        image: 'data:image/jpeg;base64,test-image-data',
        configId: 'test-config',
        canvasSize: { width: 800, height: 600 },
      };

      const mockBuffer = Buffer.from('mock-image-data');
      mockMemeService.generateMeme.mockResolvedValue(mockBuffer);

      const result = await controller.createPreview(dto);

      expect(mockMemeService.generateMeme).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.image).toContain('data:image/png;base64,');
      expect(result.configId).toBe('test-config');
      expect(result.timestamp).toBeDefined();
    });

    it('should handle service errors', async () => {
      const dto: CreateMemePreviewDto = {
        image: 'data:image/jpeg;base64,test-image-data',
      };

      const error = new Error('Image processing failed');
      mockMemeService.generateMeme.mockRejectedValue(error);

      await expect(controller.createPreview(dto)).rejects.toThrow(
        new BadRequestException('Failed to generate meme preview: Image processing failed')
      );
    });
  });

  describe('generate', () => {
    it('should generate final meme successfully', async () => {
      const dto: CreateMemePreviewDto = {
        image: 'data:image/jpeg;base64,test-image-data',
        configId: 'test-config',
        canvasSize: { width: 1200, height: 800 },
      };

      const mockBuffer = Buffer.from('mock-image-data');
      mockMemeService.generateMeme.mockResolvedValue(mockBuffer);

      const result = await controller.generate(dto);

      expect(mockMemeService.generateMeme).toHaveBeenCalledWith(dto, { isPreview: false });
      expect(result.success).toBe(true);
      expect(result.image).toContain('data:image/jpeg;base64,');
      expect(result.configId).toBe('test-config');
    });

    it('should handle service errors', async () => {
      const dto: CreateMemePreviewDto = {
        image: 'data:image/jpeg;base64,test-image-data',
      };

      const error = new Error('Generation failed');
      mockMemeService.generateMeme.mockRejectedValue(error);

      await expect(controller.generate(dto)).rejects.toThrow(
        new BadRequestException('Failed to generate meme: Generation failed')
      );
    });
  });

  describe('getAvailableFonts', () => {
    it('should return available fonts successfully', async () => {
      const mockFonts = ['Arial', 'Times New Roman', 'DejaVu Sans'];
      mockMemeService.getAvailableFonts.mockResolvedValue(mockFonts);

      const result = await controller.getAvailableFonts();

      expect(mockMemeService.getAvailableFonts).toHaveBeenCalled();
      expect(result.fonts).toEqual(mockFonts);
    });

    it('should return fallback fonts on error', async () => {
      const error = new Error('Font discovery failed');
      mockMemeService.getAvailableFonts.mockRejectedValue(error);

      const result = await controller.getAvailableFonts();

      expect(result.fonts).toEqual(['Arial', 'DejaVu Sans', 'DejaVu Serif', 'FreeSans', 'FreeSerif']);
    });
  });

});
