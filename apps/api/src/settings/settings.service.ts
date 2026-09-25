import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PlatformSetting } from './entities/platform-setting.entity.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  allowSellerRegistration: boolean;
  isMaintenanceMode: boolean;
  sslczStoreId: string;
  sslczIsLive: boolean;
  sslczPublicUrl: string;
  hasSslczPassword: boolean;
}

const KEYS = {
  platformName: 'platformName',
  supportEmail: 'supportEmail',
  supportPhone: 'supportPhone',
  allowSellerRegistration: 'allowSellerRegistration',
  isMaintenanceMode: 'isMaintenanceMode',
  sslczStoreId: 'sslczStoreId',
  sslczStorePassword: 'sslczStorePassword',
  sslczIsLive: 'sslczIsLive',
  sslczPublicUrl: 'sslczPublicUrl',
} as const;

const DEFAULTS = {
  platformName: 'Gramer Bazar',
  supportEmail: 'codeswithrakib@gmail.com',
  supportPhone: '8801767476724',
  allowSellerRegistration: true,
  isMaintenanceMode: false,
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepository: Repository<PlatformSetting>,
    private readonly configService: ConfigService,
  ) {}

  async getSettings(): Promise<PlatformSettings> {
    const rows = await this.settingRepository.find();
    const stored = new Map(rows.map((row) => [row.key, row.value]));

    const envStoreId = this.configService.get<string>('SSLCOMMERZ_STORE_ID') || '';
    const envPassword = this.configService.get<string>('SSLCOMMERZ_STORE_PASSWORD') || '';
    const envIsLive =
      this.configService.get<string>('SSLCOMMERZ_IS_LIVE') === 'true' ||
      this.configService.get<boolean>('SSLCOMMERZ_IS_LIVE') === true;
    const envPublicUrl =
      this.configService.get<string>('SSLCOMMERZ_PUBLIC_URL') ||
      'https://undone-unsure-twisting.ngrok-free.dev';

    return {
      platformName: stored.get(KEYS.platformName) ?? DEFAULTS.platformName,
      supportEmail: stored.get(KEYS.supportEmail) ?? DEFAULTS.supportEmail,
      supportPhone: stored.get(KEYS.supportPhone) ?? DEFAULTS.supportPhone,
      allowSellerRegistration:
        (stored.get(KEYS.allowSellerRegistration) ?? String(DEFAULTS.allowSellerRegistration)) ===
        'true',
      isMaintenanceMode:
        (stored.get(KEYS.isMaintenanceMode) ?? String(DEFAULTS.isMaintenanceMode)) ===
        'true',
      sslczStoreId: stored.get(KEYS.sslczStoreId) ?? envStoreId,
      sslczIsLive:
        (stored.get(KEYS.sslczIsLive) ?? String(envIsLive)) === 'true',
      sslczPublicUrl: stored.get(KEYS.sslczPublicUrl) ?? envPublicUrl,
      hasSslczPassword: Boolean(stored.get(KEYS.sslczStorePassword) || envPassword),
    };
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<PlatformSettings> {
    const entries: [string, string][] = [];

    if (dto.platformName !== undefined) entries.push([KEYS.platformName, dto.platformName]);
    if (dto.supportEmail !== undefined) entries.push([KEYS.supportEmail, dto.supportEmail]);
    if (dto.supportPhone !== undefined) entries.push([KEYS.supportPhone, dto.supportPhone]);
    if (dto.allowSellerRegistration !== undefined) {
      entries.push([KEYS.allowSellerRegistration, String(dto.allowSellerRegistration)]);
    }
    if (dto.isMaintenanceMode !== undefined) {
      entries.push([KEYS.isMaintenanceMode, String(dto.isMaintenanceMode)]);
    }
    if (dto.sslczStoreId !== undefined) {
      entries.push([KEYS.sslczStoreId, dto.sslczStoreId.trim()]);
    }
    if (dto.sslczStorePassword !== undefined && dto.sslczStorePassword.trim() !== '') {
      entries.push([KEYS.sslczStorePassword, dto.sslczStorePassword.trim()]);
    }
    if (dto.sslczIsLive !== undefined) {
      entries.push([KEYS.sslczIsLive, String(dto.sslczIsLive)]);
    }
    if (dto.sslczPublicUrl !== undefined) {
      entries.push([KEYS.sslczPublicUrl, dto.sslczPublicUrl.trim().replace(/\/+$/, '')]);
    }

    if (entries.length > 0) {
      await this.settingRepository.upsert(
        entries.map(([key, value]) => ({ key, value })),
        ['key'],
      );
    }

    return this.getSettings();
  }

  async isSellerRegistrationAllowed(): Promise<boolean> {
    const row = await this.settingRepository.findOne({
      where: { key: KEYS.allowSellerRegistration },
    });
    return row ? row.value === 'true' : DEFAULTS.allowSellerRegistration;
  }

  async getSslcommerzConfig() {
    const settings = await this.getSettings();
    const rows = await this.settingRepository.find();
    const stored = new Map(rows.map((row) => [row.key, row.value]));

    const password =
      stored.get(KEYS.sslczStorePassword) ||
      this.configService.get<string>('SSLCOMMERZ_STORE_PASSWORD') ||
      '';

    return {
      storeId: settings.sslczStoreId,
      storePassword: password,
      isLive: settings.sslczIsLive,
      publicUrl: settings.sslczPublicUrl,
    };
  }
}
