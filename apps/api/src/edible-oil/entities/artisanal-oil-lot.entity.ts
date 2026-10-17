import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  OilSeedType,
  OilRegion,
  OilPackagingType,
  OilPurityGrade,
  OilLotStatus,
} from '../enums/edible-oil.enum.js';

@Entity('artisanal_oil_lots')
export class ArtisanalOilLot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  lotCode: string;

  @Column({ nullable: true })
  batchId?: string;

  @Column({ nullable: true })
  labTestId?: string;

  @Column()
  lotTitle: string;

  @Column()
  millProducerName: string;

  @Column({
    type: 'enum',
    enum: OilRegion,
    default: OilRegion.TANGAIL_DELDUAR,
  })
  originRegion: OilRegion;

  @Column({
    type: 'enum',
    enum: OilSeedType,
    default: OilSeedType.MUSTARD_MAGHI_DESHI,
  })
  seedType: OilSeedType;

  @Column({
    type: 'enum',
    enum: OilPackagingType,
    default: OilPackagingType.AMBER_GLASS_BOTTLE_1L,
  })
  packagingType: OilPackagingType;

  @Column({ type: 'float', default: 200 })
  totalVolumeLiters: number;

  @Column({ type: 'float', default: 200 })
  availableVolumeLiters: number;

  @Column({ type: 'float', default: 380 })
  pricePerLiterBdt: number;

  @Column({ type: 'float', default: 76000 })
  totalValueBdt: number;

  @Column({ type: 'float', default: 5 })
  minimumOrderLiters: number;

  @Column({ type: 'int', default: 5 })
  pungencyRating: number; // 1 to 5 scale (ঝাঁঝ সূচক)

  @Column({
    type: 'enum',
    enum: OilPurityGrade,
    default: OilPurityGrade.GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED,
  })
  purityGrade: OilPurityGrade;

  @Column({ default: true })
  isBstiCertified: boolean;

  @Column({ default: true })
  isColdPressedCertified: boolean;

  @Column({
    type: 'enum',
    enum: OilLotStatus,
    default: OilLotStatus.AVAILABLE_FOR_SALE,
  })
  status: OilLotStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
