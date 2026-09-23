import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlatformSetting } from './entities/platform-setting.entity.js';
import { SettingsService } from './settings.service.js';

describe('SettingsService', () => {
  let service: SettingsService;
  const repository = {
    find: vi.fn(),
    findOne: vi.fn(),
    upsert: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getRepositoryToken(PlatformSetting), useValue: repository },
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
      supportEmail: 'support@gramerbazar.com',
      allowSellerRegistration: true,
    });
  });

  it('returns stored values, coercing the registration flag', async () => {
    repository.find.mockResolvedValue([
      { key: 'platformName', value: 'Gramer Bazar BD' },
      { key: 'allowSellerRegistration', value: 'false' },
    ]);

    await expect(service.getSettings()).resolves.toEqual({
      platformName: 'Gramer Bazar BD',
      supportEmail: 'support@gramerbazar.com',
      allowSellerRegistration: false,
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
});
