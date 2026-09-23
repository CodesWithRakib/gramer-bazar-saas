import { describe, it, expect } from 'vitest';
import { instanceToPlain } from 'class-transformer';
import { Conversation } from './entities/conversation.entity.js';

describe('class-transformer behavior on Conversation', () => {
  it('checks if lastMessage survives instanceToPlain', () => {
    const conv = new Conversation();
    conv.id = '123';
    (conv as any).lastMessage = { content: 'hello' };
    (conv as any).unreadCount = 5;

    const plain = instanceToPlain(conv);
    console.log('instanceToPlain plain:', plain);
    expect(plain).toHaveProperty('lastMessage');
  });
});

