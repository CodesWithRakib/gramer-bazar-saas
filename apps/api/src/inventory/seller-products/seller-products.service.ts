import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerProduct } from '../entities/seller-product.entity.js';
import { CreateSellerProductDto } from '../dto/create-seller-product.dto.js';
import { UpdateSellerProductDto } from '../dto/update-seller-product.dto.js';
import { Inventory } from '../entities/inventory.entity.js';
import { Shop } from '../../shops/entities/shop.entity.js';
import type { Actor } from '../../common/utils/actor.js';
import { Role } from '../../roles/enums/role.enum.js';

@Injectable()
export class SellerProductsService {
  constructor(
    @InjectRepository(SellerProduct)
    private readonly sellerProductsRepository: Repository<SellerProduct>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  private isPrivileged(actor?: Actor): boolean {
    return !!actor && (actor.roles.includes(Role.ADMIN) || actor.roles.includes(Role.SUPER_ADMIN));
  }

  /**
   * Rejects any tenant that tries to read or mutate a listing belonging to
   * another shop. Admins bypass the check.
   */
  private assertOwnership(listing: SellerProduct, actor?: Actor): void {
    if (this.isPrivileged(actor)) return;
    const ownerId = listing.shop?.sellerId;
    if (!actor || !ownerId || ownerId !== actor.id) {
      throw new ForbiddenException('You do not have access to this seller product');
    }
  }

  async create(
    createSellerProductDto: CreateSellerProductDto,
    actor?: Actor,
  ): Promise<SellerProduct> {
    if (!this.isPrivileged(actor)) {
      const shopId = createSellerProductDto.shopId;
      if (!shopId) {
        throw new ForbiddenException('shopId is required');
      }
      const ownsShop = await this.shopRepository.findOne({
        where: { id: shopId, sellerId: actor?.id },
        select: ['id'],
      });
      if (!ownsShop) {
        throw new ForbiddenException('You can only list products under your own shop');
      }
    }

    const sellerProduct = this.sellerProductsRepository.create(createSellerProductDto);
    // Initialize default inventory when a seller product is created
    const inventory = new Inventory();
    inventory.quantity = 0;
    sellerProduct.inventory = inventory;

    return this.sellerProductsRepository.save(sellerProduct);
  }

  async findAll(actor?: Actor): Promise<SellerProduct[]> {
    const relations = ['shop', 'productVariant', 'inventory'];
    if (this.isPrivileged(actor)) {
      return this.sellerProductsRepository.find({ relations });
    }
    return this.sellerProductsRepository.find({
      where: { shop: { sellerId: actor?.id } },
      relations,
    });
  }

  async findOne(id: string, actor?: Actor): Promise<SellerProduct> {
    const sellerProduct = await this.sellerProductsRepository.findOne({
      where: { id },
      relations: ['shop', 'productVariant', 'inventory'],
    });
    if (!sellerProduct) {
      throw new NotFoundException(`SellerProduct with ID ${id} not found`);
    }
    this.assertOwnership(sellerProduct, actor);
    return sellerProduct;
  }

  async update(
    id: string,
    updateSellerProductDto: UpdateSellerProductDto,
    actor?: Actor,
  ): Promise<SellerProduct> {
    const sellerProduct = await this.findOne(id, actor);
    Object.assign(sellerProduct, updateSellerProductDto);
    return this.sellerProductsRepository.save(sellerProduct);
  }

  async remove(id: string, actor?: Actor): Promise<void> {
    const sellerProduct = await this.findOne(id, actor);
    await this.sellerProductsRepository.remove(sellerProduct);
  }
}
