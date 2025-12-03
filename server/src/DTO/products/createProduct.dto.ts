import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  category_id: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  target_audience: number;

  @IsNumber()
  skin_type: number;

  @IsNumber()
  product_type: number;

  @IsString()
  how_to_use: string;

  @IsBoolean()
  is_available: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percentage?: number;
}