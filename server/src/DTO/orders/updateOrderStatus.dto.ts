import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsNumber()
  status_id: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
