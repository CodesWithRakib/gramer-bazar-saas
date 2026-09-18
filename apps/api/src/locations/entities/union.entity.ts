import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Upazila } from './upazila.entity.js';
import { Area } from './area.entity.js';

@Entity('unions')
export class Union {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'upazila_id' })
  upazilaId: string;

  @ManyToOne(() => Upazila, (upazila) => upazila.unions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'upazila_id' })
  upazila: Relation<Upazila>;

  @Column({ name: 'name_en', length: 100 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 150 })
  nameBn: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Area, (area) => area.union)
  areas: Relation<Area>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
