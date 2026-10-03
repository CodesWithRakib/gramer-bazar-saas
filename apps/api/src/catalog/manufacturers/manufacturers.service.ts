import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturer } from '../entities/manufacturer.entity.js';
import { Product } from '../entities/product.entity.js';
import { CreateManufacturerDto, UpdateManufacturerDto } from '../dto/manufacturer.dto.js';
import { slugify, slugifyUnique } from '../../common/utils/slug.js';

@Injectable()
export class ManufacturersService {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturersRepository: Repository<Manufacturer>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateManufacturerDto): Promise<Manufacturer> {
    const baseSlug = slugify(dto.nameEn, 'manufacturer', 200);
    let slug = baseSlug;
    const clashes = await this.manufacturersRepository.count({ where: { slug } });
    if (clashes > 0) slug = slugifyUnique(dto.nameEn, 'manufacturer', 200);

    return this.manufacturersRepository.save(
      this.manufacturersRepository.create({
        nameEn: dto.nameEn,
        nameBn: dto.nameBn,
        slug,
        country: dto.country ?? null,
        logo: dto.logo ?? null,
        website: dto.website ?? null,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async findAll(search?: string, isActive?: boolean): Promise<Manufacturer[]> {
    const query = this.manufacturersRepository
      .createQueryBuilder('manufacturer')
      .orderBy('manufacturer.nameEn', 'ASC');

    if (search) {
      query.andWhere('(manufacturer.nameEn ILIKE :search OR manufacturer.nameBn ILIKE :search)', {
        search: `%${search}%`,
      });
    }
    if (isActive !== undefined) {
      query.andWhere('manufacturer.isActive = :isActive', { isActive });
    }
    return query.getMany();
  }

  async findOne(id: string): Promise<Manufacturer> {
    const manufacturer = await this.manufacturersRepository.findOne({ where: { id } });
    if (!manufacturer) throw new NotFoundException('Manufacturer not found');
    return manufacturer;
  }

  async update(id: string, dto: UpdateManufacturerDto): Promise<Manufacturer> {
    const manufacturer = await this.findOne(id);
    Object.assign(manufacturer, {
      nameEn: dto.nameEn ?? manufacturer.nameEn,
      nameBn: dto.nameBn ?? manufacturer.nameBn,
      country: dto.country === undefined ? manufacturer.country : (dto.country ?? null),
      logo: dto.logo === undefined ? manufacturer.logo : (dto.logo ?? null),
      website: dto.website === undefined ? manufacturer.website : (dto.website ?? null),
      isActive: dto.isActive ?? manufacturer.isActive,
    });
    return this.manufacturersRepository.save(manufacturer);
  }

  async remove(id: string): Promise<{ message: string }> {
    const manufacturer = await this.findOne(id);
    const inUse = await this.productsRepository.count({ where: { manufacturerId: id } });
    if (inUse > 0) {
      throw new BadRequestException(
        'Manufacturer is referenced by products and cannot be deleted. Deactivate it instead.',
      );
    }
    await this.manufacturersRepository.remove(manufacturer);
    return { message: 'Manufacturer deleted successfully' };
  }
}
