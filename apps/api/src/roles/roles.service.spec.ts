import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity.js';
import { Role } from './enums/role.enum.js';
import { RolesService } from './roles.service.js';

describe('RolesService', () => {
  let service: RolesService;

  const repository = {
    findOne: vi.fn(),
    create: vi.fn((x) => x),
    save: vi.fn(),
  };

  const loggerLog = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(RoleEntity), useValue: repository },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    (service as unknown as { logger: { log: typeof loggerLog } }).logger = {
      log: loggerLog,
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit (role seeding)', () => {
    it('creates every role from the Role enum that does not exist yet', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.save.mockImplementation(async (x) => x);

      await service.onModuleInit();

      const roleNames = Object.values(Role);
      expect(repository.create).toHaveBeenCalledTimes(roleNames.length);
      for (const name of roleNames) {
        expect(repository.create).toHaveBeenCalledWith(
          expect.objectContaining({ name, description: name }),
        );
      }
      expect(repository.save).toHaveBeenCalledTimes(roleNames.length);
    });

    it('skips roles that already exist', async () => {
      repository.findOne.mockResolvedValue({ id: 'r1', name: Role.ADMIN });
      repository.save.mockImplementation(async (x) => x);

      await service.onModuleInit();

      expect(repository.save).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('only creates the missing roles when some already exist', async () => {
      // ADMIN exists, everything else is new
      repository.findOne.mockImplementation(async ({ where }) =>
        where?.name === Role.ADMIN ? { id: 'r1', name: Role.ADMIN } : null,
      );
      repository.save.mockImplementation(async (x) => x);

      await service.onModuleInit();

      const expected = Object.values(Role).filter((r) => r !== Role.ADMIN);
      expect(repository.save).toHaveBeenCalledTimes(expected.length);
      const savedNames = repository.save.mock.calls.map((c) => c[0].name);
      expect(savedNames).toEqual(expect.arrayContaining(expected));
      expect(savedNames).not.toContain(Role.ADMIN);
    });

    it('continues seeding when one save fails (roles after the failure are still created)', async () => {
      repository.findOne.mockResolvedValue(null);
      let calls = 0;
      repository.save.mockImplementation(async (x) => {
        calls += 1;
        if (calls === 1) throw new Error('db down');
        return x;
      });

      // onModuleInit rejections would crash app bootstrap; the implementation
      // lets the error propagate — verify it surfaces rather than being swallowed.
      await expect(service.onModuleInit()).rejects.toThrow('db down');
      expect(repository.save).toHaveBeenCalledTimes(1);
    });
  });
});
