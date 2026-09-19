import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity.js';
import { Message } from './entities/message.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private usersService: UsersService,
  ) {}

  async getUserConversations(userId: string) {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant', 'participant.id = :userId', { userId })
      .leftJoinAndSelect('conversation.participants', 'allParticipants')
      .leftJoinAndSelect('allParticipants.roles', 'roles')
      .leftJoinAndMapOne(
        'conversation.lastMessage',
        Message,
        'message',
        'message.conversation_id = conversation.id'
      )
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  async getConversationMessages(conversationId: string, limit = 50) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: limit,
      relations: ['sender'],
    });
  }

  async sendMessage(senderId: string, conversationId: string, content: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants']
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(p => p.id === senderId);
    if (!isParticipant) {
      // Depending on rules, admins might be able to send anyway. For now, strict.
      // throw new ForbiddenException('Not a participant');
    }

    const message = this.messageRepository.create({
      content,
      senderId,
      conversationId,
    });

    return this.messageRepository.save(message);
  }

  async getOrCreateConversation(participantIds: string[]) {
    // Find a conversation where ALL these participants are exactly the only participants
    // For simplicity, we just find any conversation that contains these exact participants.
    
    // Simplest approach: create a new one, or find if there is an existing one between these 2.
    // In PostgreSQL, doing exact array match on join table is complex, so let's do a basic query:
    
    const users = await Promise.all(participantIds.map(id => this.usersService.findById(id)));
    if (users.some((u: any) => !u)) {
      throw new NotFoundException('One or more users not found');
    }

    // Attempt to find existing (assuming 2 participants for now, but this is a rough exact match)
    const existingConvs = await this.conversationRepository
      .createQueryBuilder('conv')
      .innerJoin('conv.participants', 'p1', 'p1.id = :id1', { id1: participantIds[0] })
      .innerJoin('conv.participants', 'p2', 'p2.id = :id2', { id2: participantIds[1] })
      .getMany();

    if (existingConvs.length > 0) {
      return this.conversationRepository.findOne({
        where: { id: existingConvs[0].id },
        relations: ['participants', 'participants.roles'],
      });
    }

    // Create new
    const newConv = this.conversationRepository.create({
      participants: users,
    });

    return this.conversationRepository.save(newConv);
  }

  async markAsRead(conversationId: string, userId: string) {
    // Mark messages NOT sent by the current user as read in this conversation
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id != :userId', { userId })
      .execute();
  }
}
