import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { Config } from '../config/config.entity';
import { WatermarkPosition } from '../config/config.enums';

export interface WatermarkOptions {
  watermarkImage: string;
  watermarkPosition: WatermarkPosition;
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
    position: WatermarkPosition,
    canvasWidth: number,
    canvasHeight: number,
    watermarkWidth: number,
    watermarkHeight: number,
    padding: number
  ): { left: number; top: number } {
    let left = 0;
    let top = 0;

    switch (position) {
      case WatermarkPosition.TopLeft:
        left = padding;
        top = padding;
        break;
      case WatermarkPosition.TopRight:
        left = canvasWidth - watermarkWidth - padding;
        top = padding;
        break;
      case WatermarkPosition.BottomLeft:
        left = padding;
        top = canvasHeight - watermarkHeight - padding;
        break;
      case WatermarkPosition.BottomRight:
        left = canvasWidth - watermarkWidth - padding;
        top = canvasHeight - watermarkHeight - padding;
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
