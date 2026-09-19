import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity.js';
import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannersRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto) {
    const banner = this.bannersRepository.create(createBannerDto);
    return await this.bannersRepository.save(banner);
  }

  async findAllAdmin() {
    return await this.bannersRepository.find({
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findActiveBanners() {
    return await this.bannersRepository.find({
      where: { isActive: true },
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const banner = await this.bannersRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto) {
    const banner = await this.findOne(id);
    Object.assign(banner, updateBannerDto);
    return await this.bannersRepository.save(banner);
  }

  async remove(id: string) {
    const banner = await this.findOne(id);
    await this.bannersRepository.remove(banner);
    return { success: true, message: 'Banner removed successfully' };
  }
}
