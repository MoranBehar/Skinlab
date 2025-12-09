import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class ShippingAddressDto {

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  apartment_number: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  floor_number: number;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
