import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Transform(({ value }: { value: unknown }) => parseInt(value as string))
  @IsNumber()
  category_id: number;

  @Transform(({ value }: { value: unknown }) => parseFloat(value as string))
  @IsNumber()
  @Min(0)
  price: number;

  @Transform(({ value }: { value: unknown }) => parseInt(value as string))
  @IsNumber()
  target_audience: number;

  @Transform(({ value }: { value: unknown }) => parseInt(value as string))
  @IsNumber()
  skin_type: number;

  @Transform(({ value }: { value: unknown }) => parseInt(value as string))
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
  @Transform(({ value }: { value: unknown }) =>
    value ? parseInt(value as string) : null,
  )
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_percentage?: number;
}
