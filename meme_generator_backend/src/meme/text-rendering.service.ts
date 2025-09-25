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
    
    const textLines = this.wrapText(tempCtx, text, textCanvasWidth);
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

  /**
   * Calculate the optimal font size for text to fit within given dimensions
   */
  calculateOptimalFontSize(
    text: string, 
    maxWidth: number, 
    maxHeight: number, 
    fontFamily: string, 
    padding: number = 20
  ): number {
    const textWidth = maxWidth - (padding * 2);
    const testCanvas = createCanvas(textWidth, 100);
    const testCtx = testCanvas.getContext('2d');
    
    let fontSize = 24;
    let found = false;
    
    // Try decreasing font sizes until text fits
    while (fontSize > 8 && !found) {
      const safeFontFamily = fontFamily.includes(' ') ? `"${fontFamily}"` : fontFamily;
      testCtx.font = `bold ${fontSize}px ${safeFontFamily}, Arial, sans-serif`;
      
      const textLines = this.wrapText(testCtx, text, textWidth);
      const lineHeight = fontSize * 1.2;
      const totalHeight = textLines.length * lineHeight;
      
      if (totalHeight <= maxHeight - (padding * 2)) {
        found = true;
      } else {
        fontSize -= 2;
      }
    }
    
    return Math.max(fontSize, 8); // Minimum font size of 8
  }

  /**
   * Validate if a font is available and working
   */
  validateFont(fontFamily: string, fontSize: number = 24): boolean {
    try {
      const testCanvas = createCanvas(100, 100);
      const testCtx = testCanvas.getContext('2d');
      const safeFontFamily = fontFamily.includes(' ') ? `"${fontFamily}"` : fontFamily;
      testCtx.font = `bold ${fontSize}px ${safeFontFamily}, Arial, sans-serif`;
      
      const metrics = testCtx.measureText('Test');
      return metrics.width > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the best available font from a list of preferred fonts
   */
  getBestAvailableFont(preferredFonts: string[]): string {
    for (const font of preferredFonts) {
      if (this.validateFont(font)) {
        return font;
      }
    }
    
    // Fallback to basic fonts
    const fallbackFonts = ['Arial', 'DejaVu Sans', 'DejaVu Serif', 'FreeSans', 'FreeSerif', 'sans-serif'];
    for (const font of fallbackFonts) {
      if (this.validateFont(font)) {
        return font;
      }
    }
    
    return 'Arial'; // Ultimate fallback
  }
}
