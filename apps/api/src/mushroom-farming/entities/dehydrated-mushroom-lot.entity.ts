import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  MushroomVariety,
  MushroomProductForm,
} from '../enums/mushroom-farming.enum.js';

@Entity('dehydrated_mushroom_lots')
export class DehydratedMushroomLot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  lotCode!: string;

  @Column({ type: 'varchar', length: 150 })
  processorName!: string;

  @Column({ type: 'varchar', length: 60 })
  district!: string;

  @Column({
    type: 'enum',
    enum: MushroomVariety,
    default: MushroomVariety.OYSTER_WHITE_PO2,
  })
  variety!: MushroomVariety;

  @Column({
    type: 'enum',
    enum: MushroomProductForm,
    default: MushroomProductForm.DEHYDRATED_DRIED_SLICES,
  })
  productForm!: MushroomProductForm;

  @Column({ type: 'date' })
  processingDate!: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 100.0 })
  freshWeightKg!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 10.0 })
  dryWeightKg!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 8.5 })
  moisturePercentage!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  polysaccharideBetaGlucanPercent!: number | null;

  @Column({ type: 'boolean', default: true })
  isHermeticNitrogenSealed!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1600.0 })
  pricePerKgBdt!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 10.0 })
  availableStockKg!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
