import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RiderAvailability } from '../enums/rider-availability.enum.js';

export class UpdateRiderAvailabilityDto {
  @ApiProperty({
    enum: [RiderAvailability.OFFLINE, RiderAvailability.AVAILABLE],
    example: RiderAvailability.AVAILABLE,
    description:
      'Rider-controlled availability. System-managed BUSY is rejected for manual updates.',
  })
  @IsNotEmpty()
  @IsEnum(RiderAvailability)
  availability: RiderAvailability;
}
