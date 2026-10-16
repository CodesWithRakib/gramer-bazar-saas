import { IsNotEmpty, IsString, IsOptional, IsEmail, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerInquiryStatus } from '../entities/partner-inquiry.entity.js';

export class CreatePartnerInquiryDto {
  @ApiProperty({ example: 'Pran-RFL Agro Sourcing Unit', description: 'Organization or cooperative name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  organizationName: string;

  @ApiPropertyOptional({ example: 'Abdur Rahim', description: 'Contact person name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'Procurement Manager', description: 'Designation' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  designation?: string;

  @ApiProperty({ example: '01712345678', description: 'Contact mobile number' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ example: 'partner@example.com', description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ example: 'INSTITUTIONAL_BUYER', description: 'Type of partnership' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  partnerType?: string;

  @ApiPropertyOptional({ example: 'Dhaka & Dinajpur Hub', description: 'Location / Region' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @ApiPropertyOptional({ example: 'Monthly supply of 10 tons aromatic Chinigura rice', description: 'Requirements' })
  @IsOptional()
  @IsString()
  requirements?: string;
}

export class UpdatePartnerInquiryStatusDto {
  @ApiProperty({ enum: PartnerInquiryStatus, example: PartnerInquiryStatus.CONTACTED })
  @IsNotEmpty()
  @IsEnum(PartnerInquiryStatus)
  status: PartnerInquiryStatus;

  @ApiPropertyOptional({ example: 'Called procurement manager; sending proposal document.', description: 'Admin review notes' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
