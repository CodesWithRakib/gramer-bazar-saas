import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity.js';
import { ProductIngredient } from '../entities/product-ingredient.entity.js';
import { CreateIngredientDto, UpdateIngredientDto } from '../dto/ingredient.dto.js';
import { slugify, slugifyUnique } from '../../common/utils/slug.js';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(ProductIngredient)
    private readonly productIngredientsRepository: Repository<ProductIngredient>,
  ) {}

  async create(dto: CreateIngredientDto): Promise<Ingredient> {
    const baseSlug = slugify(dto.nameEn, 'ingredient', 200);
    let slug = baseSlug;
    const clashes = await this.ingredientsRepository.count({ where: { slug } });
    if (clashes > 0) slug = slugifyUnique(dto.nameEn, 'ingredient', 200);

    return this.ingredientsRepository.save(
      this.ingredientsRepository.create({
        nameEn: dto.nameEn,
        nameBn: dto.nameBn,
        slug,
        isPrescriptionOnly: dto.isPrescriptionOnly ?? false,
        isActive: dto.isActive ?? true,
      }),
    );
  }

  async findAll(search?: string, isActive?: boolean): Promise<Ingredient[]> {
    const query = this.ingredientsRepository
      .createQueryBuilder('ingredient')
      .orderBy('ingredient.nameEn', 'ASC');

    if (search) {
      query.andWhere(
        '(ingredient.nameEn ILIKE :search OR ingredient.nameBn ILIKE :search OR ingredient.slug ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (isActive !== undefined) {
      query.andWhere('ingredient.isActive = :isActive', { isActive });
    }
    return query.getMany();
  }

  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({ where: { id } });
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    return ingredient;
  }

  async update(id: string, dto: UpdateIngredientDto): Promise<Ingredient> {
    const ingredient = await this.findOne(id);
    if (dto.nameEn && dto.nameEn !== ingredient.nameEn) {
      const baseSlug = slugify(dto.nameEn, 'ingredient', 200);
      let slug = baseSlug;
      const clashes = await this.ingredientsRepository
        .createQueryBuilder('i')
        .where('i.slug = :slug AND i.id != :id', { slug, id })
        .getCount();
      if (clashes > 0) slug = slugifyUnique(dto.nameEn, 'ingredient', 200);
      ingredient.slug = slug;
      ingredient.nameEn = dto.nameEn;
    }
    if (dto.nameBn !== undefined) ingredient.nameBn = dto.nameBn;
    if (dto.isPrescriptionOnly !== undefined) ingredient.isPrescriptionOnly = dto.isPrescriptionOnly;
    if (dto.isActive !== undefined) ingredient.isActive = dto.isActive;

    return this.ingredientsRepository.save(ingredient);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    const count = await this.productIngredientsRepository.count({ where: { ingredientId: id } });
    if (count > 0) {
      throw new BadRequestException(
        `Cannot delete ingredient: it is referenced by ${count} product compositions`,
      );
    }
    await this.ingredientsRepository.delete(id);
    return { success: true, message: 'Ingredient deleted successfully' };
  }
}
