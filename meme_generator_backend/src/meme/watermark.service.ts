import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { Config } from '../config/config.entity';

export interface WatermarkOptions {
  watermarkImage: string;
  watermarkPosition: string;
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
}

export interface WatermarkResult {
  input: Buffer;
  left: number;
  top: number;
}

@Injectable()
export class WatermarkService {
  /**
   * Process and position a watermark for overlay on an image
   */
  async processWatermark(options: WatermarkOptions): Promise<WatermarkResult | null> {
    const { watermarkImage, watermarkPosition, canvasWidth, canvasHeight, padding } = options;

    if (!watermarkImage || !watermarkPosition) {
      return null;
    }

    const watermarkBase64Parts = watermarkImage.split(';base64,');
    const watermarkBase64Data = watermarkBase64Parts.pop();

    if (!watermarkBase64Data) {
      throw new BadRequestException('Invalid watermark image format. Expected a base64 string with a data URL prefix.');
    }

    let watermarkBuffer = Buffer.from(watermarkBase64Data, 'base64');
    let watermarkImageProcessor = sharp(watermarkBuffer);
    let watermarkMetadata = await watermarkImageProcessor.metadata();

    // Resize watermark if it's too large (max 25% of canvas size)
    const maxWatermarkWidth = canvasWidth * 0.25;
    const maxWatermarkHeight = canvasHeight * 0.25;

    if (watermarkMetadata.width > maxWatermarkWidth || watermarkMetadata.height > maxWatermarkHeight) {
      watermarkImageProcessor = watermarkImageProcessor.resize({
        width: Math.round(maxWatermarkWidth),
        height: Math.round(maxWatermarkHeight),
        fit: 'inside',
        withoutEnlargement: true,
      });

      const resizedWatermarkBuffer = await watermarkImageProcessor.toBuffer();
      watermarkBuffer = Buffer.from(resizedWatermarkBuffer);
      watermarkMetadata = await sharp(watermarkBuffer).metadata();
    }

    // Calculate position based on watermark position setting
    const position = this.calculateWatermarkPosition(
      watermarkPosition,
      canvasWidth,
      canvasHeight,
      watermarkMetadata.width || 0,
      watermarkMetadata.height || 0,
      padding
    );

    return {
      input: watermarkBuffer,
      left: position.left,
      top: position.top,
    };
  }

  /**
   * Calculate watermark position based on position setting
   */
  private calculateWatermarkPosition(
    position: string,
    canvasWidth: number,
    canvasHeight: number,
    watermarkWidth: number,
    watermarkHeight: number,
    padding: number
  ): { left: number; top: number } {
    let left = 0;
    let top = 0;

    switch (position) {
      case 'top-left':
        left = padding;
        top = padding;
        break;
      case 'top-right':
        left = canvasWidth - watermarkWidth - padding;
        top = padding;
        break;
      case 'bottom-left':
        left = padding;
        top = canvasHeight - watermarkHeight - padding;
        break;
      case 'bottom-right':
        left = canvasWidth - watermarkWidth - padding;
        top = canvasHeight - watermarkHeight - padding;
        break;
      case 'center':
        left = (canvasWidth - watermarkWidth) / 2;
        top = (canvasHeight - watermarkHeight) / 2;
        break;
      case 'top-center':
        left = (canvasWidth - watermarkWidth) / 2;
        top = padding;
        break;
      case 'bottom-center':
        left = (canvasWidth - watermarkWidth) / 2;
        top = canvasHeight - watermarkHeight - padding;
        break;
      case 'left-center':
        left = padding;
        top = (canvasHeight - watermarkHeight) / 2;
        break;
      case 'right-center':
        left = canvasWidth - watermarkWidth - padding;
        top = (canvasHeight - watermarkHeight) / 2;
        break;
      default:
        // Default to bottom-right if position is not recognized
        left = canvasWidth - watermarkWidth - padding;
        top = canvasHeight - watermarkHeight - padding;
    }

    return {
      left: Math.round(left),
      top: Math.round(top),
    };
  }

  /**
   * Validate watermark image format and size
   */
  async validateWatermark(watermarkImage: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const watermarkBase64Parts = watermarkImage.split(';base64,');
      const watermarkBase64Data = watermarkBase64Parts.pop();

      if (!watermarkBase64Data) {
        return { isValid: false, error: 'Invalid base64 format' };
      }

      const watermarkBuffer = Buffer.from(watermarkBase64Data, 'base64');
      const metadata = await sharp(watermarkBuffer).metadata();

      if (!metadata.width || !metadata.height) {
        return { isValid: false, error: 'Could not read watermark dimensions' };
      }

      // Check if watermark is too large (more than 50% of typical canvas)
      const maxSize = 2000; // Reasonable maximum size
      if (metadata.width > maxSize || metadata.height > maxSize) {
        return { isValid: false, error: `Watermark too large. Maximum size: ${maxSize}x${maxSize}px` };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: `Invalid watermark image: ${error.message}` };
    }
  }

  /**
   * Get optimal watermark size for a given canvas
   */
  getOptimalWatermarkSize(canvasWidth: number, canvasHeight: number): { width: number; height: number } {
    const maxWidth = Math.round(canvasWidth * 0.25);
    const maxHeight = Math.round(canvasHeight * 0.25);
    
    return {
      width: maxWidth,
      height: maxHeight,
    };
  }

  /**
   * Get available watermark positions
   */
  getAvailablePositions(): string[] {
    return [
      'top-left',
      'top-center',
      'top-right',
      'left-center',
      'center',
      'right-center',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];
  }

  /**
   * Check if a watermark position is valid
   */
  isValidPosition(position: string): boolean {
    return this.getAvailablePositions().includes(position);
  }

  /**
   * Process watermark from config object
   */
  async processWatermarkFromConfig(
    config: Config,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<WatermarkResult | null> {
    if (!config.watermarkImage || !config.watermarkPosition) {
      return null;
    }

    return this.processWatermark({
      watermarkImage: config.watermarkImage,
      watermarkPosition: config.watermarkPosition,
      canvasWidth,
      canvasHeight,
      padding: config.padding || 20,
    });
  }
}
