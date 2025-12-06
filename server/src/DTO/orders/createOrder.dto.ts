import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  shipping_type_id: number;

  @IsNotEmpty()
  @IsString()
  credit_card_brand: string;

  @IsNotEmpty()
  @IsString()
  credit_card_last_four_digits: string;

  @IsOptional()
  @IsNumber()
  shipping_address_id?: number;
}