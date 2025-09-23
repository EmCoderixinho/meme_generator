import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemeItemDto {
  @ApiProperty({
    description: 'Base64 encoded image data',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({
    description: 'Configuration ID for the meme',
    example: 'config-123',
    required: false
  })
  @IsOptional()
  @IsString()
  configId?: string;

  @ApiProperty({
    description: 'Canvas size configuration',
    required: false,
    example: { width: 800, height: 600 }
  })
  @IsOptional()
  canvasSize?: {
    width?: number;
    height?: number;
  };

  @ApiProperty({
    description: 'Top text for the meme',
    example: 'TOP TEXT',
    required: false
  })
  @IsOptional()
  @IsString()
  topText?: string;

  @ApiProperty({
    description: 'Bottom text for the meme',
    example: 'BOTTOM TEXT',
    required: false
  })
  @IsOptional()
  @IsString()
  bottomText?: string;

  @ApiProperty({
    description: 'Font family for the text',
    example: 'Arial',
    required: false
  })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiProperty({
    description: 'Font size for the text',
    example: 24,
    required: false
  })
  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @ApiProperty({
    description: 'Text color',
    example: '#FFFFFF',
    required: false
  })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiProperty({
    description: 'Stroke color for text outline',
    example: '#000000',
    required: false
  })
  @IsOptional()
  @IsString()
  strokeColor?: string;

  @ApiProperty({
    description: 'Stroke width for text outline',
    example: 4,
    required: false
  })
  @IsOptional()
  @IsNumber()
  strokeWidth?: number;

  @ApiProperty({
    description: 'Text alignment',
    example: 'center',
    enum: ['center', 'left', 'right'],
    required: false
  })
  @IsOptional()
  @IsString()
  textAlign?: 'center' | 'left' | 'right';

  @ApiProperty({
    description: 'Padding around the text',
    example: 20,
    required: false
  })
  @IsOptional()
  @IsNumber()
  padding?: number;

  @ApiProperty({
    description: 'Whether to convert text to uppercase',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  allCaps?: boolean;

  @ApiProperty({
    description: 'Watermark image as base64',
    required: false
  })
  @IsOptional()
  @IsString()
  watermarkImage?: string;

  @ApiProperty({
    description: 'Watermark position',
    example: 'bottom-right',
    enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    required: false
  })
  @IsOptional()
  @IsString()
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
