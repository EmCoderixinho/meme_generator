import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FontService {
  private registeredFonts: Set<string> = new Set();
  
  constructor() {
    this.registerCustomFonts();
  }

  private registerCustomFonts() {
    try {
      // Register custom fonts from the directory where Dockerfile copies them
      const customFontsDir = '/usr/share/fonts/truetype/custom';
      if (fs.existsSync(customFontsDir)) {
        const fontFiles = fs.readdirSync(customFontsDir);
        
        fontFiles.forEach((file: string) => {
          if (file.endsWith('.ttf')) {
            const fontPath = path.join(customFontsDir, file);
            const fontName = this.extractFontName(file);
            
            try {
              if (fs.existsSync(fontPath)) {
                // Register each font file with its own unique name
                registerFont(fontPath, { family: fontName });
                this.registeredFonts.add(fontName);
              }
            } catch (error) {
              console.log(`❌ Failed to register font ${fontName}: ${error.message}`);
            }
          }
        });
      } else {
        console.log(`❌ Custom fonts directory not found: ${customFontsDir}`);
      }
    } catch (error) {
      console.log('Could not register custom fonts:', error.message);
    }
  }

  private extractFontName(filename: string): string {
    // Extract font name from filename and make it user-friendly
    let name = filename.replace(/\.ttf$/i, '');
    
    // Replace underscores and hyphens with spaces for better readability
    name = name.replace(/[_-]/g, ' ');
    
    // Handle special cases
    if (name === 'unicode impact') {
      return 'Impact Unicode';
    }
    
    return name;
  }

  async getAvailableFonts(): Promise<string[]> {
    try {
      // Get system fonts
      const output = execSync("fc-list : family").toString();
      const systemFonts = output
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => line.split(',')[0].trim().replace(/"/g, ''))
        .filter(font => font.length > 0);
      
      // Add our registered custom fonts
      const customFonts = Array.from(this.registeredFonts);
      
      // Combine and sort (custom fonts first, then system fonts)
      const allFonts = [...customFonts, ...systemFonts];
      const uniqueFonts = [...new Set(allFonts)].sort();
      
      console.log(`📋 Available fonts: ${uniqueFonts.length} total (${customFonts.length} custom + ${systemFonts.length} system)`);
      return uniqueFonts;
    } catch (err) {
      console.log('Error getting fonts:', err.message);
      // Fallback to custom fonts + basic system fonts
      const customFonts = Array.from(this.registeredFonts);
      return [
        ...customFonts,
        'Liberation Sans', 'DejaVu Sans', 'DejaVu Serif', 'Noto Sans', 'Noto Serif'
      ];
    }
  }
}
