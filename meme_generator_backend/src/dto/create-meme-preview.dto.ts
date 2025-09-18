import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateMemePreviewDto {
  @IsNotEmpty()
  @IsString()
  image: string;
  
  @IsString()
  @IsOptional()
  configId?: string;
}