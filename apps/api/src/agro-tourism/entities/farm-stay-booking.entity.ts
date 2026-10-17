import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BookingEscrowStatus, MealPlanOption } from '../enums/agro-tourism.enum.js';
import { FarmStayListing } from './farm-stay-listing.entity.js';

@Entity('farm_stay_bookings')
export class FarmStayBooking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'booking_number', unique: true })
  bookingNumber!: string;

  @Column({ name: 'guest_user_id' })
  guestUserId!: string;

  @Column({ name: 'guest_name' })
  guestName!: string;

  @Column({ name: 'guest_phone' })
  guestPhone!: string;

  @Column({ name: 'guest_nid_passport', nullable: true })
  guestNidPassport!: string | null;

  @Column({ name: 'farm_stay_id' })
  farmStayId!: string;

  @Column({ name: 'check_in_date' })
  checkInDate!: string; // YYYY-MM-DD

  @Column({ name: 'check_out_date' })
  checkOutDate!: string; // YYYY-MM-DD

  @Column({ name: 'nights_count', type: 'int', default: 1 })
  nightsCount!: number;

  @Column({ name: 'adult_guests_count', type: 'int', default: 2 })
  adultGuestsCount!: number;

  @Column({ name: 'child_guests_count', type: 'int', default: 0 })
  childGuestsCount!: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: MealPlanOption.ALL_INCLUSIVE_ORGANIC,
  })
  mealPlan!: MealPlanOption;

  @Column({ name: 'selected_experience_ids', type: 'simple-array', nullable: true })
  selectedExperienceIds!: string[] | null;

  @Column({ name: 'stay_subtotal_bdt', type: 'decimal', precision: 10, scale: 2 })
  staySubtotalBdt!: number;

  @Column({ name: 'meal_subtotal_bdt', type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  mealSubtotalBdt!: number;

  @Column({ name: 'experiences_subtotal_bdt', type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  experiencesSubtotalBdt!: number;

  @Column({ name: 'service_fee_bdt', type: 'decimal', precision: 10, scale: 2, default: 200.0 })
  serviceFeeBdt!: number;

  @Column({ name: 'total_amount_bdt', type: 'decimal', precision: 10, scale: 2 })
  totalAmountBdt!: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: BookingEscrowStatus.ESCROW_CONFIRMED_RESERVED,
  })
  escrowStatus!: BookingEscrowStatus;

  @Column({ name: 'check_in_pin_code', length: 6 })
  checkInPinCode!: string; // 4-6 digit secret verified upon arrival to release escrow payout

  @Column({ name: 'special_requests', type: 'text', nullable: true })
  specialRequests!: string | null;

  @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
  checkedInAt!: Date | null;

  @Column({ name: 'payout_released_at', type: 'timestamp', nullable: true })
  payoutReleasedAt!: Date | null;

  @ManyToOne(() => FarmStayListing, (stay) => stay.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_stay_id' })
  farmStay!: FarmStayListing;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
