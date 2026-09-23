import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity.js';
import { Message } from './entities/message.entity.js';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../roles/enums/role.enum.js';

export function isUserAdmin(user: User): boolean {
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  return user.roles.some((r: any) => {
    const name = typeof r === 'string' ? r : r?.name;
    return (
      name === Role.ADMIN ||
      name === Role.SUPER_ADMIN ||
      name === 'ADMIN' ||
      name === 'SUPER_ADMIN'
    );
  });
}

export function canUserAccessConversation(conversation: Conversation, user: User): boolean {
  if (!user || !conversation) return false;
  if (isUserAdmin(user)) return true;
  return conversation.participants?.some(p => p?.id === user.id) ?? false;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private usersService: UsersService,
  ) {}

  async getUserConversations(user: User) {
    const isAdmin = isUserAdmin(user);

    let convQuery = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('participant.roles', 'roles');

    if (!isAdmin) {
      convQuery = convQuery.innerJoin(
        'conversation.participants',
        'userParticipant',
        'userParticipant.id = :userId',
        { userId: user.id },
      );
    }

    const conversations = await convQuery
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    if (conversations.length === 0) {
      return [];
    }

    const conversationIds = conversations.map(c => c.id);

    // Fast indexed unread counts query
    const unreadCountsRaw = await this.messageRepository
      .createQueryBuilder('m')
      .select('m.conversation_id', 'conversationId')
      .addSelect('COUNT(m.id)', 'count')
      .where('m.conversation_id IN (:...conversationIds)', { conversationIds })
      .andWhere('m.sender_id != :userId', { userId: user.id })
      .andWhere('m.isRead = false')
      .groupBy('m.conversation_id')
      .getRawMany();

    const unreadMap = new Map<string, number>();
    for (const row of unreadCountsRaw) {
      const convId = row.conversationId || (row as any).conversationid;
      if (convId) {
        unreadMap.set(convId, parseInt(row.count, 10));
      }
    }

    // Fast indexed query for latest message per conversation
    const messagesDesc = await this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.conversation', 'conversation')
      .where('m.conversation_id IN (:...conversationIds)', { conversationIds })
      .orderBy('m.createdAt', 'DESC')
      .getMany();

    const lastMessageMap = new Map<string, Message>();
    for (const msg of messagesDesc) {
      const convId = msg.conversation?.id || msg.conversationId || (msg as any).conversation_id;
      if (convId && !lastMessageMap.has(convId)) {
        msg.conversationId = convId;
        lastMessageMap.set(convId, msg);
      }
    }

    return conversations.map(conv => {
      const lastMsg = lastMessageMap.get(conv.id) || null;
      return {
        ...conv,
        lastMessage: lastMsg,
        messages: lastMsg ? [lastMsg] : [],
        unreadCount: unreadMap.get(conv.id) || 0,
      };
    });
  }

  async getConversationMessages(
    conversationId: string,
    user: User,
    limit = 50,
    before?: string,
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!canUserAccessConversation(conversation, user)) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const query = this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('m.conversationId = :conversationId', { conversationId });

    if (before) {
      const beforeMsg = await this.messageRepository.findOne({ where: { id: before } });
      if (beforeMsg) {
        query.andWhere('m.createdAt < :beforeDate', { beforeDate: beforeMsg.createdAt });
      }
    }

    // Retrieve most recent messages before cursor, then reverse to maintain ASC display order
    const messagesDesc = await query
      .orderBy('m.createdAt', 'DESC')
      .take(Math.min(limit, 100))
      .getMany();

    return messagesDesc.reverse();
  }

  async sendMessage(
    senderId: string,
    conversationId: string,
    content: string,
    messageType = 'TEXT',
  ) {
    const trimmed = content?.trim();
    if (!trimmed) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const user = await this.usersService.findById(senderId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!canUserAccessConversation(conversation, user)) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    // If an admin replies to a conversation they are not yet explicitly attached to, attach them
    const isAdmin = isUserAdmin(user);
    const isParticipant = conversation.participants?.some(p => p?.id === senderId);
    if (isAdmin && !isParticipant) {
      conversation.participants = conversation.participants || [];
      conversation.participants.push(user);
      await this.conversationRepository.save(conversation);
    }

    let senderRole = 'CUSTOMER';
    if (isAdmin) {
      senderRole = 'ADMIN';
    } else if (user.roles?.some((r: any) => (typeof r === 'string' ? r : r?.name) === Role.SELLER)) {
      senderRole = 'SELLER';
    } else if (user.roles?.some((r: any) => (typeof r === 'string' ? r : r?.name) === Role.RIDER)) {
      senderRole = 'RIDER';
    }

    const message = this.messageRepository.create({
      content: trimmed,
      messageType: messageType || 'TEXT',
      senderRole,
      senderId,
      conversationId,
      isRead: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation updatedAt so it moves to top of list
    await this.conversationRepository.update(conversationId, {
      updatedAt: new Date(),
    });

    savedMessage.sender = user;
    return savedMessage;
  }

  async getOrCreateConversation(
    participantIds: string[],
    referenceId?: string | null,
    referenceType?: string | null,
    currentUser?: User,
  ) {
    const rawIds = Array.from(new Set(participantIds.filter(Boolean)));
    
    // Resolve admin placeholder if requested
    const resolvedIds: string[] = [];
    for (const pid of rawIds) {
      if (pid === 'ADMIN' || pid === 'admin') {
        const adminUser = await this.usersService.findAdmin();
        if (adminUser) {
          resolvedIds.push(adminUser.id);
        }
      } else {
        resolvedIds.push(pid);
      }
    }

    const uniqueParticipants = Array.from(new Set(resolvedIds));
    if (uniqueParticipants.length === 0) {
      throw new BadRequestException('At least one participant required');
    }

    const users = await Promise.all(
      uniqueParticipants.map(id => this.usersService.findById(id).catch(() => null))
    );

    if (users.some(u => !u)) {
      throw new NotFoundException('One or more users not found');
    }

    const validUsers = users as User[];
    const sortedTargetIds = uniqueParticipants.slice().sort();

    // Check existing conversation with duplicate prevention:
    // If referenceId provided (e.g. orderId): find conversation with matching referenceId and participants
    // If no referenceId: find general conversation (referenceId IS NULL) with exact participants
    let query = this.conversationRepository
      .createQueryBuilder('conv')
      .leftJoinAndSelect('conv.participants', 'participant')
      .leftJoinAndSelect('participant.roles', 'roles');

    if (referenceId) {
      query = query.where('conv.referenceId = :referenceId', { referenceId });
      if (referenceType) {
        query = query.andWhere('conv.referenceType = :referenceType', { referenceType });
      }
    } else {
      query = query.where('conv.referenceId IS NULL');
    }

    const candidates = await query.getMany();
    for (const candidate of candidates) {
      const candidateIds = candidate.participants.map(p => p.id).sort();
      if (
        candidateIds.length === sortedTargetIds.length &&
        candidateIds.every((id, idx) => id === sortedTargetIds[idx])
      ) {
        return candidate;
      }
    }

    // Create new conversation
    const newConv = this.conversationRepository.create({
      participants: validUsers,
      referenceId: referenceId || null,
      referenceType: referenceType || null,
    });

    const savedConv = await this.conversationRepository.save(newConv);

    return this.conversationRepository.findOne({
      where: { id: savedConv.id },
      relations: ['participants'],
    });
  }

  async markAsRead(conversationId: string, user: User) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!canUserAccessConversation(conversation, user)) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const result = await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id != :userId', { userId: user.id })
      .andWhere('isRead = false')
      .execute();

    return { success: true, affected: result.affected ?? 0 };
  }

  async getUnreadCounts(user: User) {
    const isAdmin = isUserAdmin(user);

    const query = this.messageRepository
      .createQueryBuilder('m')
      .innerJoin('m.conversation', 'c')
      .where('m.sender_id != :userId', { userId: user.id })
      .andWhere('m.isRead = false');

    if (!isAdmin) {
      query.innerJoin('c.participants', 'p', 'p.id = :userId', { userId: user.id });
    }

    const unreadCount = await query.getCount();

    const unreadConversations = await query
      .select('COUNT(DISTINCT c.id)', 'count')
      .getRawOne();

    return {
      unreadCount,
      unreadConversationsCount: parseInt(unreadConversations?.count || '0', 10),
    };
  }

  async getConversationById(conversationId: string, user: User) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!canUserAccessConversation(conversation, user)) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return conversation;
  }
}


