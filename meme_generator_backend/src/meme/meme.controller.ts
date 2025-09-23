import { Body, Controller, Post, Res, HttpCode, HttpStatus, Get, Put, Param, BadRequestException } from '@nestjs/common';
import { MemeService } from './meme.service';
import type { Response } from 'express';
import { CreateMemePreviewDto } from 'src/meme/create-meme-preview.dto';
import { UpdateMemeItemDto } from 'src/meme/update-meme-item.dto';
import { MemeResponseDto } from 'src/meme/meme-response.dto';
import { FontsResponseDto } from 'src/meme/fonts-response.dto';
import { ImageResponseDto } from 'src/meme/image-response.dto';
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
                canvasSize: body.canvasSize ? {
                    width: body.canvasSize.width || 800,
                    height: body.canvasSize.height || 600
                } : undefined,
                textConfig: undefined, // Text config is loaded from database via configId
                watermarkConfig: undefined // Watermark config is loaded from database via configId
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
                canvasSize: body.canvasSize ? {
                    width: body.canvasSize.width || 800,
                    height: body.canvasSize.height || 600
                } : undefined,
                textConfig: undefined, // Text config is loaded from database via configId
                watermarkConfig: undefined // Watermark config is loaded from database via configId
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

    @Put('items')
    @ApiOperation({
        summary: 'Update meme item',
        description: `**Description**

        API to update a meme item with new configuration. This will:
        1. Merge the provided configuration with existing settings (if configId provided)
        2. Generate a new meme with the updated configuration
        3. Return the updated meme as base64 image

        The API supports updating:
        - Image content
        - Text configuration (top/bottom text, font, colors, etc.)
        - Canvas size
        - Watermark settings
        - All styling options`,
    })
    @ApiBody({
        type: UpdateMemeItemDto,
        description: 'Updated meme configuration'
    })
    @ApiOkResponse({
        description: 'Successfully updated meme item',
        type: MemeResponseDto,
    })
    async updateMemeItem(
        @Body() request: UpdateMemeItemDto,
    ): Promise<MemeResponseDto> {
        return await this.memeService.updateMemeItem(request);
    }
}