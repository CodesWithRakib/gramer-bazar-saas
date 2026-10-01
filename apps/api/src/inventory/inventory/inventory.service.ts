import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity.js';
import { SellerProduct } from '../entities/seller-product.entity.js';
import { CreateInventoryDto } from '../dto/create-inventory.dto.js';
import { UpdateInventoryDto } from '../dto/update-inventory.dto.js';
import { Role } from '../../roles/enums/role.enum.js';

/** Minimal authenticated-actor shape required for tenant scoping. */
export interface InventoryActor {
  id: string;
  roles: string[];
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepository: Repository<SellerProduct>,
  ) {}

  /**
   * A SELLER may only touch stock records that belong to one of their own
   * listings. Admin / Super Admin keep full platform access.
   */
  private async assertCanMutate(inventory: Inventory, actor?: InventoryActor): Promise<Inventory> {
    const loaded = await this.inventoryRepository.findOne({
      where: { id: inventory.id },
      relations: ['sellerProduct', 'sellerProduct.shop'],
    });
    if (!loaded) {
      throw new NotFoundException(`Inventory with ID ${inventory.id} not found`);
    }

    if (!actor) return loaded;

    const isPrivileged =
      actor.roles?.includes(Role.ADMIN) || actor.roles?.includes(Role.SUPER_ADMIN);
    if (isPrivileged) return loaded;

    const ownerId = loaded.sellerProduct?.shop?.sellerId;
    if (!ownerId || ownerId !== actor.id) {
      throw new ForbiddenException('You do not have access to this inventory record');
    }

    return loaded;
  }

  async create(createInventoryDto: CreateInventoryDto, actor?: InventoryActor): Promise<Inventory> {
    if (actor && !actor.roles?.includes(Role.ADMIN) && !actor.roles?.includes(Role.SUPER_ADMIN)) {
      const sellerProduct = await this.sellerProductRepository.findOne({
        where: { id: createInventoryDto.sellerProductId },
        relations: ['shop'],
      });
      if (!sellerProduct) {
        throw new NotFoundException('Seller product not found');
      }
      if (sellerProduct.shop?.sellerId !== actor.id) {
        throw new ForbiddenException('You can only create inventory for your own products');
      }
    }

    const inventory = this.inventoryRepository.create(createInventoryDto);
    return this.inventoryRepository.save(inventory);
  }

  async findAll(actor?: InventoryActor): Promise<Inventory[]> {
    if (!actor || actor.roles?.includes(Role.ADMIN) || actor.roles?.includes(Role.SUPER_ADMIN)) {
      return this.inventoryRepository.find();
    }

    const listings = await this.sellerProductRepository.find({
      where: { shop: { sellerId: actor.id } },
      select: ['id'],
    });
    if (listings.length === 0) return [];

    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.sellerProductId IN (:...ids)', { ids: listings.map((l) => l.id) })
      .getMany();
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    return inventory;
  }

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
    actor?: InventoryActor,
  ): Promise<Inventory> {
    const inventory = await this.findOne(id);
    await this.assertCanMutate(inventory, actor);

    const nextQuantity = updateInventoryDto.quantity ?? inventory.quantity;
    const reserved = inventory.reservedQuantity ?? 0;
    if (nextQuantity < reserved) {
      throw new BadRequestException(
        `Cannot set quantity below the reserved quantity (${reserved})`,
      );
    }

    Object.assign(inventory, updateInventoryDto);
    return this.inventoryRepository.save(inventory);
  }

  async remove(id: string): Promise<void> {
    const inventory = await this.findOne(id);
    await this.inventoryRepository.remove(inventory);
  }
}
