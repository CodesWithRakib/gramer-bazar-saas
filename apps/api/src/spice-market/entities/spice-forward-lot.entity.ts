import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SpiceType,
  SpiceRegion,
  SpiceFormFactor,
  SpicePackagingType,
  SpicePurityGrade,
  SpiceLotStatus,
} from '../enums/spice-market.enum.js';

@Entity('spice_forward_lots')
export class SpiceForwardLot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  lotCode: string;

  @Column({ nullable: true })
  dryingBatchId?: string;

  @Column({ nullable: true })
  labTestId?: string;

  @Column()
  lotTitle: string;

  @Column()
  producerName: string;

  @Column({
    type: 'enum',
    enum: SpiceRegion,
    default: SpiceRegion.BOGURA_SARIAKANDI_CHAR,
  })
  originRegion: SpiceRegion;

  @Column({
    type: 'enum',
    enum: SpiceType,
    default: SpiceType.CHILLI,
  })
  spiceType: SpiceType;

  @Column({
    type: 'enum',
    enum: SpiceFormFactor,
    default: SpiceFormFactor.WHOLE_DRIED_POD_RHIZOME,
  })
  formFactor: SpiceFormFactor;

  @Column({ type: 'float', default: 500 })
  totalQuantityKg: number;

  @Column({ type: 'float', default: 500 })
  availableQuantityKg: number;

  @Column({
    type: 'enum',
    enum: SpicePackagingType,
    default: SpicePackagingType.HERMETIC_GRAINPRO_BAG_50KG,
  })
  packagingType: SpicePackagingType;

  @Column({ type: 'float', default: 420 })
  pricePerKgBdt: number;

  @Column({ type: 'float', default: 210000 })
  totalValueBdt: number;

  @Column({ type: 'float', default: 50 })
  minimumOrderKg: number;

  @Column({ default: true })
  isBstiCertified: boolean;

  @Column({ default: true })
  isBarisrcVerified: boolean;

  @Column({
    type: 'enum',
    enum: SpicePurityGrade,
    default: SpicePurityGrade.PURE_GRADE_AAA_EXPORT,
  })
  purityGrade: SpicePurityGrade;

  @Column({
    type: 'enum',
    enum: SpiceLotStatus,
    default: SpiceLotStatus.AVAILABLE_FOR_SALE,
  })
  status: SpiceLotStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
