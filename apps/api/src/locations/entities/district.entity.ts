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
import { Division } from './division.entity.js';
import { Upazila } from './upazila.entity.js';

@Entity('districts')
export class District {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'division_id' })
  divisionId: string;

  @ManyToOne(() => Division, (division) => division.districts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'division_id' })
  division: Relation<Division>;

  @Column({ name: 'name_en', length: 100 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 150 })
  nameBn: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Upazila, (upazila) => upazila.district)
  upazilas: Relation<Upazila>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
