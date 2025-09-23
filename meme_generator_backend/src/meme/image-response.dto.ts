import { ApiProperty } from '@nestjs/swagger';

export class ImageResponseDto {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Generated image as base64 string',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  })
  image: string;

  @ApiProperty({
    description: 'Content type of the generated image',
    example: 'image/png'
  })
  contentType: string;

  @ApiProperty({
    description: 'Timestamp when the image was generated',
    example: '2024-01-15T10:30:00.000Z'
  })
  timestamp: string;
}
