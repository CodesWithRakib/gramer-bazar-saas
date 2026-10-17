import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  AuctionCenter,
  AuctionLotStatus,
  TeaProcessingType,
  TeaLeafGrade,
} from '../enums/tea-estate.enum.js';

@Entity('tea_auction_lots')
export class TeaAuctionLot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  lotNumber!: string;

  @Column({ type: 'varchar', length: 150 })
  gardenMark!: string;

  @Column({
    type: 'enum',
    enum: AuctionCenter,
    default: AuctionCenter.CHITTAGONG_TEA_AUCTION,
  })
  auctionCenter!: AuctionCenter;

  @Column({ type: 'int', default: 24 })
  saleNumber!: number;

  @Column({
    type: 'enum',
    enum: TeaProcessingType,
    default: TeaProcessingType.CTC_BLACK_TEA,
  })
  processingType!: TeaProcessingType;

  @Column({
    type: 'enum',
    enum: TeaLeafGrade,
    default: TeaLeafGrade.BOP,
  })
  grade!: TeaLeafGrade;

  @Column({ type: 'int', default: 40 })
  packageCountBagsOrChests!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 2000.0 })
  netWeightKg!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 280.0 })
  reservePricePerKgBdt!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 345.0 })
  currentHighBidBdt!: number;

  @Column({ type: 'varchar', length: 150, default: 'National Brokers Ltd' })
  winningBrokerName!: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 8.8 })
  tasterScoreBrightness!: number; // 1 to 10

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 9.1 })
  tasterScoreBriskness!: number; // 1 to 10

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 8.5 })
  tasterScoreLiquorBody!: number; // 1 to 10

  @Column({ type: 'varchar', length: 255, default: 'Rich malty body with bright amber infusion, brisk muscatel finish' })
  tasterFlavorNotes!: string;

  @Column({
    type: 'enum',
    enum: AuctionLotStatus,
    default: AuctionLotStatus.ACTIVE_BIDDING,
  })
  auctionStatus!: AuctionLotStatus;

  @Column({ type: 'boolean', default: true })
  isOrganicCertified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
