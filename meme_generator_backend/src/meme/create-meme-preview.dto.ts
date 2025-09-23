import { IsNotEmpty, IsString, IsOptional, ValidateNested } from 'class-validator';

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
