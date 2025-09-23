import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { createCanvas, CanvasRenderingContext2D, registerFont } from 'canvas';
import { Config } from 'src/config/config.entity';
import { CreateMemePreviewDto } from 'src/meme/create-meme-preview.dto';
import { UpdateMemeItemDto } from 'src/meme/update-meme-item.dto';
import { MemeResponseDto } from 'src/meme/meme-response.dto';
import { ConfigService } from '../config/config.service';

@Injectable()
export class MemeService {
    private registeredFonts: Set<string> = new Set();
    
    constructor(
      private readonly configService: ConfigService,
    ) {
        // Register common fonts that might be available on the system
        this.registerSystemFonts();
    }

    private registerSystemFonts() {
        console.log('🔤 Starting font registration...');
        
        // First, register Docker-installed fonts
        this.registerEssentialFonts();
        
        // Then register fonts from common locations
        this.registerFontsFromCommonLocations();
        
        // Finally, register some fallback fonts
        this.registerFallbackFonts();
    }

    private registerEssentialFonts() {
        console.log('🔤 Registering Docker-installed fonts...');
        
        // Register fonts from Docker-installed packages (prioritized order)
        const dockerFonts = [
            // Liberation fonts (Arial/Times New Roman replacements)
            { family: 'Arial', path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf' },
            { family: 'Arial Bold', path: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' },
            { family: 'Times New Roman', path: '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf' },
            { family: 'Times New Roman Bold', path: '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf' },
            { family: 'Impact', path: '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' },
            { family: 'Helvetica', path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf' },
            { family: 'Verdana', path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf' },
            
            // DejaVu fonts (high quality, always available)
            { family: 'DejaVu Sans', path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf' },
            { family: 'DejaVu Serif', path: '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf' },
            { family: 'DejaVu Sans Mono', path: '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf' },
            
            // FreeFont fonts (open source)
            { family: 'FreeSans', path: '/usr/share/fonts/truetype/freefont/FreeSans.ttf' },
            { family: 'FreeSerif', path: '/usr/share/fonts/truetype/freefont/FreeSerif.ttf' },
            { family: 'FreeMono', path: '/usr/share/fonts/truetype/freefont/FreeMono.ttf' },
            
            // Noto fonts (Google's universal font family)
            { family: 'Noto Sans', path: '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf' },
            { family: 'Noto Serif', path: '/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf' },
            { family: 'Noto Color Emoji', path: '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf' },
        ];

        let registeredCount = 0;
        dockerFonts.forEach(font => {
            try {
                registerFont(font.path, { family: font.family });
                this.registeredFonts.add(font.family);
                registeredCount++;
                console.log(`✅ Registered Docker font: ${font.family}`);
            } catch (error) {
                console.log(`❌ Docker font not found: ${font.family} at ${font.path}`);
            }
        });
        
        console.log(`🎉 Successfully registered ${registeredCount} Docker-installed fonts`);
    }


    private extractFontName(fontPath: string): string {
        const fileName = fontPath.split('/').pop()?.replace(/\.(ttf|otf)$/i, '') || '';
        
        // Clean up common font naming patterns
        let fontName = fileName
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        
        // Handle specific font families
        if (fontName.includes('LiberationSans')) return 'Arial';
        if (fontName.includes('LiberationSerif')) return 'Times New Roman';
        if (fontName.includes('DejaVuSans')) return 'DejaVu Sans';
        if (fontName.includes('DejaVuSerif')) return 'DejaVu Serif';
        if (fontName.includes('DejaVuSansMono')) return 'DejaVu Sans Mono';
        if (fontName.includes('FreeSans')) return 'FreeSans';
        if (fontName.includes('FreeSerif')) return 'FreeSerif';
        if (fontName.includes('FreeMono')) return 'FreeMono';
        if (fontName.includes('Roboto')) return 'Roboto';
        if (fontName.includes('OpenSans')) return 'Open Sans';
        if (fontName.includes('NotoSans')) return 'Noto Sans';
        if (fontName.includes('Ubuntu')) return 'Ubuntu';
        
        return fontName;
    }


    private registerFontsFromCommonLocations() {
        const fs = require('fs');
        const path = require('path');
        
        // Prioritize Docker-installed font directories first
        const dockerFontDirs = [
            '/usr/share/fonts/truetype/liberation',  // Liberation fonts (Arial/Times replacements)
            '/usr/share/fonts/truetype/dejavu',       // DejaVu fonts (high quality)
            '/usr/share/fonts/truetype/freefont',     // FreeFont fonts (open source)
            '/usr/share/fonts/truetype/noto',         // Noto fonts (Google's universal)
        ];
        
        const otherFontDirs = [
            '/usr/share/fonts/truetype/roboto',
            '/usr/share/fonts/truetype/opensans',
            '/usr/share/fonts/truetype/ubuntu',
            '/usr/share/fonts/opentype/liberation',
            '/usr/share/fonts/opentype/noto',
            '/usr/share/fonts/truetype',
            '/usr/share/fonts/opentype',
            '/usr/share/fonts/Type1',
            '/usr/share/fonts/Type1/100dpi',
            '/usr/share/fonts/Type1/75dpi'
        ];
        
        const commonFontDirs = [...dockerFontDirs, ...otherFontDirs];

        const registeredFonts = new Set();
        let registeredCount = 0;

        commonFontDirs.forEach(dir => {
            try {
                if (fs.existsSync(dir)) {
                    const files = fs.readdirSync(dir);
                    files.forEach((file: string) => {
                        if (file.endsWith('.ttf') || file.endsWith('.otf')) {
                            const fontPath = path.join(dir, file);
                            const fontName = this.extractFontName(fontPath);
                            
                            if (fontName && !registeredFonts.has(fontName)) {
                                try {
                                    registerFont(fontPath, { family: fontName });
                                    registeredFonts.add(fontName);
                                    this.registeredFonts.add(fontName);
                                    registeredCount++;
                                    console.log(`✅ Registered font from common location: ${fontName}`);
                                } catch (error) {
                                    console.log(`❌ Failed to register font: ${fontName} from ${fontPath}`);
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.log(`❌ Could not read font directory ${dir}: ${error.message}`);
            }
        });
        
        console.log(`🎉 Successfully registered ${registeredCount} fonts from common locations`);
    }

    private registerFallbackFonts() {
        console.log('🔤 Registering fallback fonts...');
        
        // Register some basic fallback fonts that should always work
        const fallbackFonts = [
            { family: 'Arial', path: '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf' },
            { family: 'Times New Roman', path: '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf' },
            { family: 'DejaVu Sans', path: '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf' },
            { family: 'DejaVu Serif', path: '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf' },
            { family: 'FreeSans', path: '/usr/share/fonts/truetype/freefont/FreeSans.ttf' },
            { family: 'FreeSerif', path: '/usr/share/fonts/truetype/freefont/FreeSerif.ttf' },
        ];

        let registeredCount = 0;
        fallbackFonts.forEach(font => {
            try {
                registerFont(font.path, { family: font.family });
                this.registeredFonts.add(font.family);
                registeredCount++;
                console.log(`✅ Registered fallback font: ${font.family}`);
            } catch (error) {
                console.log(`❌ Fallback font not found: ${font.family} at ${font.path}`);
            }
        });
        
        console.log(`🎉 Successfully registered ${registeredCount} fallback fonts`);
    }

    async getAvailableFonts(): Promise<string[]> {
        // Return the fonts that were actually successfully registered with canvas
        const registeredFontsArray = Array.from(this.registeredFonts);
        
        // If no fonts were registered, try to get system fonts as fallback
        if (registeredFontsArray.length === 0) {
            try {
                const { execSync } = require('child_process');
                const availableFonts = execSync('fc-list : family', { encoding: 'utf8' });
                const fonts: string[] = availableFonts.trim().split('\n').filter((font: string) => font.trim());
                
                // Clean up font names and remove duplicates
                const cleanedFonts = [...new Set(fonts.map(font => this.cleanFontName(font)))];
                
                // Sort fonts alphabetically
                cleanedFonts.sort();
                
                console.log(`📋 Fallback fonts from system: ${cleanedFonts.join(', ')}`);
                return cleanedFonts;
            } catch (error) {
                console.log('Could not get available fonts:', error.message);
                return ['Arial', 'Times New Roman', 'DejaVu Sans', 'DejaVu Serif', 'FreeSans', 'FreeSerif', 'FreeMono'];
            }
        }
        
        // Sort the registered fonts alphabetically
        registeredFontsArray.sort();
        
        console.log(`📋 Available registered fonts: ${registeredFontsArray.join(', ')}`);
        return registeredFontsArray;
    }

    private cleanFontName(fontName: string): string {
        // Clean up font names
        return fontName
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    async generateMeme(dto: CreateMemePreviewDto, options: { isPreview?: boolean } = { isPreview: true }): Promise<Buffer> {
        const base64Parts = dto.image.split(';base64,');
        const base64Data = base64Parts.pop();

        if (!base64Data) {
            throw new BadRequestException('Invalid image format. Expected a base64 string with a data URL prefix.');
        }
        
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const compositeOperations: sharp.OverlayOptions[] = [];
        
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
        if (dto.configId) {
            try {
                const savedConfig = await this.configService.getConfigById(dto.configId);
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
                console.log(`Loaded config for ID ${dto.configId}:`, {
                    topText: config.topText,
                    bottomText: config.bottomText,
                    fontFamily: config.fontFamily,
                    fontSize: config.fontSize
                });
            } catch (error) {
                console.warn(`Config not found for ID: ${dto.configId}, using defaults:`, error.message);
                // Keep the default config values
            }
        }

        const image = sharp(imageBuffer);
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
          throw new BadRequestException('Could not read image dimensions.');
        }

        const originalWidth = metadata.width;
        const originalHeight = metadata.height;

        let targetWidth = originalWidth;
        let targetHeight = originalHeight;
        let quality = 95;

        if (options.isPreview) {
          const scaleDown = config.scaleDown ?? 0.05;
          targetWidth = dto.canvasSize?.width ?? originalWidth;
          targetHeight = dto.canvasSize?.height ?? originalHeight;
          quality = Math.max(1, Math.min(100, Math.floor(scaleDown * 100)));
        }

        const processedImage = image.clone();

        const topText = config.allCaps && config.topText ? config.topText.toUpperCase() : config.topText;
        const bottomText = config.allCaps && config.bottomText ? config.bottomText.toUpperCase() : config.bottomText;

        if (topText) {
          const { buffer: topSvg} =
            await this.generateTextLayer({
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

        if (bottomText) {
          const { buffer: bottomSvg, height: bottomSvgHeight } =
            await this.generateTextLayer({
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

        await this._addWatermark(compositeOperations, config, originalWidth, originalHeight);

        let finalImage = await processedImage
          .composite(compositeOperations)
          .jpeg({ quality })
          .toBuffer();

        if (options.isPreview && dto.canvasSize) {
          finalImage = await sharp(finalImage)
            .resize({
              width: targetWidth,
              height: targetHeight,
              fit: 'fill',
            })
            .jpeg({ quality })
            .toBuffer();
        }


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
      
      console.log(`Generating text layer with fontFamily: ${fontFamily}, fontSize: ${fontSize}, text: ${text}`);
      
      const textCanvasWidth = Math.max(width - (padding * 2), 100); // Ensure minimum width
      const lineHeight = fontSize * 1.2;

      // Ensure font family is properly quoted if it contains spaces and add fallbacks
      const safeFontFamily = fontFamily.includes(' ') ? `"${fontFamily}"` : fontFamily;
      
      // Try different font weights to see which one works
      const fontWeights = ['bold', '900', '800', '700', '600', '500', '400', 'normal'];
      let fontString = `bold ${fontSize}px ${safeFontFamily}, Arial, sans-serif`;
      
      // Test if the font is available by trying different weights
      const testCanvas = createCanvas(100, 100);
      const testCtx = testCanvas.getContext('2d');
      
      let fontFound = false;
      for (const weight of fontWeights) {
        const testFontString = `${weight} ${fontSize}px ${safeFontFamily}, Arial, sans-serif`;
        testCtx.font = testFontString;
        const metrics = testCtx.measureText('Test');
        if (metrics.width > 0) {
          fontString = testFontString;
          fontFound = true;
          console.log(`Using font weight: ${weight} for font: ${fontFamily}`);
          break;
        }
      }
      
      // If the requested font doesn't work, try fallback fonts
      if (!fontFound) {
        const fallbackFonts = ['Arial', 'DejaVu Sans', 'DejaVu Serif', 'FreeSans', 'FreeSerif', 'sans-serif'];
        for (const fallbackFont of fallbackFonts) {
          const testFontString = `bold ${fontSize}px ${fallbackFont}`;
          testCtx.font = testFontString;
          const metrics = testCtx.measureText('Test');
          if (metrics.width > 0) {
            fontString = testFontString;
            console.log(`Using fallback font: ${fallbackFont} instead of ${fontFamily}`);
            break;
          }
        }
      }

      // Create a temporary canvas to measure text and determine lines
      const tempCanvas = createCanvas(textCanvasWidth, 100);
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.font = fontString;
      
      const textLines = this._wrapText(tempCtx, text, textCanvasWidth);
      const textCanvasHeight = textLines.length * lineHeight + (strokeWidth * 2);

      const canvas = createCanvas(textCanvasWidth, textCanvasHeight);
      const ctx = canvas.getContext('2d');
      ctx.font = fontString;
      console.log(`Canvas font set to: ${ctx.font}`);
      
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

    private async _addWatermark(compositeOperations: sharp.OverlayOptions[], config: Config, canvasWidth: number, canvasHeight: number): Promise<void> {
        if (config.watermarkImage && config.watermarkPosition) {
            const watermarkBase64Parts = config.watermarkImage.split(';base64,');
            const watermarkBase64Data = watermarkBase64Parts.pop();

            if (!watermarkBase64Data) {
                throw new BadRequestException('Invalid watermark image format. Expected a base64 string with a data URL prefix.');
            }

            let watermarkBuffer = Buffer.from(watermarkBase64Data, 'base64');
            let watermarkImage = sharp(watermarkBuffer);
            let watermarkMetadata = await watermarkImage.metadata();

            const maxWatermarkWidth = canvasWidth * 0.25;
            const maxWatermarkHeight = canvasHeight * 0.25;

            if (watermarkMetadata.width > maxWatermarkWidth || watermarkMetadata.height > maxWatermarkHeight) {
                watermarkImage = watermarkImage.resize({
                    width: Math.round(maxWatermarkWidth),
                    height: Math.round(maxWatermarkHeight),
                    fit: 'inside', 
                    withoutEnlargement: true, 
                });
                
                const resizedWatermarkBuffer = await watermarkImage.toBuffer();
                watermarkBuffer = Buffer.from(resizedWatermarkBuffer);
                watermarkMetadata = await sharp(watermarkBuffer).metadata();
            }

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
    }

    async updateMemeItem(updateDto: UpdateMemeItemDto): Promise<MemeResponseDto> {
        try {
            // Get configuration if configId is provided
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

            if (updateDto.configId) {
                try {
                    const savedConfig = await this.configService.getConfigById(updateDto.configId);
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
                    console.log(`Loaded config for ID ${updateDto.configId}:`, {
                        topText: config.topText,
                        bottomText: config.bottomText,
                        fontFamily: config.fontFamily,
                        fontSize: config.fontSize
                    });
                } catch (error) {
                    console.warn(`Config not found for ID: ${updateDto.configId}, using defaults:`, error.message);
                    // Keep the default config values
                }
            }

            // Merge update data with existing config
            const mergedConfig = {
                ...config,
                ...updateDto,
                // Ensure required fields have defaults
                fontFamily: updateDto.fontFamily || config.fontFamily,
                fontSize: updateDto.fontSize || config.fontSize,
                textColor: updateDto.textColor || config.textColor,
                strokeColor: updateDto.strokeColor || config.strokeColor,
                strokeWidth: updateDto.strokeWidth || config.strokeWidth,
                textAlign: updateDto.textAlign || config.textAlign,
                padding: updateDto.padding || config.padding,
                allCaps: updateDto.allCaps !== undefined ? updateDto.allCaps : config.allCaps,
            };

            // Generate the updated meme
            const imageBuffer = await this.generateMeme({
                image: updateDto.image,
                configId: updateDto.configId,
                canvasSize: updateDto.canvasSize
            }, { isPreview: false });

            // Convert buffer to base64
            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

            // Return response
            return {
                success: true,
                image: base64Image,
                configId: updateDto.configId,
                timestamp: new Date().toISOString(),
                canvasSize: updateDto.canvasSize ? {
                    width: updateDto.canvasSize.width || 800,
                    height: updateDto.canvasSize.height || 600
                } : undefined,
                textConfig: {
                    topText: mergedConfig.topText,
                    bottomText: mergedConfig.bottomText,
                    fontFamily: mergedConfig.fontFamily,
                    fontSize: mergedConfig.fontSize,
                    textColor: mergedConfig.textColor,
                    strokeColor: mergedConfig.strokeColor,
                    strokeWidth: mergedConfig.strokeWidth,
                    textAlign: mergedConfig.textAlign,
                    padding: mergedConfig.padding,
                    allCaps: mergedConfig.allCaps,
                },
                watermarkConfig: updateDto.watermarkImage ? {
                    position: updateDto.watermarkPosition
                } : undefined
            };
        } catch (error) {
            console.error('Error updating meme item:', error);
            throw new BadRequestException(`Failed to update meme item: ${error.message}`);
        }
    }
}
