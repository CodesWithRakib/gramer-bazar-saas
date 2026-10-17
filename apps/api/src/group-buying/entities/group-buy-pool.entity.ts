import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { GroupBuyCampaign } from './group-buy-campaign.entity.js';
import { GroupBuyMember } from './group-buy-member.entity.js';
import { GroupBuyPoolStatus } from '../enums/group-buying.enum.js';

@Entity('group_buy_pools')
export class GroupBuyPool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId: string;

  @ManyToOne(() => GroupBuyCampaign, (campaign) => campaign.pools, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: GroupBuyCampaign;

  @Column({ name: 'share_code', unique: true, length: 50 })
  shareCode: string;

  @Column({ name: 'leader_user_id', type: 'uuid' })
  leaderUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leader_user_id' })
  leader: User;

  @Column({ name: 'current_participants', type: 'int', default: 1 })
  currentParticipants: number;

  @Column({ name: 'current_committed_qty', type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentCommittedQty: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: GroupBuyPoolStatus.FORMING,
  })
  status: GroupBuyPoolStatus;

  @Column({ name: 'expires_at', type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ name: 'locked_at', type: 'timestamp with time zone', nullable: true })
  lockedAt?: Date | null;

  @OneToMany(() => GroupBuyMember, (member) => member.pool)
  members: GroupBuyMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
