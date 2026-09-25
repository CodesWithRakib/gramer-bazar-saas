import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewApplicationDto {
  @ApiProperty({ example: 'Verified trade license and physical shop.', description: 'Admin review notes or rejection reason', required: false })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
