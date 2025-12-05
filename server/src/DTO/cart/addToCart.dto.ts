import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}