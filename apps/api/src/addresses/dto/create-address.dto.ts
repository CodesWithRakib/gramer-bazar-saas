import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Rakib Hasan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  contactName: string;

  @ApiProperty({ example: '+8801700000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  contactPhone: string;

  @ApiPropertyOptional({ example: 'uuid-country' })
  @IsUUID()
  @IsOptional()
  countryId?: string;

  @ApiPropertyOptional({ example: 'uuid-division' })
  @IsUUID()
  @IsOptional()
  divisionId?: string;

  @ApiPropertyOptional({ example: 'uuid-district' })
  @IsUUID()
  @IsOptional()
  districtId?: string;

  @ApiPropertyOptional({ example: 'uuid-upazila' })
  @IsUUID()
  @IsOptional()
  upazilaId?: string;

  @ApiPropertyOptional({ example: 'uuid-union' })
  @IsUUID()
  @IsOptional()
  unionId?: string;

  @ApiPropertyOptional({ example: 'uuid-area' })
  @IsUUID()
  @IsOptional()
  areaId?: string;

  @ApiProperty({ example: 'House 10, Road 2, Block A' })
  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
