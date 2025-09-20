import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { Config } from 'src/config/config.entity';
import { CreateMemePreviewDto } from 'src/meme/create-meme-preview.dto';
import { ConfigService } from '../config/config.service';

@Injectable()
export class MemeService {
    constructor(
      private readonly configService: ConfigService,
    ) {}
    
    async generateMeme(dto: CreateMemePreviewDto, options: { isPreview?: boolean } = { isPreview: true }): Promise<Buffer> {
        const base64Parts = dto.image.split(';base64,');
        const base64Data = base64Parts.pop();

        if (!base64Data) {
            throw new BadRequestException('Invalid image format. Expected a base64 string with a data URL prefix.');
        }
        
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const compositeOperations: sharp.OverlayOptions[] = [];
        
        let config: Config | any;

        if (dto.configId) {
            try {
                config = await this.configService.getConfigById(dto.configId);
            } catch (error) {
                throw new NotFoundException(`Config with ID ${dto.configId} not found.`);
            }
        } else if (dto.config) {
            config = dto.config;
        } else {
            throw new BadRequestException('Either configId or config object must be provided.');
        }

        const image = sharp(imageBuffer);
        const metadata = await image.metadata();

        let canvasWidth: number;
        let canvasHeight: number;
        let quality: number;

        if (options.isPreview) {
            const scaleDown = config.scaleDown ?? 0.05;
            canvasWidth = dto.canvasSize?.width ?? metadata.width;
            canvasHeight = dto.canvasSize?.height ?? metadata.height;
            quality = Math.max(1, Math.min(100, Math.floor(scaleDown * 100)));
        } else {
            canvasWidth = metadata.width;
            canvasHeight = metadata.height;
            quality = 95;
        }

        const processedImage = image.resize(canvasWidth, canvasHeight);

        const topText = config.allCaps && config.topText ? config.topText.toUpperCase() : config.topText;
        const bottomText = config.allCaps && config.bottomText ? config.bottomText.toUpperCase() : config.bottomText;

        if (topText) {
            const { buffer: topSvg, height: topSvgHeight } = await this.generateTextLayer({ ...config, text: topText, width: canvasWidth, position: 'top' });
            compositeOperations.push({ 
              input: Buffer.from(topSvg), 
              top: Math.round(config.padding ?? 20), 
              left: Math.round(config.padding ?? 20) 
          });
        }

        if (bottomText) {
            const { buffer: bottomSvg, height: bottomSvgHeight } = await this.generateTextLayer({ ...config, text: bottomText, width: canvasWidth, position: 'bottom' });
            const padding = config.padding ?? 20;
            const bottomTextOffset = canvasHeight - bottomSvgHeight - padding; 
            compositeOperations.push({ 
              input: Buffer.from(bottomSvg), 
              top: Math.round(bottomTextOffset), 
              left: Math.round(config.padding ?? 20) 
          });
        }

        if (config.watermarkImage && config.watermarkPosition) {
            const watermarkBase64Parts = config.watermarkImage.split(';base64,');
            const watermarkBase64Data = watermarkBase64Parts.pop();

            if (!watermarkBase64Data) {
                throw new BadRequestException('Invalid watermark image format. Expected a base64 string with a data URL prefix.');
            }

            const watermarkBuffer = Buffer.from(watermarkBase64Data, 'base64');
            const watermarkMetadata = await sharp(watermarkBuffer).metadata();

            let left = 0, top = 0;
            const padding = config.padding;

            switch (config.watermarkPosition) {
                case 'top-left':
                    left = padding;
                    top = padding;
                    break;
                case 'top-right':
                    left = canvasWidth - watermarkMetadata.width - padding;
                    top = padding;
                    break;
                case 'bottom-left':
                    left = padding;
                    top = canvasHeight - watermarkMetadata.height - padding;
                    break;
                case 'bottom-right':
                    left = canvasWidth - watermarkMetadata.width - padding;
                    top = canvasHeight - watermarkMetadata.height - padding;
                    break;
            }
            compositeOperations.push({ 
                input: watermarkBuffer, 
                left: Math.round(left), 
                top: Math.round(top) 
            });
        }

        const finalImage = await processedImage
            .composite(compositeOperations)
            .jpeg({ quality })
            .toBuffer();


        return finalImage;
    }

    private async generateTextLayer(options: {
      text: string;
      width: number;
      position: 'top' | 'bottom';
      fontFamily: string;
      fontSize: number;
      textColor: string;
      strokeColor: string;
      strokeWidth: number;
      textAlign: 'center' | 'left' | 'right';
      padding: number;
    }): Promise<{ buffer: Buffer, height: number }> {
      const { text, width, position, fontFamily, fontSize, textColor, strokeColor, strokeWidth, textAlign, padding } = options;
      
      const textCanvasWidth = width - (padding * 2);
      const lineHeight = fontSize * 1.2;

      // Create a temporary canvas to measure text and determine lines
      const tempCanvas = createCanvas(textCanvasWidth, 100);
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.font = `900 ${fontSize}px ${fontFamily}`;
      
      const textLines = this._wrapText(tempCtx, text, textCanvasWidth);
      const textCanvasHeight = textLines.length * lineHeight + (strokeWidth * 2);

      const canvas = createCanvas(textCanvasWidth, textCanvasHeight);
      const ctx = canvas.getContext('2d');
      ctx.font = `900 ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth ?? 4;
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'top';

      const x = textAlign === 'center' ? textCanvasWidth / 2 : (textAlign === 'left' ? 0 : textCanvasWidth);

      textLines.forEach((line, index) => {
        const y = index * lineHeight + (strokeWidth / 2);
        ctx.strokeText(line, x, y);
        ctx.fillText(line, x, y);
      });

      return { buffer: canvas.toBuffer('image/png'), height: textCanvasHeight };
    }

    private _wrapText(ctx: CanvasRenderingContext2D, textToWrap: string, maxWidth: number): string[] {
      const words = textToWrap.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        // This word is longer than the max width, so we need to break it
        if (ctx.measureText(word).width > maxWidth) {
          // If there's anything on the current line, push it
          if (currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = '';
          }

          // Break the long word itself
          let tempWord = word;
          while (ctx.measureText(tempWord).width > maxWidth) {
            let splitIndex = 0;
            for (let i = 1; i <= tempWord.length; i++) {
              if (ctx.measureText(tempWord.substring(0, i)).width > maxWidth) {
                splitIndex = i - 1;
                break;
              }
            }
            lines.push(tempWord.substring(0, splitIndex));
            tempWord = tempWord.substring(splitIndex);
          }
          currentLine = tempWord + ' ';
          continue;
        }

        const testLine = currentLine + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());
      return lines;
    }
}
