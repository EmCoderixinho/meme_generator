import { Injectable } from '@nestjs/common';
import { registerFont } from 'canvas';

@Injectable()
export class FontService {
    private registeredFonts: Set<string> = new Set();
    
    constructor() {
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

    isFontRegistered(fontFamily: string): boolean {
        return this.registeredFonts.has(fontFamily);
    }

    getRegisteredFonts(): string[] {
        return Array.from(this.registeredFonts);
    }
}
