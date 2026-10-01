import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddInternalNoteDto {
  @ApiProperty({ example: 'Customer called and provided more evidence via email' })
  @IsString()
  @IsNotEmpty()
  note: string;
}
