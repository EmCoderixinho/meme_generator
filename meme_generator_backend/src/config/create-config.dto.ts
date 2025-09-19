import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Max, Min } from 'class-validator';
import { TextAlign, WatermarkPosition } from './config.enums';

export class CreateConfigDto {
  @IsString() @IsOptional()
  topText?: string;

  @IsString() @IsOptional()
  bottomText?: string;

  @IsString() @IsOptional()
  fontFamily?: string;

  @IsNumber() @IsOptional()
  fontSize?: number;

  @IsString() @IsOptional()
  textColor?: string;

  @IsString() @IsOptional()
  strokeColor?: string;

  @IsNumber() @IsOptional()
  strokeWidth?: number;

  @IsEnum(TextAlign) @IsOptional()
  textAlign?: TextAlign;

  @IsNumber() @IsOptional()
  padding?: number;

  @IsBoolean() @IsOptional()
  allCaps?: boolean;

  @IsNumber() @IsOptional() @Min(0.01) @Max(0.25)
  scaleDown?: number = 0.05;

  @IsString() @IsOptional()
  watermarkImage?: string;

  @IsEnum(WatermarkPosition) @IsOptional()
  watermarkPosition?: WatermarkPosition;
}
