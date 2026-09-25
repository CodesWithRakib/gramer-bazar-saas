import { IsNotEmpty, IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSellerApplicationDto {
  @ApiProperty({ example: 'Green Agro Farm', description: 'Shop name in English' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  shopNameEn: string;

  @ApiProperty({ example: 'গ্রিন এগ্রো ফার্ম', description: 'Shop name in Bengali' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  shopNameBn: string;

  @ApiProperty({ example: 'green-agro-farm', description: 'Desired shop slug (alphanumeric and dashes)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  shopSlug: string;

  @ApiProperty({ example: '01711223344', description: 'Contact phone number' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'agro@example.com', description: 'Contact email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Supplying fresh organic vegetables and dairy products', description: 'Description of the shop', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Khansama Bazar, Dinajpur', description: 'Physical shop address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'TL-12345678', description: 'Trade License Number', required: false })
  @IsOptional()
  @IsString()
  tradeLicenseNumber?: string;

  @ApiProperty({ example: '19901234567890123', description: 'National ID Number', required: false })
  @IsOptional()
  @IsString()
  nidNumber?: string;
}
