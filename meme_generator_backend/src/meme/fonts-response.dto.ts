import { ApiProperty } from '@nestjs/swagger';

export class FontsResponseDto {
  @ApiProperty({
    description: 'Array of available font families',
    example: ['Arial', 'Times New Roman', 'DejaVu Sans', 'DejaVu Serif', 'FreeSans', 'FreeSerif'],
    type: [String]
  })
  fonts: string[];
}
