import { ApiProperty } from '@nestjs/swagger';

export class MemeResponseDto {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Generated meme image as base64 string',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  })
  image: string;

  @ApiProperty({
    description: 'Configuration ID used for the meme',
    example: 'config-123'
  })
  configId?: string;

  @ApiProperty({
    description: 'Timestamp when the meme was generated',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp: string;


  @ApiProperty({
    description: 'Text configuration used',
    example: {
      topText: 'TOP TEXT',
      bottomText: 'BOTTOM TEXT',
      fontFamily: 'Arial',
      fontSize: 24,
      textColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 4,
      textAlign: 'center',
      padding: 20,
      allCaps: true
    }
  })
  textConfig?: {
    topText?: string;
    bottomText?: string;
    fontFamily?: string;
    fontSize?: number;
    textColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    textAlign?: 'center' | 'left' | 'right';
    padding?: number;
    allCaps?: boolean;
  };

  @ApiProperty({
    description: 'Watermark configuration used',
    example: {
      position: 'bottom-right'
    }
  })
  watermarkConfig?: {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}
