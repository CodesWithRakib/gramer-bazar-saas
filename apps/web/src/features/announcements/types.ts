import { Role } from '../users/usersApi';

export enum AnnouncementPriority {
  NORMAL = 'NORMAL',
  IMPORTANT = 'IMPORTANT',
  URGENT = 'URGENT',
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  PARTIALLY_SENT = 'PARTIALLY_SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum AudienceType {
  EVERYONE = 'EVERYONE',
  ROLE = 'ROLE',
  MULTIPLE_ROLES = 'MULTIPLE_ROLES',
  SELECTED_USERS = 'SELECTED_USERS',
}

export interface Announcement {
  id: string;
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  audienceType: AudienceType;
  targetRoles?: Role[];
  targetUsers?: string[];
  scheduledAt?: string;
  expiresAt?: string;
  sentAt?: string;
  totalRecipients: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementTemplate {
  id: string;
  name: string;
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  priority: AnnouncementPriority;
  audienceType: AudienceType;
  targetRoles?: Role[];
  createdAt: string;
  updatedAt: string;
}

export type CreateAnnouncementRequest = Omit<Announcement, 'id' | 'status' | 'sentAt' | 'totalRecipients' | 'totalDelivered' | 'totalRead' | 'totalFailed' | 'createdAt' | 'updatedAt'> & {
  status?: AnnouncementStatus;
};

export type UpdateAnnouncementRequest = Partial<CreateAnnouncementRequest>;

export type CreateAnnouncementTemplateRequest = Omit<AnnouncementTemplate, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAnnouncementTemplateRequest = Partial<CreateAnnouncementTemplateRequest>;
