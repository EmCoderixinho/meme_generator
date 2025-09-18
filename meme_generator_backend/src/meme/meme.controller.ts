import { Body, Controller, Post, Res } from '@nestjs/common';
import { MemeService } from './meme.service';
import type { Response } from 'express';
import { CreateMemePreviewDto } from '../dto/create-meme-preview.dto';
import { CreateConfigDto } from '../dto/create-config.dto';

@Controller('api')
export class MemeController {
    constructor(private readonly memeService: MemeService) {}

    @Post('config')
    async saveConfig(@Body() body: CreateConfigDto, @Res() res: Response) {
        try {
            const configId = await this.memeService.saveConfig(body);
            res.status(201).send({ configId });
        } catch (error) {
            console.error('Error saving config:', error);
            res.status(500).send({ message: 'Error while saving config.' });
        }
    }

    @Post('meme/preview')
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