import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, IsEnum, Max } from 'class-validator';

enum TextAlign {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

enum WatermarkPosition {
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
}

export class CreateConfigDto {
  @IsString()
  @IsOptional()
  topText?: string;

  @IsString()
  @IsOptional()
  bottomText?: string;

  @IsString()
  @IsNotEmpty()
  fontFamily: string;

  @IsNumber()
  @IsNotEmpty()
  fontSize: number;

  @IsString()
  @IsNotEmpty()
  textColor: string;

  @IsString()
  @IsNotEmpty()
  strokeColor: string;

  @IsNumber()
  @IsNotEmpty()
  strokeWidth: number;

  @IsEnum(TextAlign)
  @IsNotEmpty()
  textAlign: TextAlign;

  @IsNumber()
  @IsNotEmpty()
  padding: number;

  @IsBoolean()
  @IsNotEmpty()
  allCaps: boolean;

  @IsString()
  @IsOptional()
  watermarkImage?: string;

  @IsEnum(WatermarkPosition)
  @IsOptional()
  watermarkPosition?: WatermarkPosition;

  @IsNumber()
  @Max(0.25)
  @IsNotEmpty()
  scaleDown: number;
}
