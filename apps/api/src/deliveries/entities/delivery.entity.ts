import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { DeliveryStatus } from '../enums/delivery-status.enum.js';
import { Order } from '../../orders/entities/order.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid', unique: true })
  orderId: string;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Column({ name: 'rider_id', type: 'uuid', nullable: true })
  riderId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'rider_id' })
  rider: Relation<User> | null;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.UNASSIGNED })
  status: DeliveryStatus;

  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt: Date | null;

  @Column({ name: 'pickup_time', type: 'timestamp', nullable: true })
  pickupTime: Date | null;

  @Column({ name: 'delivery_time', type: 'timestamp', nullable: true })
  deliveryTime: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'current_lat', type: 'decimal', precision: 10, scale: 8, nullable: true })
  currentLat: number | null;

  @Column({ name: 'current_lng', type: 'decimal', precision: 11, scale: 8, nullable: true })
  currentLng: number | null;

  @Column({ name: 'last_location_updated_at', type: 'timestamp', nullable: true })
  lastLocationUpdatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
