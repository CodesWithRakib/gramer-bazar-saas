import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto) {
    if (createAddressDto.isDefault) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      userId,
    });
    
    // If it's the first address, make it default
    const count = await this.addressRepository.count({ where: { userId } });
    if (count === 0) {
      address.isDefault = true;
    }

    return this.addressRepository.save(address);
  }

  async findAllByUser(userId: string) {
    return this.addressRepository.find({
      where: { userId },
      relations: ['country', 'division', 'district', 'upazila', 'union', 'area'],
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
      relations: ['country', 'division', 'district', 'upazila', 'union', 'area'],
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  async update(id: string, userId: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.findOne(id, userId);

    if (updateAddressDto.isDefault) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.addressRepository.remove(address);
    return { success: true };
  }
}

