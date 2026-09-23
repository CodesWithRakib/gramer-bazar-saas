import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from './entities/platform-setting.entity.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  allowSellerRegistration: boolean;
  isMaintenanceMode: boolean;
}

const KEYS = {
  platformName: 'platformName',
  supportEmail: 'supportEmail',
  allowSellerRegistration: 'allowSellerRegistration',
  isMaintenanceMode: 'isMaintenanceMode',
} as const;

const DEFAULTS: PlatformSettings = {
  platformName: 'Gramer Bazar',
  supportEmail: 'support@gramerbazar.com',
  allowSellerRegistration: true,
  isMaintenanceMode: false,
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingRepository: Repository<PlatformSetting>,
  ) {}

  async getSettings(): Promise<PlatformSettings> {
    const rows = await this.settingRepository.find();
    const stored = new Map(rows.map((row) => [row.key, row.value]));

    return {
      platformName: stored.get(KEYS.platformName) ?? DEFAULTS.platformName,
      supportEmail: stored.get(KEYS.supportEmail) ?? DEFAULTS.supportEmail,
      allowSellerRegistration:
        (stored.get(KEYS.allowSellerRegistration) ?? String(DEFAULTS.allowSellerRegistration)) ===
        'true',
      isMaintenanceMode:
        (stored.get(KEYS.isMaintenanceMode) ?? String(DEFAULTS.isMaintenanceMode)) ===
        'true',
    };
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<PlatformSettings> {
    const entries: [string, string][] = [];

    if (dto.platformName !== undefined) entries.push([KEYS.platformName, dto.platformName]);
    if (dto.supportEmail !== undefined) entries.push([KEYS.supportEmail, dto.supportEmail]);
    if (dto.allowSellerRegistration !== undefined) {
      entries.push([KEYS.allowSellerRegistration, String(dto.allowSellerRegistration)]);
    }
    if (dto.isMaintenanceMode !== undefined) {
      entries.push([KEYS.isMaintenanceMode, String(dto.isMaintenanceMode)]);
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
}
