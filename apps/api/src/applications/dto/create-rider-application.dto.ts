import { IsNotEmpty, IsString, IsOptional, IsEmail, MaxLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRiderApplicationDto {
  @ApiProperty({ example: 'Rahim Uddin', description: 'Full legal name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ example: '01711223344', description: 'Contact phone number' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'rahim@example.com', description: 'Contact email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '19901234567890123', description: 'National ID Number' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  nidNumber: string;

  @ApiProperty({ example: 'BIKE', description: 'Vehicle type (BIKE, BICYCLE, SCOOTER, WALKING)' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['BIKE', 'BICYCLE', 'SCOOTER', 'WALKING'])
  vehicleType: string;

  @ApiProperty({ example: 'DHAKA-METRO-HA-1234', description: 'Vehicle plate number', required: false })
  @IsOptional()
  @IsString()
  vehiclePlateNumber?: string;

  @ApiProperty({ example: 'DL-987654321', description: 'Driving license number', required: false })
  @IsOptional()
  @IsString()
  drivingLicenseNumber?: string;

  @ApiProperty({ example: 'Khansama Sadar', description: 'Preferred delivery zone', required: false })
  @IsOptional()
  @IsString()
  preferredZone?: string;

  @ApiProperty({ example: '01799887766 (Brother)', description: 'Emergency contact number and relationship', required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;
}
