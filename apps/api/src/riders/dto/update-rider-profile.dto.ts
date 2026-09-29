import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const RIDER_VEHICLE_TYPES = ['BIKE', 'MOTORCYCLE', 'BICYCLE', 'SCOOTER', 'WALKING'] as const;

/** Self-service editable rider profile fields. Verified identity fields are intentionally excluded. */
export class UpdateRiderProfileDto {
  @ApiPropertyOptional({ example: 'House 12, Station Road, Debiganj, Panchagarh' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'Debiganj Sadar' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  preferredZone?: string;

  @ApiPropertyOptional({ example: '01798001122 (Brother)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyContact?: string;

  @ApiPropertyOptional({ enum: RIDER_VEHICLE_TYPES, example: 'BIKE' })
  @IsOptional()
  @IsIn(RIDER_VEHICLE_TYPES as unknown as string[])
  vehicleType?: string;

  @ApiPropertyOptional({ example: 'DHK-METRO-HA-5542' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vehiclePlateNumber?: string;
}
