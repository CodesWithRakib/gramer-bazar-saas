import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDeliveryDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  riderId: string;
}
