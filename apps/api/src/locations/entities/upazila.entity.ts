import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, type Relation } from 'typeorm';
import { District } from './district.entity.js';
import { Union } from './union.entity.js';

@Entity('upazilas')
export class Upazila {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'district_id' })
  districtId: string;

  @ManyToOne(() => District, (district) => district.upazilas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'district_id' })
  district: Relation<District>;

  @Column({ name: 'name_en', length: 100 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 150 })
  nameBn: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Union, (union) => union.upazila)
  unions: Relation<Union>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
