import { IsNotEmpty, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateConfigDto } from 'src/config/create-config.dto';

export class CreateMemePreviewDto {
  @IsNotEmpty()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  configId?: string;

  @IsOptional()
  canvasSize?: {
    width?: number;
    height?: number;
  };
}
