import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  FruitType,
  OrchardRegion,
  FruitCultivar,
  FruitBaggingStatus,
  OrchardAuctionStatus,
} from '../enums/orchard-auction.enum.js';

export interface OrchardAuctionBidRecord {
  id: string;
  bidderName: string;
  bidderPhone: string;
  bidAmountBdt: number;
  placedAt: string;
}

@Entity('orchard_tree_auction_lots')
export class OrchardTreeAuctionLot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  lotNumber: string;

  @Column()
  orchardName: string;

  @Column()
  growerName: string;

  @Column()
  growerPhone: string;

  @Column({
    type: 'enum',
    enum: OrchardRegion,
    default: OrchardRegion.CHAPAINAWABGANJ_SHIBGANJ,
  })
  region: OrchardRegion;

  @Column({ nullable: true })
  mouzaPlotNumber: string;

  @Column({
    type: 'enum',
    enum: FruitType,
    default: FruitType.MANGO,
  })
  fruitType: FruitType;

  @Column({
    type: 'enum',
    enum: FruitCultivar,
    default: FruitCultivar.KHIRSAPAT_HIMSAGAR,
  })
  cultivar: FruitCultivar;

  @Column({ default: false })
  isGiCertified: boolean;

  @Column({ nullable: true })
  giRegistrationNumber: string;

  @Column({ type: 'int', default: 50 })
  totalTrees: number;

  @Column({ type: 'float', default: 5000 })
  estimatedYieldKg: number;

  @Column({ type: 'int', default: 15 })
  treeAgeYears: number;

  @Column({ type: 'float', default: 80.0 })
  floweringFruitSetPct: number;

  @Column({
    type: 'enum',
    enum: FruitBaggingStatus,
    default: FruitBaggingStatus.BAG_PROTECTED,
  })
  fruitBaggingStatus: FruitBaggingStatus;

  @Column({ type: 'int', default: 0 })
  baggedFruitsCount: number;

  @Column({ type: 'float', default: 350000 })
  baseReservePriceBdt: number;

  @Column({ type: 'float', default: 350000 })
  currentHighestBidBdt: number;

  @Column({ nullable: true })
  highestBidderBrokerName: string;

  @Column({ nullable: true })
  highestBidderBrokerPhone: string;

  @Column({ type: 'float', default: 30.0 })
  advanceEscrowPct: number;

  @Column({ type: 'float', default: 0 })
  advanceEscrowPaidBdt: number;

  @Column({
    type: 'enum',
    enum: OrchardAuctionStatus,
    default: OrchardAuctionStatus.AUCTION_OPEN,
  })
  status: OrchardAuctionStatus;

  @Column({ type: 'timestamp', nullable: true })
  auctionClosingDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expectedHarvestStartDate: Date;

  @Column({ type: 'jsonb', default: [] })
  bids: OrchardAuctionBidRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
