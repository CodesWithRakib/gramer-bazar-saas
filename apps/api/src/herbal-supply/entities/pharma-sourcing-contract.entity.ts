import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  HerbalSpecies,
  PlantPartUsed,
  ProcessingState,
  SourcingContractStatus,
} from '../enums/herbal-supply.enum.js';

@Entity('pharma_sourcing_contracts')
export class PharmaSourcingContract {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'contract_number', unique: true })
  contractNumber!: string;

  @Column({ name: 'pharma_company_id' })
  pharmaCompanyId!: string;

  @Column({ name: 'buyer_company_name' })
  buyerCompanyName!: string;

  @Column({ name: 'buyer_contact_person' })
  buyerContactPerson!: string;

  @Column({ name: 'buyer_phone' })
  buyerPhone!: string;

  @Column({ name: 'seller_cooperative_id' })
  sellerCooperativeId!: string;

  @Column({ name: 'cooperative_name' })
  cooperativeName!: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: HerbalSpecies.KALOMEGH,
  })
  species!: HerbalSpecies;

  @Column({
    type: 'varchar',
    length: 50,
    default: PlantPartUsed.LEAF_DRIED,
  })
  plantPart!: PlantPartUsed;

  @Column({
    type: 'varchar',
    length: 50,
    default: ProcessingState.SHADE_DRIED_WHOLE,
  })
  processingState!: ProcessingState;

  @Column({ name: 'target_weight_kg', type: 'decimal', precision: 10, scale: 2 })
  targetWeightKg!: number;

  @Column({ name: 'agreed_price_per_kg_bdt', type: 'decimal', precision: 10, scale: 2 })
  agreedPricePerKgBdt!: number;

  @Column({ name: 'max_allowed_moisture_percentage', type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  maxAllowedMoisturePercentage!: number;

  @Column({ name: 'delivery_deadline' })
  deliveryDeadline!: string; // YYYY-MM-DD

  @Column({ name: 'destination_warehouse_district' })
  destinationWarehouseDistrict!: string; // e.g. Gazipur, Savar, Pabna

  @Column({ name: 'escrow_advance_amount_bdt', type: 'decimal', precision: 10, scale: 2 })
  escrowAdvanceAmountBdt!: number; // 30% upfront escrow

  @Column({ name: 'final_settlement_amount_bdt', type: 'decimal', precision: 10, scale: 2 })
  finalSettlementAmountBdt!: number; // 100% total value

  @Column({
    type: 'varchar',
    length: 50,
    default: SourcingContractStatus.CONTRACT_ACTIVE,
  })
  contractStatus!: SourcingContractStatus;

  @Column({ name: 'special_pharmacopoeia_specifications', type: 'text', nullable: true })
  specialPharmacopoeiaSpecifications!: string | null;

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
