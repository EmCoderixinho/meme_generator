import { Body, Controller, Post, Res } from '@nestjs/common';
import { MemeService } from './meme.service';
import type { Response } from 'express';
import { CreateMemePreviewDto } from 'src/meme/create-meme-preview.dto';

@Controller('api/meme')
export class MemeController {
    constructor(private readonly memeService: MemeService) {}

    @Post('preview')
    async createPreview(@Body() body: CreateMemePreviewDto, @Res() res: Response) {
        try {
            const imageBuffer = await this.memeService.generateMeme(body);
            res.setHeader('Content-Type', 'image/png');
            res.send(imageBuffer);
        } catch (error) {
            console.error('Error generating meme preview:', error);
            res.status(500).send({ message: 'Error while generating meme preview.' });
        }
    }
}