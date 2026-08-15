import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RATING_DESC = 'rating_desc',
  NEWEST = 'newest',
  NAME_ASC = 'name_asc',
}

export class FilterProductsDto {
  // filters
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  category_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skin_type?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  target_audience?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  product_type?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  // sorting
  @IsOptional()
  @IsEnum(SortBy)
  sort_by?: SortBy;

  // search
  @IsOptional()
  @IsString()
  search?: string;

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 12;
}
