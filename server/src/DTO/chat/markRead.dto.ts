import { IsOptional, IsNumber } from 'class-validator';

export class MarkReadDto {
  // Admin only: which user's conversation to mark as read.
  @IsOptional()
  @IsNumber()
  user_id?: number;
}
