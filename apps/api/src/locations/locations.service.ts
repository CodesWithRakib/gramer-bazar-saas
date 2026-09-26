import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity.js';
import { Division } from './entities/division.entity.js';
import { District } from './entities/district.entity.js';
import { Upazila } from './entities/upazila.entity.js';
import { Union } from './entities/union.entity.js';
import { Area } from './entities/area.entity.js';

@Injectable()
export class LocationsService implements OnModuleInit {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectRepository(Country) private readonly countryRepo: Repository<Country>,
    @InjectRepository(Division) private readonly divisionRepo: Repository<Division>,
    @InjectRepository(District) private readonly districtRepo: Repository<District>,
    @InjectRepository(Upazila) private readonly upazilaRepo: Repository<Upazila>,
    @InjectRepository(Union) private readonly unionRepo: Repository<Union>,
    @InjectRepository(Area) private readonly areaRepo: Repository<Area>,
  ) {}

  async onModuleInit() {
    await this.seedLocations();
  }

  private async seedLocations() {
    try {
      const count = await this.countryRepo.count();
      if (count > 0) {
        return; // Already seeded
      }

      this.logger.log('Seeding initial location data for Gramer Bazar...');

      const country = this.countryRepo.create({ nameEn: 'Bangladesh', nameBn: 'বাংলাদেশ' });
      await this.countryRepo.save(country);

      const division = this.divisionRepo.create({ countryId: country.id, nameEn: 'Rangpur', nameBn: 'রংপুর' });
      await this.divisionRepo.save(division);

      const district = this.districtRepo.create({ divisionId: division.id, nameEn: 'Dinajpur', nameBn: 'দিনাজপুর' });
      await this.districtRepo.save(district);

      const upazila = this.upazilaRepo.create({ districtId: district.id, nameEn: 'Khansama', nameBn: 'খানসামা' });
      await this.upazilaRepo.save(upazila);

      const unionsData = [
        { nameEn: 'Alokjhari', nameBn: 'আলোকঝাড়ী' },
        { nameEn: 'Bherveri', nameBn: 'ভেরভেরী' },
        { nameEn: 'Angarpara', nameBn: 'আঙ্গারপাড়া' },
        { nameEn: 'Khamarpara', nameBn: 'খামারপাড়া' },
        { nameEn: 'Bhabki', nameBn: 'ভাবকী' },
        { nameEn: 'Goaldihi', nameBn: 'গোয়ালডিহি' },
      ];

      for (const u of unionsData) {
        const union = this.unionRepo.create({ upazilaId: upazila.id, nameEn: u.nameEn, nameBn: u.nameBn });
        await this.unionRepo.save(union);

        // Add a couple of dummy areas per union for completeness
        const areas = [
          this.areaRepo.create({ unionId: union.id, nameEn: `${u.nameEn} Center`, nameBn: `${u.nameBn} কেন্দ্র`, deliveryFee: 30 }),
          this.areaRepo.create({ unionId: union.id, nameEn: `${u.nameEn} North`, nameBn: `${u.nameBn} উত্তর`, deliveryFee: 40 }),
        ];
        await this.areaRepo.save(areas);
      }

      this.logger.log('Location seeding complete.');
    } catch (err: unknown) {
      const message = (err as Error)?.message || '';
      if (message.includes('relation "countries" does not exist') || (message.includes('countries') && message.includes('does not exist'))) {
        this.logger.warn('Skipping initial location seed: "countries" table does not exist in database yet. Please run migrations first.');
        return;
      }
      throw err;
    }
  }

  async getCountries() {
    return this.countryRepo.find({ where: { isActive: true }, order: { nameEn: 'ASC' } });
  }

  async getDivisions(countryId?: string) {
    const where = { isActive: true, ...(countryId ? { countryId } : {}) };
    return this.divisionRepo.find({ where, order: { nameEn: 'ASC' } });
  }

  async getDistricts(divisionId?: string) {
    const where = { isActive: true, ...(divisionId ? { divisionId } : {}) };
    return this.districtRepo.find({ where, order: { nameEn: 'ASC' } });
  }

  async getUpazilas(districtId?: string) {
    const where = { isActive: true, ...(districtId ? { districtId } : {}) };
    return this.upazilaRepo.find({ where, order: { nameEn: 'ASC' } });
  }

  async getUnions(upazilaId?: string) {
    const where = { isActive: true, ...(upazilaId ? { upazilaId } : {}) };
    return this.unionRepo.find({ where, order: { nameEn: 'ASC' } });
  }

  async getAreas(unionId?: string) {
    const where = { isActive: true, ...(unionId ? { unionId } : {}) };
    return this.areaRepo.find({ where, order: { nameEn: 'ASC' } });
  }
}
