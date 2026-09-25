import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PlatformSetting } from './entities/platform-setting.entity.js';
import { SettingsService } from './settings.service.js';

describe('SettingsService', () => {
  let service: SettingsService;
  const repository = {
    find: vi.fn(),
    findOne: vi.fn(),
    upsert: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn((key: string) => {
      if (key === 'SSLCOMMERZ_STORE_ID') return 'test_store_id';
      if (key === 'SSLCOMMERZ_STORE_PASSWORD') return 'test_password';
      if (key === 'SSLCOMMERZ_IS_LIVE') return 'false';
      if (key === 'SSLCOMMERZ_PUBLIC_URL') return 'https://undone-unsure-twisting.ngrok-free.dev';
      return null;
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getRepositoryToken(PlatformSetting), useValue: repository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('falls back to defaults when nothing is stored', async () => {
    repository.find.mockResolvedValue([]);

    await expect(service.getSettings()).resolves.toEqual({
      platformName: 'Gramer Bazar',
      supportEmail: 'codeswithrakib@gmail.com',
      supportPhone: '8801767476724',
      allowSellerRegistration: true,
      isMaintenanceMode: false,
      sslczStoreId: 'test_store_id',
      sslczIsLive: false,
      sslczPublicUrl: 'https://undone-unsure-twisting.ngrok-free.dev',
      hasSslczPassword: true,
    });
  });

  it('returns stored values, coercing the registration flag', async () => {
    repository.find.mockResolvedValue([
      { key: 'platformName', value: 'Gramer Bazar BD' },
      { key: 'allowSellerRegistration', value: 'false' },
    ]);

    await expect(service.getSettings()).resolves.toEqual({
      platformName: 'Gramer Bazar BD',
      supportEmail: 'codeswithrakib@gmail.com',
      supportPhone: '8801767476724',
      allowSellerRegistration: false,
      isMaintenanceMode: false,
      sslczStoreId: 'test_store_id',
      sslczIsLive: false,
      sslczPublicUrl: 'https://undone-unsure-twisting.ngrok-free.dev',
      hasSslczPassword: true,
    });
  });

  it('upserts only the supplied keys', async () => {
    repository.upsert.mockResolvedValue(undefined);
    repository.find.mockResolvedValue([]);

    await service.updateSettings({ allowSellerRegistration: false });

    expect(repository.upsert).toHaveBeenCalledWith(
      [{ key: 'allowSellerRegistration', value: 'false' }],
      ['key'],
    );
  });

  it('does not write when the DTO is empty', async () => {
    repository.find.mockResolvedValue([]);

    await service.updateSettings({});

    expect(repository.upsert).not.toHaveBeenCalled();
  });

  it('treats seller registration as allowed by default', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.isSellerRegistrationAllowed()).resolves.toBe(true);
  });

  it('updates SSLCOMMERZ settings and retrieves dynamic config', async () => {
    repository.upsert.mockResolvedValue(undefined);
    repository.find.mockResolvedValue([
      { key: 'sslczPublicUrl', value: 'https://undone-unsure-twisting.ngrok-free.dev' },
      { key: 'sslczStoreId', value: 'my_store_123' },
      { key: 'sslczStorePassword', value: 'my_pass_123' },
      { key: 'sslczIsLive', value: 'true' },
    ]);

    await service.updateSettings({
      sslczPublicUrl: 'https://undone-unsure-twisting.ngrok-free.dev',
      sslczStoreId: 'my_store_123',
      sslczStorePassword: 'my_pass_123',
      sslczIsLive: true,
    });

    const config = await service.getSslcommerzConfig();
    expect(config).toEqual({
      storeId: 'my_store_123',
      storePassword: 'my_pass_123',
      isLive: true,
      publicUrl: 'https://undone-unsure-twisting.ngrok-free.dev',
    });
  });
});
