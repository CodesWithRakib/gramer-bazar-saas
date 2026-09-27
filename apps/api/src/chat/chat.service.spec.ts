import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatService, getDirectCanonicalKey, isUserAdmin, isUserSuperAdmin, canUserAccessConversation } from './chat.service.js';
import { Conversation } from './entities/conversation.entity.js';
import { Message } from './entities/message.entity.js';
import { UsersService } from '../users/users.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { Role } from '../roles/enums/role.enum.js';
import { ConversationType, ConversationStatus, MessageStatus } from './enums/chat.enum.js';

describe('ChatService', () => {
  let service: ChatService;
  let mockConvRepo: any;
  let mockMsgRepo: any;
  let mockUsersService: any;
  let mockAuditLogs: any;

  beforeEach(async () => {
    mockConvRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'new-conv-uuid', ...dto })),
      save: vi.fn((entity) => Promise.resolve({ id: 'saved-conv-uuid', ...entity })),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      count: vi.fn().mockResolvedValue(5),
      createQueryBuilder: vi.fn(),
    };

    mockMsgRepo = {
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'new-msg-uuid', ...dto, createdAt: new Date() })),
      save: vi.fn((entity) => Promise.resolve({ id: 'saved-msg-uuid', ...entity, createdAt: new Date() })),
      createQueryBuilder: vi.fn(),
    };

    mockUsersService = {
      findById: vi.fn(),
      findAdmin: vi.fn(),
    };

    mockAuditLogs = {
      record: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(Conversation), useValue: mockConvRepo },
        { provide: getRepositoryToken(Message), useValue: mockMsgRepo },
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuditLogsService, useValue: mockAuditLogs },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Order-independent canonical key', () => {
    it('generates the identical canonical key regardless of user order', () => {
      const userA = 'user-aaa-111';
      const userB = 'user-bbb-222';

      const key1 = getDirectCanonicalKey(userA, userB);
      const key2 = getDirectCanonicalKey(userB, userA);

      expect(key1).toBe('direct:user-aaa-111:user-bbb-222');
      expect(key1).toBe(key2);
    });
  });

  describe('isUserAdmin and isUserSuperAdmin', () => {
    it('detects admin and super admin correctly', () => {
      const normalUser: any = { id: 'u1', roles: [{ name: Role.CUSTOMER }] };
      const adminUser: any = { id: 'u2', roles: [{ name: Role.ADMIN }] };
      const superAdminUser: any = { id: 'u3', roles: [{ name: Role.SUPER_ADMIN }] };

      expect(isUserAdmin(normalUser)).toBe(false);
      expect(isUserAdmin(adminUser)).toBe(true);
      expect(isUserAdmin(superAdminUser)).toBe(true);

      expect(isUserSuperAdmin(adminUser)).toBe(false);
      expect(isUserSuperAdmin(superAdminUser)).toBe(true);
    });
  });

  describe('canUserAccessConversation', () => {
    it('allows participants and admins, forbids strangers', () => {
      const conv: any = {
        id: 'c1',
        participants: [{ id: 'user-1' }, { id: 'user-2' }],
      };

      const participant: any = { id: 'user-1', roles: [] };
      const stranger: any = { id: 'user-999', roles: [] };
      const admin: any = { id: 'admin-1', roles: [{ name: Role.ADMIN }] };

      expect(canUserAccessConversation(conv, participant)).toBe(true);
      expect(canUserAccessConversation(conv, stranger)).toBe(false);
      expect(canUserAccessConversation(conv, admin)).toBe(true);
    });
  });

  describe('getOrCreateConversation', () => {
    it('returns existing conversation without duplicating', async () => {
      const existing: any = {
        id: 'existing-conv-id',
        canonicalKey: 'direct:user-1:user-2',
        participants: [{ id: 'user-1' }, { id: 'user-2' }],
      };
      mockUsersService.findById.mockImplementation((id: string) => Promise.resolve({ id }));
      mockConvRepo.findOne.mockResolvedValue(existing);

      const result = await service.getOrCreateConversation(['user-1', 'user-2']);
      expect(result).toBe(existing);
      expect(mockConvRepo.create).not.toHaveBeenCalled();
    });

    it('creates a new conversation with canonical key when none exists', async () => {
      mockUsersService.findById.mockImplementation((id: string) => Promise.resolve({ id }));
      mockConvRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: 'new-conv-uuid',
        canonicalKey: 'direct:user-1:user-2',
      });

      const result = await service.getOrCreateConversation(['user-2', 'user-1']);
      expect(mockConvRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          canonicalKey: 'direct:user-1:user-2',
          type: ConversationType.DIRECT,
          status: ConversationStatus.ACTIVE,
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('Idempotent message sending', () => {
    it('returns existing message if clientMessageId matches an existing message', async () => {
      const existingMsg: any = {
        id: 'msg-1',
        clientMessageId: 'idempotency-key-123',
        content: 'Hello again',
      };
      mockMsgRepo.findOne.mockResolvedValue(existingMsg);

      const result = await service.sendMessage(
        'sender-id',
        'conv-id',
        'Hello again',
        'TEXT',
        'idempotency-key-123',
      );

      expect(result).toBe(existingMsg);
      expect(mockMsgRepo.create).not.toHaveBeenCalled();
    });
  });
});
