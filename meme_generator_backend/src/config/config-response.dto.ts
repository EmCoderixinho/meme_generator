import { ApiProperty } from '@nestjs/swagger';
import { TextAlign, WatermarkPosition } from './config.enums';

export class ConfigResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the configuration',
    example: 'config-123'
  })
  id: string;

  @ApiProperty({
    description: 'Top text for the meme',
    example: 'TOP TEXT',
    required: false
  })
  topText?: string;

  @ApiProperty({
    description: 'Bottom text for the meme',
    example: 'BOTTOM TEXT',
    required: false
  })
  bottomText?: string;

  @ApiProperty({
    description: 'Font family for the text',
    example: 'Arial',
    required: false
  })
  fontFamily?: string;

  @ApiProperty({
    description: 'Font size in pixels',
    example: 24,
    required: false
  })
  fontSize?: number;

  @ApiProperty({
    description: 'Text color in hex format',
    example: '#FFFFFF',
    required: false
  })
  textColor?: string;

  @ApiProperty({
    description: 'Text stroke color in hex format',
    example: '#000000',
    required: false
  })
  strokeColor?: string;

  @ApiProperty({
    description: 'Text stroke width in pixels',
    example: 4,
    required: false
  })
  strokeWidth?: number;

  @ApiProperty({
    description: 'Text alignment',
    enum: TextAlign,
    example: TextAlign.Center,
    required: false
  })
  textAlign?: TextAlign;

  @ApiProperty({
    description: 'Padding around the text in pixels',
    example: 20,
    required: false
  })
  padding?: number;

  @ApiProperty({
    description: 'Whether to display text in all caps',
    example: false,
    required: false
  })
  allCaps?: boolean;

  @ApiProperty({
    description: 'Scale down factor for image processing (0.01 to 0.25)',
    example: 0.05,
    minimum: 0.01,
    maximum: 0.25,
    required: false
  })
  scaleDown?: number;

  @ApiProperty({
    description: 'Base64 encoded watermark image',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    required: false
  })
  watermarkImage?: string;

  @ApiProperty({
    description: 'Position of the watermark on the image',
    enum: WatermarkPosition,
    example: WatermarkPosition.BottomRight,
    required: false
  })
  watermarkPosition?: WatermarkPosition;

  @ApiProperty({
    description: 'Timestamp when the configuration was created',
    example: '2025-09-23T19:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the configuration was last updated',
    example: '2025-09-23T19:00:00.000Z'
  })
  updatedAt: Date;
}

export class ConfigIdResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the saved configuration',
    example: 'config-123'
  })
  id: string;
}
