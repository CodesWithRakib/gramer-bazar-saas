import { describe, it, expect, vi } from 'vitest';
import { getDirectCanonicalKey } from './chat.service.js';

describe('Concurrent conversation creation and canonical identity', () => {
  it('guarantees identical canonical identity for reverse orderings', () => {
    const customerId = 'c7e0c9f1-48e2-45e0-9e2a-111111111111';
    const sellerId = 'a1b2c3d4-e5f6-7a8b-9c0d-222222222222';

    const keyAB = getDirectCanonicalKey(customerId, sellerId);
    const keyBA = getDirectCanonicalKey(sellerId, customerId);

    expect(keyAB).toEqual(keyBA);
    expect(keyAB).toBe(
      `direct:${[customerId, sellerId].sort()[0]}:${[customerId, sellerId].sort()[1]}`,
    );
  });

  it('safely handles concurrent creation race condition and resolves to the same single conversation', async () => {
    const customerId = 'c7e0c9f1-48e2-45e0-9e2a-111111111111';
    const sellerId = 'a1b2c3d4-e5f6-7a8b-9c0d-222222222222';
    const canonicalKey = getDirectCanonicalKey(customerId, sellerId);

    const createdConversation = {
      id: 'canonical-conv-1001',
      canonicalKey,
      participants: [{ id: customerId }, { id: sellerId }],
      type: 'DIRECT',
    };

    let callCount = 0;
    const mockRepo: any = {
      findOne: vi.fn(async () => {
        if (callCount < 2) {
          callCount++;
          return null;
        }
        return createdConversation;
      }),
      create: vi.fn((data) => ({ ...data, id: 'canonical-conv-1001' })),
      save: vi.fn(async (conv) => {
        if (mockRepo.save.mock.calls.length > 1) {
          const duplicateError: any = new Error(
            'duplicate key value violates unique constraint "idx_conversations_canonical_key"',
          );
          duplicateError.code = '23505';
          throw duplicateError;
        }
        return conv;
      }),
    };

    const mockUsersService: any = {
      findById: vi.fn(async (id: string) => ({ id })),
    };

    const mockAudit: any = { record: vi.fn() };

    const { ChatService } = await import('./chat.service.js');
    const service = new ChatService(mockRepo, {} as any, mockUsersService, mockAudit);

    const [res1, res2] = await Promise.all([
      service.getOrCreateConversation([customerId, sellerId]),
      service.getOrCreateConversation([sellerId, customerId]),
    ]);

    expect(res1).toBeDefined();
    expect(res2).toBeDefined();
    expect(res1?.id).toBe(res2?.id);
    expect(res1?.id).toBe('canonical-conv-1001');
    expect(res1?.canonicalKey).toBe(res2?.canonicalKey);
  });
});
