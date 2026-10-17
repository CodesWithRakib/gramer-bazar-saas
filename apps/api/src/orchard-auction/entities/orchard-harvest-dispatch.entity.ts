import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  FruitType,
  FruitCultivar,
  PackagingType,
  DispatchGradingQuality,
  ColdChainTransitStatus,
} from '../enums/orchard-auction.enum.js';

@Entity('orchard_harvest_dispatches')
export class OrchardHarvestDispatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  dispatchCode: string;

  @Column({ nullable: true })
  orchardLotId: string;

  @Column({ nullable: true })
  hwtBatchId: string;

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

  @Column({ type: 'float', default: 1200 })
  dispatchWeightKg: number;

  @Column({ type: 'int', default: 240 })
  cratesCount: number;

  @Column({
    type: 'enum',
    enum: PackagingType,
    default: PackagingType.CORRUGATED_5KG_VENTILATED,
  })
  packagingType: PackagingType;

  @Column({ type: 'float', default: 18.5 })
  brixSugarDegree: number;

  @Column({
    type: 'enum',
    enum: DispatchGradingQuality,
    default: DispatchGradingQuality.EXPORT_GRADE_SUPERIOR,
  })
  gradingQuality: DispatchGradingQuality;

  @Column({ default: 'DHAKA-METRO-TA-14-8890' })
  reeferVanPlateNumber: string;

  @Column({ type: 'float', default: 11.0 })
  reeferSetpointCelsius: number;

  @Column({ type: 'float', default: 11.2 })
  currentTransitTempCelsius: number;

  @Column({ type: 'float', default: 88.0 })
  currentTransitHumidityPct: number;

  @Column({
    type: 'enum',
    enum: ColdChainTransitStatus,
    default: ColdChainTransitStatus.OPTIMAL_CHILLED,
  })
  coldChainStatus: ColdChainTransitStatus;

  @Column({ default: 'Shibganj Agro-Hub, Chapainawabganj' })
  originHub: string;

  @Column({ default: 'DAC Hazrat Shahjalal International Airport Air Cargo' })
  destinationMarket: string;

  @Column({ default: 'IN_TRANSIT' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
