import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, type Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Country } from '../../locations/entities/country.entity.js';
import { Division } from '../../locations/entities/division.entity.js';
import { District } from '../../locations/entities/district.entity.js';
import { Upazila } from '../../locations/entities/upazila.entity.js';
import { Union } from '../../locations/entities/union.entity.js';
import { Area } from '../../locations/entities/area.entity.js';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ length: 100 })
  title: string;

  @Column({ name: 'contact_name', length: 150 })
  contactName: string;

  @Column({ name: 'contact_phone', length: 20 })
  contactPhone: string;

  @Column({ name: 'country_id', nullable: true })
  countryId: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Relation<Country>;

  @Column({ name: 'division_id', nullable: true })
  divisionId: string;

  @ManyToOne(() => Division)
  @JoinColumn({ name: 'division_id' })
  division: Relation<Division>;

  @Column({ name: 'district_id', nullable: true })
  districtId: string;

  @ManyToOne(() => District)
  @JoinColumn({ name: 'district_id' })
  district: Relation<District>;

  @Column({ name: 'upazila_id', nullable: true })
  upazilaId: string;

  @ManyToOne(() => Upazila)
  @JoinColumn({ name: 'upazila_id' })
  upazila: Relation<Upazila>;

  @Column({ name: 'union_id', nullable: true })
  unionId: string;

  @ManyToOne(() => Union)
  @JoinColumn({ name: 'union_id' })
  union: Relation<Union>;

  @Column({ name: 'area_id', nullable: true })
  areaId: string;

  @ManyToOne(() => Area)
  @JoinColumn({ name: 'area_id' })
  area: Relation<Area>;

  @Column({ name: 'street_address', type: 'text' })
  streetAddress: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
