import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  category_id: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  price: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  target_audience: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  skin_type: number;

   @Transform(({ value }) => parseInt(value))
  @IsNumber()
  product_type: number;

  @IsString()
  @IsNotEmpty()
  how_to_use: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsNotEmpty()
  is_available: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percentage?: number;
}

function IsNoEmpty(): (target: CreateProductDto, propertyKey: "name") => void {
  throw new Error('Function not implemented.');
}
