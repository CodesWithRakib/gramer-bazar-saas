import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Division } from './division.entity.js';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name_en', length: 100 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 150 })
  nameBn: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Division, (division) => division.country)
  divisions: Relation<Division>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
