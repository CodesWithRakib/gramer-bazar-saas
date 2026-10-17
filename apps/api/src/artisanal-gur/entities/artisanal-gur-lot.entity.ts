import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  GurType,
  GurRegion,
  GurPackagingType,
  GurPurityGrade,
  GurLotStatus,
} from '../enums/artisanal-gur.enum.js';

@Entity('artisanal_gur_lots')
export class ArtisanalGurLot {
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
  artisanProducerName: string;

  @Column({
    type: 'enum',
    enum: GurRegion,
    default: GurRegion.JASHORE_JHIKARGACHA,
  })
  originRegion: GurRegion;

  @Column({
    type: 'enum',
    enum: GurType,
    default: GurType.DATE_PALM_NOLEN_JHOLA,
  })
  gurType: GurType;

  @Column({
    type: 'enum',
    enum: GurPackagingType,
    default: GurPackagingType.TRADITIONAL_EARTHEN_POT_1KG,
  })
  packagingType: GurPackagingType;

  @Column({ type: 'float', default: 150 })
  totalWeightKg: number;

  @Column({ type: 'float', default: 150 })
  availableWeightKg: number;

  @Column({ type: 'float', default: 480 })
  pricePerKgBdt: number;

  @Column({ type: 'float', default: 72000 })
  totalValueBdt: number;

  @Column({ type: 'float', default: 2 })
  minimumOrderKg: number;

  @Column({ type: 'int', default: 5 })
  aromaRating: number; // 1 to 5 scale (প্রাকৃতিক সুবাস সূচক)

  @Column({
    type: 'enum',
    enum: GurPurityGrade,
    default: GurPurityGrade.GRADE_AAA_GI_CERTIFIED_HERITAGE,
  })
  purityGrade: GurPurityGrade;

  @Column({ default: true })
  isGiTagged: boolean;

  @Column({ default: true })
  isHydrosulfiteFreeCertified: boolean;

  @Column({
    type: 'enum',
    enum: GurLotStatus,
    default: GurLotStatus.AVAILABLE_FOR_SALE,
  })
  status: GurLotStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
