import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddDisputeMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  attachment?: string;
}
