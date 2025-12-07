import { IsNotEmpty, IsNumber, IsString, IsOptional, Matches, Length } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  shipping_type_id: number;

  @IsNotEmpty()
  @IsString()
  credit_card_brand: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'credit_card_last_four_digits must be exactly 4 digits' })
  credit_card_last_four_digits: string;

  @IsOptional()
  @IsNumber()
  shipping_address_id?: number;
}