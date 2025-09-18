import { Injectable, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../entity/config.entity';
import { CreateMemePreviewDto } from '../dto/create-meme-preview.dto';
import { CreateConfigDto } from '../dto/create-config.dto';

@Injectable()
export class MemeService {
    constructor(
        @InjectRepository(Config)
        private configRepository: Repository<Config>,
    ) {}

    public async saveConfig(dto: CreateConfigDto): Promise<string> {
        const config = this.configRepository.create(dto);
        await this.configRepository.save(config);
        return config.id;
    }

    async generateMeme(dto: CreateMemePreviewDto): Promise<Buffer> {
        const base64Parts = dto.image.split(';base64,');
        const base64Data = base64Parts.pop();

        if (!base64Data) {
            throw new Error('Invalid image format. Expected a base64 string with a data URL prefix.');
        }
        
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const compositeOperations: sharp.OverlayOptions[] = [];
        
        let config: Config;

        if (dto.configId) {
            const foundConfig = await this.configRepository.findOne({ where: { id: dto.configId } });
            if (!foundConfig) {
                throw new NotFoundException(`Config with ID ${dto.configId} not found.`);
            }
            config = foundConfig;
        } else {
            throw new Error('configId is required for this endpoint.');
        }

        const image = sharp(imageBuffer);
        const metadata = await image.metadata();
        
        // Koristi scaleDown svojstvo iz baze podataka
        const scaledWidth = Math.floor(metadata.width * config.scaleDown);
        const scaledHeight = Math.floor(metadata.height * config.scaleDown);

        const scaledImage = image.resize(scaledWidth, scaledHeight);

        const topText = config.allCaps && config.topText ? config.topText.toUpperCase() : config.topText;
        const bottomText = config.allCaps && config.bottomText ? config.bottomText.toUpperCase() : config.bottomText;

        if (topText) {
            const topSvg = this.generateTextSvg({ ...config, text: topText, width: scaledWidth, position: 'top' });
            compositeOperations.push({ input: Buffer.from(topSvg), top: config.padding, left: config.padding });
        }

        if (bottomText) {
            const bottomSvg = this.generateTextSvg({ ...config, text: bottomText, width: scaledWidth, position: 'bottom' });
            const bottomTextOffset = scaledHeight - 100 - config.padding; 
            compositeOperations.push({ input: Buffer.from(bottomSvg), top: bottomTextOffset, left: config.padding });
        }

        if (config.watermarkImage && config.watermarkPosition) {
            const watermarkBase64Parts = config.watermarkImage.split(';base64,');
            const watermarkBase64Data = watermarkBase64Parts.pop();

            if (!watermarkBase64Data) {
                throw new Error('Invalid watermark image format. Expected a base64 string with a data URL prefix.');
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
                    left = scaledWidth - watermarkMetadata.width - padding;
                    top = padding;
                    break;
                case 'bottom-left':
                    left = padding;
                    top = scaledHeight - watermarkMetadata.height - padding;
                    break;
                case 'bottom-right':
                    left = scaledWidth - watermarkMetadata.width - padding;
                    top = scaledHeight - watermarkMetadata.height - padding;
                    break;
            }
            compositeOperations.push({ input: watermarkBuffer, left: left, top: top });
        }

        const finalImage = await scaledImage
            .composite(compositeOperations)
            .png()
            .toBuffer();

        return finalImage;
    }

    private generateTextSvg(options: {
      text: string;
      width: number;
      position: 'top' | 'bottom';
      fontFamily: string;
      fontSize: number;
      textColor: string;
      strokeColor: string;
      strokeWidth: number;
      textAlign: string;
      padding: number;
    }): string {
      const { text, width, position, fontFamily, fontSize, textColor, strokeColor, strokeWidth, textAlign, padding } = options;
      
      const svgWidth = width - (padding * 2);
      const svgX = textAlign === 'center' ? svgWidth / 2 : (textAlign === 'left' ? 0 : svgWidth);
      const anchor = textAlign === 'center' ? 'middle' : (textAlign === 'left' ? 'start' : 'end');
      const baseline = position === 'top' ? 'hanging' : 'auto';
      
      return `
        <svg width="${svgWidth}" height="100">
          <style>
            .text {
              font-family: ${fontFamily};
              font-size: ${fontSize}px;
              fill: ${textColor};
              stroke: ${strokeColor};
              stroke-width: ${strokeWidth}px;
              text-anchor: ${anchor};
              dominant-baseline: ${baseline};
              font-weight: 900;
              text-shadow: 2px 2px 4px #000000;
            }
          </style>
          <text x="${svgX}" y="${position === 'top' ? 10 : 90}" class="text">${text}</text>
        </svg>
      `;
    }
}
