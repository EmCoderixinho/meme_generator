import { Injectable } from '@nestjs/common';
import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { FontService } from './font.service';

export interface TextLayerOptions {
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
}

export interface TextLayerResult {
  buffer: Buffer;
  height: number;
}

@Injectable()
export class TextRenderingService {
  constructor(private readonly fontService: FontService) {}

  async generateTextLayer(options: TextLayerOptions): Promise<TextLayerResult> {
    const { 
      text, 
      width, 
      position, 
      fontFamily, 
      fontSize, 
      textColor, 
      strokeColor, 
      strokeWidth, 
      textAlign, 
      padding 
    } = options;
    
    const textCanvasWidth = Math.max(width - (padding * 2), 100);
    const lineHeight = fontSize * 1.2;

    // Simple font string with fallbacks
    const safeFontFamily = fontFamily.includes(' ') ? `"${fontFamily}"` : fontFamily;
    const fontString = `bold ${fontSize}px ${safeFontFamily}, Arial, sans-serif`;

    // Create canvas and get text lines
    const canvas = createCanvas(textCanvasWidth, 100);
    const ctx = canvas.getContext('2d');
    ctx.font = fontString;
    
    const textLines = this.wrapText(ctx, text, textCanvasWidth);
    const textCanvasHeight = textLines.length * lineHeight + (strokeWidth * 2);

    // Create final canvas
    const finalCanvas = createCanvas(textCanvasWidth, textCanvasHeight);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.font = fontString;
    finalCtx.fillStyle = textColor;
    finalCtx.strokeStyle = strokeColor;
    finalCtx.lineWidth = strokeWidth ?? 4;
    finalCtx.textAlign = textAlign;
    finalCtx.textBaseline = 'top';

    const x = textAlign === 'center' ? textCanvasWidth / 2 : (textAlign === 'left' ? 0 : textCanvasWidth);

    // Draw text lines
    textLines.forEach((line, index) => {
      const y = index * lineHeight + (strokeWidth / 2);
      finalCtx.strokeText(line, x, y);
      finalCtx.fillText(line, x, y);
    });

    return { buffer: finalCanvas.toBuffer('image/png'), height: textCanvasHeight };
  }

  private wrapText(ctx: CanvasRenderingContext2D, textToWrap: string, maxWidth: number): string[] {
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
