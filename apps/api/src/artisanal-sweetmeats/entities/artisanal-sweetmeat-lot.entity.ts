import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SweetmeatType,
  SweetmeatRegion,
  SweetmeatPackagingType,
  SweetmeatPurityGrade,
  SweetmeatLotStatus,
} from '../enums/artisanal-sweetmeats.enum.js';

@Entity('artisanal_sweetmeat_lots')
export class ArtisanalSweetmeatLot {
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
  moiraProducerName: string;

  @Column({
    type: 'enum',
    enum: SweetmeatRegion,
    default: SweetmeatRegion.BOGURA_SADAR,
  })
  originRegion: SweetmeatRegion;

  @Column({
    type: 'enum',
    enum: SweetmeatType,
    default: SweetmeatType.BOGURA_SPECIAL_CURD_DOI,
  })
  sweetmeatType: SweetmeatType;

  @Column({
    type: 'enum',
    enum: SweetmeatPackagingType,
    default: SweetmeatPackagingType.POROUS_CLAY_SRA_1KG,
  })
  packagingType: SweetmeatPackagingType;

  @Column({ type: 'float', default: 100 })
  totalWeightKg: number;

  @Column({ type: 'float', default: 100 })
  availableWeightKg: number;

  @Column({ type: 'float', default: 420 })
  pricePerKgBdt: number;

  @Column({ type: 'float', default: 42000 })
  totalValueBdt: number;

  @Column({ type: 'float', default: 2 })
  minimumOrderKg: number;

  @Column({ type: 'int', default: 5 })
  textureSoftnessRating: number; // 1-5 scale

  @Column({
    type: 'enum',
    enum: SweetmeatPurityGrade,
    default: SweetmeatPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
  })
  purityGrade: SweetmeatPurityGrade;

  @Column({ default: true })
  isGiTagged: boolean;

  @Column({ default: true })
  isRefrigeratedColdChain: boolean;

  @Column({
    type: 'enum',
    enum: SweetmeatLotStatus,
    default: SweetmeatLotStatus.AVAILABLE_FOR_SALE,
  })
  status: SweetmeatLotStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
