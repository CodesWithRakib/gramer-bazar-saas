import { describe, it, expect, afterEach } from 'vitest';
import { MockBroadcastProvider } from './mock-broadcast.provider.js';
import { BroadcastProviderMessageStatus } from '../../enums/broadcast.enums.js';

const input = {
  recipientId: 'recipient-1',
  to: '+8801700000000',
  body: 'Hello',
  idempotencyKey: 'broadcast:1:recipient:1',
};

describe('MockBroadcastProvider', () => {
  const provider = new MockBroadcastProvider();

  afterEach(() => {
    delete process.env.BROADCAST_MOCK_FAILURE_RATE;
  });

  it('is explicitly marked as simulated', () => {
    expect(provider.simulated).toBe(true);
  });

  it('returns a simulated SENT result with a synthetic provider message id', async () => {
    const result = await provider.sendMessage(input);
    expect(result.simulated).toBe(true);
    expect(result.status).toBe(BroadcastProviderMessageStatus.SENT);
    expect(result.providerMessageId).toMatch(/^mock-/);
  });

  it('can simulate a transient failure via BROADCAST_MOCK_FAILURE_RATE', async () => {
    process.env.BROADCAST_MOCK_FAILURE_RATE = '1';
    const result = await provider.sendMessage(input);
    expect(result.status).toBe(BroadcastProviderMessageStatus.FAILED);
    expect(result.retryable).toBe(true);
    expect(result.simulated).toBe(true);
  });

  it('reports ready', async () => {
    await expect(provider.isReady()).resolves.toBe(true);
  });
});
