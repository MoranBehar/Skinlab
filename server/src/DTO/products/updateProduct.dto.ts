import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseInt(value as string))
  @IsNumber()
  category_id?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseFloat(value as string))
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseInt(value as string))
  @IsNumber()
  target_audience?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseInt(value as string))
  @IsNumber()
  skin_type?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseInt(value as string))
  @IsNumber()
  product_type?: number;

  @IsOptional()
  @IsString()
  how_to_use?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_available?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value ? parseInt(value as string) : null,
  )
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
