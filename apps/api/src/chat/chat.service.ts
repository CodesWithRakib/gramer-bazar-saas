import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity.js';
import { Message } from './entities/message.entity.js';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../roles/enums/role.enum.js';
import {
  ConversationType,
  ConversationStatus,
  SupportPriority,
  MessageStatus,
  MessageType,
} from './enums/chat.enum.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { CreateConversationDto, UpdateSupportCaseDto } from './dto/create-conversation.dto.js';

export function isUserAdmin(user: User): boolean {
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  return user.roles.some((r: any) => {
    const name = typeof r === 'string' ? r : r?.name;
    return (
      name === Role.ADMIN || name === Role.SUPER_ADMIN || name === 'ADMIN' || name === 'SUPER_ADMIN'
    );
  });
}

export function isUserSuperAdmin(user: User): boolean {
  if (!user?.roles || !Array.isArray(user.roles)) return false;
  return user.roles.some((r: any) => {
    const name = typeof r === 'string' ? r : r?.name;
    return name === Role.SUPER_ADMIN || name === 'SUPER_ADMIN';
  });
}

export function canUserAccessConversation(conversation: Conversation, user: User): boolean {
  if (!user || !conversation) return false;
  if (isUserAdmin(user)) return true;
  if (conversation.assignedAdminId === user.id) return true;
  return conversation.participants?.some((p) => p?.id === user.id) ?? false;
}

export function getDirectCanonicalKey(userAId: string, userBId: string): string {
  const sorted = [userAId, userBId].sort();
  return `direct:${sorted[0]}:${sorted[1]}`;
}

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Conversation)
    public readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    public readonly messageRepository: Repository<Message>,
    private readonly usersService: UsersService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async onModuleInit() {
    await this.ensureChatSchema();
  }

  public async ensureChatSchema() {
    try {
      if (typeof this.conversationRepository?.query === 'function') {
        await this.conversationRepository.query(`
          ALTER TABLE "conversations" 
          ADD COLUMN IF NOT EXISTS "type" character varying(32) NOT NULL DEFAULT 'DIRECT',
          ADD COLUMN IF NOT EXISTS "canonical_key" character varying(255),
          ADD COLUMN IF NOT EXISTS "status" character varying(32) NOT NULL DEFAULT 'ACTIVE',
          ADD COLUMN IF NOT EXISTS "priority" character varying(32) NOT NULL DEFAULT 'MEDIUM',
          ADD COLUMN IF NOT EXISTS "support_case_number" character varying(64),
          ADD COLUMN IF NOT EXISTS "assigned_admin_id" uuid,
          ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMP,
          ADD COLUMN IF NOT EXISTS "last_message_id" uuid,
          ADD COLUMN IF NOT EXISTS "last_message_at" TIMESTAMP,
          ADD COLUMN IF NOT EXISTS "last_message_preview" text;
        `);

        await this.conversationRepository.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'FK_conversations_assigned_admin'
            ) THEN
              ALTER TABLE "conversations"
              ADD CONSTRAINT "FK_conversations_assigned_admin"
              FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL;
            END IF;
          END $$;
        `);

        await this.conversationRepository.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS "idx_conversations_canonical_key" 
          ON "conversations" ("canonical_key") 
          WHERE "canonical_key" IS NOT NULL;
        `);
      }

      if (typeof this.messageRepository?.query === 'function') {
        await this.messageRepository.query(`
          ALTER TABLE "messages"
          ADD COLUMN IF NOT EXISTS "status" character varying(32) NOT NULL DEFAULT 'SENT',
          ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP,
          ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMP,
          ADD COLUMN IF NOT EXISTS "client_message_id" character varying(128),
          ADD COLUMN IF NOT EXISTS "metadata" jsonb;
        `);
      }

      this.logger.log('Chat schema columns and constraints verified successfully');
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.warn(`Chat schema auto-upgrade skipped or failed: ${error.message}`);
    }
  }

  async getUserConversations(user: User, type?: ConversationType) {
    const isAdmin = isUserAdmin(user);

    let convQuery = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('participant.roles', 'roles')
      .leftJoinAndSelect('conversation.assignedAdmin', 'assignedAdmin');

    if (!isAdmin) {
      convQuery = convQuery.innerJoin(
        'conversation.participants',
        'userParticipant',
        'userParticipant.id = :userId',
        { userId: user.id },
      );
    }

    if (type) {
      convQuery = convQuery.andWhere('conversation.type = :type', { type });
    }

    let conversations: Conversation[];
    try {
      conversations = await convQuery.orderBy('conversation.updatedAt', 'DESC').getMany();
    } catch (err: any) {
      if (err?.message?.includes('assigned_admin_id') || err?.message?.includes('column')) {
        this.logger.warn(
          `getUserConversations failed with column error, attempting schema auto-repair: ${err.message}`,
        );
        await this.ensureChatSchema();
        conversations = await convQuery.orderBy('conversation.updatedAt', 'DESC').getMany();
      } else {
        throw err;
      }
    }

    if (conversations.length === 0) {
      return [];
    }

    const conversationIds = conversations.map((c) => c.id);

    // Indexed unread counts query
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

    // Latest message per conversation query
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

    return conversations.map((conv) => {
      const lastMsg = lastMessageMap.get(conv.id) || null;
      return {
        ...conv,
        lastMessage: lastMsg,
        messages: lastMsg ? [lastMsg] : [],
        unreadCount: unreadMap.get(conv.id) || 0,
      };
    });
  }

  async getConversationMessages(conversationId: string, user: User, limit = 50, before?: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants', 'assignedAdmin'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!canUserAccessConversation(conversation, user)) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    // Audit log if an admin views a conversation that they are not a participant in
    const isParticipant = conversation.participants?.some((p) => p?.id === user.id);
    if (isUserAdmin(user) && !isParticipant) {
      void this.auditLogsService.record({
        actorId: user.id,
        actorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phone,
        action: 'ADMIN_VIEWED_CONVERSATION',
        targetType: 'Conversation',
        targetId: conversation.id,
        details: `Admin viewed conversation between participants: ${conversation.participants?.map((p) => p.id).join(', ')}`,
      });
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
    messageType: string = MessageType.TEXT,
    clientMessageId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const trimmed = content?.trim();
    if (!trimmed) {
      throw new BadRequestException('Message content cannot be empty');
    }

    // Idempotency check: if clientMessageId is supplied and already recorded for this conversation, return existing
    if (clientMessageId) {
      const existing = await this.messageRepository.findOne({
        where: { conversationId, clientMessageId },
        relations: ['sender'],
      });
      if (existing) {
        return existing;
      }
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

    const isAdmin = isUserAdmin(user);
    const isSuperAdmin = isUserSuperAdmin(user);
    const isParticipant = conversation.participants?.some((p) => p?.id === senderId);

    // If an admin replies to a conversation they are not yet explicitly attached to, attach them
    if (isAdmin && !isParticipant) {
      conversation.participants = conversation.participants || [];
      conversation.participants.push(user);
      await this.conversationRepository.save(conversation);
    }

    // Reliable server-derived senderRole
    let senderRole = 'CUSTOMER';
    if (isSuperAdmin) {
      senderRole = 'SUPER_ADMIN';
    } else if (isAdmin) {
      senderRole = 'ADMIN';
    } else if (
      user.roles?.some((r: any) => (typeof r === 'string' ? r : r?.name) === Role.SELLER)
    ) {
      senderRole = 'SELLER';
    } else if (user.roles?.some((r: any) => (typeof r === 'string' ? r : r?.name) === Role.RIDER)) {
      senderRole = 'RIDER';
    }

    const message = this.messageRepository.create({
      content: trimmed,
      messageType: messageType || MessageType.TEXT,
      senderRole,
      senderId,
      conversationId,
      status: MessageStatus.SENT,
      isRead: false,
      clientMessageId: clientMessageId || null,
      metadata: metadata || null,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation updatedAt and last message cache for blazing fast conversation listings
    await this.conversationRepository.update(conversationId, {
      updatedAt: new Date(),
      lastMessageId: savedMessage.id,
      lastMessageAt: savedMessage.createdAt,
      lastMessagePreview: trimmed.slice(0, 120),
    });

    savedMessage.sender = user;

    // Log admin intervention in audit logs
    if (isAdmin) {
      void this.auditLogsService.record({
        actorId: user.id,
        actorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phone,
        action: 'ADMIN_SENT_MESSAGE',
        targetType: 'Conversation',
        targetId: conversationId,
        details: `Admin (${senderRole}) sent message in conversation`,
      });
    }

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
    if (uniqueParticipants.length < 2) {
      throw new BadRequestException('At least two participants required for a direct conversation');
    }

    const users = await Promise.all(
      uniqueParticipants.map((id) => this.usersService.findById(id).catch(() => null)),
    );

    if (users.some((u) => !u)) {
      throw new NotFoundException('One or more users not found');
    }

    const validUsers = users as User[];

    // Order-independent canonical identity key: direct:min(A, B):max(A, B)
    const canonicalKey = getDirectCanonicalKey(uniqueParticipants[0], uniqueParticipants[1]);

    // 1. Check existing conversation by database canonical_key
    const existingConv = await this.conversationRepository.findOne({
      where: { canonicalKey },
      relations: ['participants', 'participants.roles'],
    });

    if (existingConv) {
      // If referenceId is provided (e.g. user opens chat from a specific order/product),
      // update the reference pointer so UI reflects the current context without creating duplicate conversations
      if (
        referenceId &&
        (existingConv.referenceId !== referenceId || existingConv.referenceType !== referenceType)
      ) {
        existingConv.referenceId = referenceId;
        existingConv.referenceType = referenceType || null;
        await this.conversationRepository.save(existingConv);
      }
      return existingConv;
    }

    // 2. Atomic creation with race-condition safety
    try {
      const newConv = this.conversationRepository.create({
        type: ConversationType.DIRECT,
        canonicalKey,
        status: ConversationStatus.ACTIVE,
        participants: validUsers,
        referenceId: referenceId || null,
        referenceType: referenceType || null,
      });

      const saved = await this.conversationRepository.save(newConv);
      return this.conversationRepository.findOne({
        where: { id: saved.id },
        relations: ['participants', 'participants.roles'],
      });
    } catch (err: any) {
      // Unique constraint collision (code 23505 in PostgreSQL) from concurrent requests:
      // Return the conversation created by the winning concurrent transaction
      if (err?.code === '23505' || err?.message?.includes('canonical_key')) {
        const found = await this.conversationRepository.findOne({
          where: { canonicalKey },
          relations: ['participants', 'participants.roles'],
        });
        if (found) return found;
      }
      throw err;
    }
  }

  async getOrCreateSupportConversation(requestingUser: User, dto: CreateConversationDto) {
    // 1. Look for existing ongoing support conversation for this user that is still OPEN or IN_PROGRESS
    const existing = await this.conversationRepository
      .createQueryBuilder('conv')
      .innerJoin('conv.participants', 'p', 'p.id = :userId', { userId: requestingUser.id })
      .leftJoinAndSelect('conv.participants', 'allParticipants')
      .leftJoinAndSelect('conv.assignedAdmin', 'assignedAdmin')
      .where('conv.type = :type', { type: ConversationType.SUPPORT })
      .andWhere('conv.status IN (:...activeStatuses)', {
        activeStatuses: [
          ConversationStatus.OPEN,
          ConversationStatus.IN_PROGRESS,
          ConversationStatus.ACTIVE,
        ],
      })
      .orderBy('conv.updatedAt', 'DESC')
      .getOne();

    if (existing) {
      return existing;
    }

    // 2. Create new Support conversation with case tracking
    const count = await this.conversationRepository.count({
      where: { type: ConversationType.SUPPORT },
    });
    const supportCaseNumber = `SUP-${1000 + count + 1}`;
    const canonicalKey = `support:${requestingUser.id}:${Date.now()}`;

    const newSupportConv = this.conversationRepository.create({
      type: ConversationType.SUPPORT,
      canonicalKey,
      status: ConversationStatus.OPEN,
      priority: dto.priority || SupportPriority.MEDIUM,
      supportCaseNumber,
      referenceId: dto.referenceId || null,
      referenceType: dto.referenceType || 'SUPPORT',
      participants: [requestingUser],
    });

    const saved = await this.conversationRepository.save(newSupportConv);

    // If an initial message was supplied, store it
    if (dto.initialMessage?.trim()) {
      await this.sendMessage(
        requestingUser.id,
        saved.id,
        dto.initialMessage.trim(),
        MessageType.TEXT,
      );
    }

    void this.auditLogsService.record({
      actorId: requestingUser.id,
      actorName:
        `${requestingUser.firstName || ''} ${requestingUser.lastName || ''}`.trim() ||
        requestingUser.phone,
      action: 'SUPPORT_CASE_CREATED',
      targetType: 'Conversation',
      targetId: saved.id,
      details: `Support case ${supportCaseNumber} opened by user ${requestingUser.id}`,
    });

    return this.conversationRepository.findOne({
      where: { id: saved.id },
      relations: ['participants', 'assignedAdmin'],
    });
  }

  async markAsDelivered(messageIds: string[]) {
    if (!messageIds || messageIds.length === 0) return { affected: 0 };
    const now = new Date();
    const result = await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({
        status: MessageStatus.DELIVERED,
        deliveredAt: now,
      })
      .where('id IN (:...messageIds)', { messageIds })
      .andWhere('status = :status', { status: MessageStatus.SENT })
      .execute();

    return { affected: result.affected ?? 0 };
  }

  async markAsRead(conversationId: string, user: User, lastReadMessageId?: string) {
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

    let query = this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({
        isRead: true,
        status: MessageStatus.READ,
        readAt: new Date(),
      })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id != :userId', { userId: user.id })
      .andWhere('isRead = false');

    if (lastReadMessageId) {
      const targetMsg = await this.messageRepository.findOne({ where: { id: lastReadMessageId } });
      if (targetMsg) {
        query = query.andWhere('createdAt <= :readDate', { readDate: targetMsg.createdAt });
      }
    }

    const result = await query.execute();
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

    const unreadConversations = await query.select('COUNT(DISTINCT c.id)', 'count').getRawOne();

    return {
      unreadCount,
      unreadConversationsCount: parseInt(unreadConversations?.count || '0', 10),
    };
  }

  async getConversationById(conversationId: string, user: User) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants', 'participants.roles', 'assignedAdmin'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!canUserAccessConversation(conversation, user)) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return conversation;
  }

  async listSupportCases(
    adminUser: User,
    status?: ConversationStatus,
    priority?: SupportPriority,
    page = 1,
    limit = 20,
  ) {
    if (!isUserAdmin(adminUser)) {
      throw new ForbiddenException('Admin access required');
    }

    const query = this.conversationRepository
      .createQueryBuilder('conv')
      .leftJoinAndSelect('conv.participants', 'participant')
      .leftJoinAndSelect('conv.assignedAdmin', 'assignedAdmin')
      .where('conv.type = :type', { type: ConversationType.SUPPORT });

    if (status) {
      query.andWhere('conv.status = :status', { status });
    }

    if (priority) {
      query.andWhere('conv.priority = :priority', { priority });
    }

    query.orderBy('conv.updatedAt', 'DESC');

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateSupportCase(caseId: string, adminUser: User, dto: UpdateSupportCaseDto) {
    if (!isUserAdmin(adminUser)) {
      throw new ForbiddenException('Admin access required');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { id: caseId, type: ConversationType.SUPPORT },
      relations: ['participants', 'assignedAdmin'],
    });

    if (!conversation) {
      throw new NotFoundException('Support conversation not found');
    }

    if (dto.status) {
      conversation.status = dto.status as ConversationStatus;
      if (dto.status === ConversationStatus.RESOLVED || dto.status === ConversationStatus.CLOSED) {
        conversation.closedAt = new Date();
      }
    }

    if (dto.priority) {
      conversation.priority = dto.priority;
    }

    if (dto.assignedAdminId) {
      const assigned = await this.usersService.findById(dto.assignedAdminId);
      if (assigned) {
        conversation.assignedAdminId = assigned.id;
        conversation.assignedAdmin = assigned;
      }
    }

    conversation.updatedAt = new Date();
    const updated = await this.conversationRepository.save(conversation);

    void this.auditLogsService.record({
      actorId: adminUser.id,
      actorName:
        `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.phone,
      action: 'SUPPORT_CASE_UPDATED',
      targetType: 'Conversation',
      targetId: conversation.id,
      details: `Support case updated by admin. Status: ${conversation.status}, Priority: ${conversation.priority}`,
    });

    return updated;
  }
}
