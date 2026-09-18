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
import { Country } from './country.entity.js';
import { District } from './district.entity.js';

@Entity('divisions')
export class Division {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'country_id' })
  countryId: string;

  @ManyToOne(() => Country, (country) => country.divisions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'country_id' })
  country: Relation<Country>;

  @Column({ name: 'name_en', length: 100 })
  nameEn: string;

  @Column({ name: 'name_bn', length: 150 })
  nameBn: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => District, (district) => district.division)
  districts: Relation<District>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
