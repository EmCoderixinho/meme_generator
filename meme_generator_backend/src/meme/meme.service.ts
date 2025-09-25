import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Config } from '../config/config.entity';
import { CreateMemePreviewDto } from './create-meme-preview.dto';
import { MemeResponseDto } from './meme-response.dto';
import { ConfigService } from '../config/config.service';
import { FontService } from './font.service';
import { TextRenderingService } from './text-rendering.service';
import { WatermarkService } from './watermark.service';
import { ImageProcessingService } from './image-processing.service';

@Injectable()
export class MemeService {
    constructor(
      private readonly configService: ConfigService,
      private readonly fontService: FontService,
      private readonly textRenderingService: TextRenderingService,
      private readonly watermarkService: WatermarkService,
      private readonly imageProcessingService: ImageProcessingService,
    ) {}

    async getAvailableFonts(): Promise<string[]> {
        return this.fontService.getAvailableFonts();
    }
    
    async generateMeme(dto: CreateMemePreviewDto, options: { isPreview?: boolean } = { isPreview: true }): Promise<Buffer> {
        // Process base64 image
        const imageBuffer = await this.imageProcessingService.processBase64Image(dto.image);
        
        // Get configuration
        const config = await this.getConfiguration(dto.configId);
        
        // Get image metadata
        const metadata = await this.imageProcessingService.getImageMetadata(imageBuffer);
        const originalWidth = metadata.width;
        const originalHeight = metadata.height;

        // Prepare composite operations
        const compositeOperations = await this.prepareCompositeOperations(config, originalWidth, originalHeight);

        // Process image with all layers
        const result = await this.imageProcessingService.processImage(
          imageBuffer,
          compositeOperations,
          {
            isPreview: options.isPreview,
            scaleDown: config.scaleDown,
            canvasSize: dto.canvasSize,
          }
        );

        return result.buffer;
    }

    /**
     * Get configuration with defaults and optional saved config
     */
    private async getConfiguration(configId?: string): Promise<Config | any> {
        let config: Config | any = {
            // Default configuration values
            scaleDown: 0.05,
            padding: 20,
            fontFamily: 'Arial',
            fontSize: 24,
            textColor: '#FFFFFF',
            strokeColor: '#000000',
            strokeWidth: 4,
            textAlign: 'center',
            allCaps: false,
            topText: '',
            bottomText: '',
            watermarkImage: '',
            watermarkPosition: 'bottom-right'
        };

        // Get configuration if configId is provided
        if (configId) {
            try {
                const savedConfig = await this.configService.getConfigById(configId);
                config = {
                    ...config,
                    ...savedConfig,
                    // Ensure required fields have defaults if not provided
                    fontFamily: savedConfig.fontFamily || config.fontFamily,
                    fontSize: savedConfig.fontSize || config.fontSize,
                    textColor: savedConfig.textColor || config.textColor,
                    strokeColor: savedConfig.strokeColor || config.strokeColor,
                    strokeWidth: savedConfig.strokeWidth || config.strokeWidth,
                    textAlign: savedConfig.textAlign || config.textAlign,
                    padding: savedConfig.padding || config.padding,
                    allCaps: savedConfig.allCaps !== undefined ? savedConfig.allCaps : config.allCaps,
                };
                /*console.log(`Loaded config for ID ${configId}:`, {
                    topText: config.topText,
                    bottomText: config.bottomText,
                    fontFamily: config.fontFamily,
                    fontSize: config.fontSize
                });*/
            } catch (error) {
                console.warn(`Config not found for ID: ${configId}, using defaults:`, error.message);
                // Keep the default config values
            }
        }

        return config;
    }

    /**
     * Prepare all composite operations (text layers and watermarks)
     */
    private async prepareCompositeOperations(config: Config | any, originalWidth: number, originalHeight: number): Promise<any[]> {
        const compositeOperations: any[] = [];

        const topText = config.allCaps && config.topText ? config.topText.toUpperCase() : config.topText;
        const bottomText = config.allCaps && config.bottomText ? config.bottomText.toUpperCase() : config.bottomText;

        // Add top text layer
        if (topText) {
            const { buffer: topSvg } = await this.textRenderingService.generateTextLayer({
                ...config,
                text: topText,
                width: originalWidth,
                position: 'top',
            });
            compositeOperations.push({
                input: Buffer.from(topSvg),
                top: Math.round(config.padding ?? 20),
                left: Math.round(config.padding ?? 20),
            });
        }

        // Add bottom text layer
        if (bottomText) {
            const { buffer: bottomSvg, height: bottomSvgHeight } = await this.textRenderingService.generateTextLayer({
                ...config,
                text: bottomText,
                width: originalWidth,
                position: 'bottom',
            });
            const padding = config.padding ?? 20;
            const bottomTextOffset = originalHeight - bottomSvgHeight - padding;
            compositeOperations.push({
                input: Buffer.from(bottomSvg),
                top: Math.round(bottomTextOffset),
                left: Math.round(config.padding ?? 20),
            });
        }

        // Add watermark
        const watermarkResult = await this.watermarkService.processWatermarkFromConfig(
            config,
            originalWidth,
            originalHeight
        );
        
        if (watermarkResult) {
            compositeOperations.push(watermarkResult);
        }

        return compositeOperations;
    }

}
