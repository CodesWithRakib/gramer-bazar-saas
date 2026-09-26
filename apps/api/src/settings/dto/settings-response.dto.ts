import { ApiProperty } from '@nestjs/swagger';

export class PlatformSettingsResponseDto {
  @ApiProperty({ example: 'Gramer Bazar' })
  platformName: string;

  @ApiProperty({ example: 'support@gramerbazar.com' })
  supportEmail: string;

  @ApiProperty({ example: '8801767476724' })
  supportPhone: string;

  @ApiProperty({ example: true })
  allowSellerRegistration: boolean;

  @ApiProperty({ example: false })
  isMaintenanceMode: boolean;

  @ApiProperty({ example: 'gramer64b2a8d' })
  sslczStoreId: string;

  @ApiProperty({ example: false })
  sslczIsLive: boolean;

  @ApiProperty({ example: 'https://api.gramerbazar.com' })
  sslczPublicUrl: string;

  @ApiProperty({ example: true, description: 'True if gateway password is configured in settings or environment' })
  hasSslczPassword: boolean;
}
