import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateMemePreviewDto {
  @IsNotEmpty()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  configId?: string;

  @IsOptional()
  config?: {
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
    watermarkImage?: string;
    watermarkPosition?: string;
    scaleDown?: number;
  };

  @IsOptional()
  canvasSize?: {
    width?: number;
    height?: number;
  };
}
