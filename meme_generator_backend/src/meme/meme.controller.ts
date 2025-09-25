import { Body, Controller, Post, Res, HttpCode, HttpStatus, Get, Put, Param, BadRequestException } from '@nestjs/common';
import { MemeService } from './meme.service';
import { CreateMemePreviewDto } from './create-meme-preview.dto';
import { MemeResponseDto } from './meme-response.dto';
import { FontsResponseDto } from './fonts-response.dto';
import { ApiOperation, ApiParam, ApiOkResponse, ApiTags, ApiBody, ApiConsumes, ApiProduces } from '@nestjs/swagger';

@ApiTags('Meme Generator')
@Controller('api/meme')
export class MemeController {
    constructor(private readonly memeService: MemeService) {}

    @Post('preview')
    @ApiOperation({
        summary: 'Generate meme preview',
        description: `**Description**

        API to generate a preview of a meme with the provided configuration. This will:
        1. Process the base64 image data
        2. Apply text overlays (top and bottom text)
        3. Apply styling (fonts, colors, stroke, etc.)
        4. Return a preview image in PNG format

        **Use Cases:**
        - Quick preview before final generation
        - Testing different text configurations
        - Real-time preview in UI applications`,
    })
    @ApiBody({
        type: CreateMemePreviewDto,
        description: 'Meme configuration for preview generation'
    })
    @ApiConsumes('application/json')
    @ApiProduces('application/json')
    @ApiOkResponse({
        description: 'Successfully generated meme preview',
        type: MemeResponseDto,
    })
    async createPreview(@Body() body: CreateMemePreviewDto): Promise<MemeResponseDto> {
        try {
            const imageBuffer = await this.memeService.generateMeme(body);
            const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
            
            return {
                success: true,
                image: base64Image,
                configId: body.configId,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Error generating meme preview:', error);
            throw new BadRequestException(`Failed to generate meme preview: ${error.message}`);
        }
    }

    @Post('generate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generate final meme',
        description: `**Description**

        API to generate the final, high-quality meme with the provided configuration. This will:
        1. Process the base64 image data
        2. Apply text overlays with full styling
        3. Apply watermark if configured
        4. Return a high-quality JPEG image

        **Use Cases:**
        - Final meme generation for sharing
        - High-quality output for printing
        - Production-ready meme creation

        **Note:** This endpoint returns JPEG format for better compression and quality.`,
    })
    @ApiBody({
        type: CreateMemePreviewDto,
        description: 'Meme configuration for final generation'
    })
    @ApiConsumes('application/json')
    @ApiProduces('application/json')
    @ApiOkResponse({
        description: 'Successfully generated final meme',
        type: MemeResponseDto,
    })
    async generate(@Body() body: CreateMemePreviewDto): Promise<MemeResponseDto> {
        try {
            const imageBuffer = await this.memeService.generateMeme(body, { isPreview: false });
            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            
            return {
                success: true,
                image: base64Image,
                configId: body.configId,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Error generating meme:', error);
            throw new BadRequestException(`Failed to generate meme: ${error.message}`);
        }
    }

    @Get('fonts')
    @ApiOperation({
        summary: 'Get available fonts',
        description: `**Description**

        API to retrieve the list of available fonts that can be used for meme text generation. This will:
        1. Return system-discovered fonts
        2. Include fallback fonts if system discovery fails
        3. Provide a sorted list of font families

        **Use Cases:**
        - Populate font selection dropdowns in UI
        - Validate font choices before meme generation
        - Display available options to users

        **Note:** Font availability depends on the server's installed fonts.`,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved available fonts',
        type: FontsResponseDto,
    })
    async getAvailableFonts(): Promise<FontsResponseDto> {
        try {
            const fonts = await this.memeService.getAvailableFonts();
            return { fonts };
        } catch (error) {
            console.error('Error getting available fonts:', error);
            return { fonts: ['Arial', 'DejaVu Sans', 'DejaVu Serif', 'FreeSans', 'FreeSerif'] };
        }
    }

}