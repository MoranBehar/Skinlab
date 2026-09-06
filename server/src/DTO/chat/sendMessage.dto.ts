import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  body: string;

  // Admin only: which user's conversation to post the message to.
  @IsOptional()
  @IsNumber()
  user_id?: number;
}
