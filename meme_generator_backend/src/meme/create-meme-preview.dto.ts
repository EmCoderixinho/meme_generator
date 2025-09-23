import { IsNotEmpty, IsString, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemePreviewDto {
  @ApiProperty({
    description: 'Base64 encoded image data with data URL prefix',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({
    description: 'Configuration ID for the meme (optional)',
    example: 'config-123',
    required: false
  })
  @IsOptional()
  @IsString()
  configId?: string;

  @ApiProperty({
    description: 'Canvas size configuration for the meme',
    required: false,
    example: { width: 800, height: 600 }
  })
  @IsOptional()
  canvasSize?: {
    width?: number;
    height?: number;
  };
}
