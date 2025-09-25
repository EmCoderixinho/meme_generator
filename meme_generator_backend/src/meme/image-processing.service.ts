import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

export interface ImageProcessingOptions {
  isPreview?: boolean;
  scaleDown?: number;
  canvasSize?: { width?: number; height?: number };
  quality?: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  channels: number;
  density?: number;
}

export interface ProcessedImageResult {
  buffer: Buffer;
  metadata: ImageMetadata;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  quality: number;
}

@Injectable()
export class ImageProcessingService {
  /**
   * Process and validate base64 image data
   */
  async processBase64Image(base64Image: string): Promise<Buffer> {
    const base64Parts = base64Image.split(';base64,');
    const base64Data = base64Parts.pop();

    if (!base64Data) {
      throw new BadRequestException('Invalid image format. Expected a base64 string with a data URL prefix.');
    }

    return Buffer.from(base64Data, 'base64');
  }

  /**
   * Get image metadata using Sharp
   */
  async getImageMetadata(imageBuffer: Buffer): Promise<ImageMetadata> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('Could not read image dimensions.');
    }

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format || 'unknown',
      channels: metadata.channels || 3,
      density: metadata.density,
    };
  }

  /**
   * Calculate target dimensions and quality for image processing
   */
  calculateTargetDimensions(
    originalWidth: number,
    originalHeight: number,
    options: ImageProcessingOptions
  ): { targetWidth: number; targetHeight: number; quality: number } {
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;
    let quality = 95;

    if (options.isPreview) {
      const scaleDown = options.scaleDown ?? 0.05;
      targetWidth = options.canvasSize?.width ?? originalWidth;
      targetHeight = options.canvasSize?.height ?? originalHeight;
      quality = Math.max(1, Math.min(100, Math.floor(scaleDown * 100)));
    }

    return { targetWidth, targetHeight, quality };
  }

  /**
   * Create a Sharp image processor from buffer
   */
  createImageProcessor(imageBuffer: Buffer): sharp.Sharp {
    return sharp(imageBuffer);
  }

  /**
   * Composite multiple layers onto an image
   */
  async compositeImage(
    baseImage: sharp.Sharp,
    compositeOperations: sharp.OverlayOptions[],
    quality: number
  ): Promise<Buffer> {
    return baseImage
      .composite(compositeOperations)
      .jpeg({ quality })
      .toBuffer();
  }

  /**
   * Resize image to target dimensions
   */
  async resizeImage(
    imageBuffer: Buffer,
    targetWidth: number,
    targetHeight: number,
    quality: number
  ): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize({
        width: targetWidth,
        height: targetHeight,
        fit: 'fill',
      })
      .jpeg({ quality })
      .toBuffer();
  }

  /**
   * Process image with all transformations
   */
  async processImage(
    imageBuffer: Buffer,
    compositeOperations: sharp.OverlayOptions[],
    options: ImageProcessingOptions
  ): Promise<ProcessedImageResult> {
    const image = this.createImageProcessor(imageBuffer);
    const metadata = await this.getImageMetadata(imageBuffer);
    
    const { targetWidth, targetHeight, quality } = this.calculateTargetDimensions(
      metadata.width,
      metadata.height,
      options
    );

    // Composite all layers
    let finalImage = await this.compositeImage(image, compositeOperations, quality);

    // Resize if needed for preview
    if (options.isPreview && options.canvasSize) {
      finalImage = await this.resizeImage(finalImage, targetWidth, targetHeight, quality);
    }

    return {
      buffer: finalImage,
      metadata,
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      targetWidth,
      targetHeight,
      quality,
    };
  }


}
