import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = await this.ensureUniqueSlug(
      createCategoryDto.slug ?? createCategoryDto.nameUz,
    );

    const category = this.categoryRepo.create({
      ...createCategoryDto,
      slug,
    });

    if (createCategoryDto.parentId) {
      category.parent = await this.getParent(createCategoryDto.parentId);
      category.parentId = createCategoryDto.parentId;
    }

    return this.categoryRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
      relations: ['children'],
      order: { nameUz: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.parentId === id) {
      throw new BadRequestException('Category cannot reference itself as parent');
    }

    if (updateCategoryDto.slug || updateCategoryDto.nameUz) {
      const source =
        updateCategoryDto.slug ?? updateCategoryDto.nameUz ?? category.slug ?? undefined;
      category.slug = await this.ensureUniqueSlug(source, id);
    }

    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId) {
        category.parent = await this.getParent(updateCategoryDto.parentId);
        category.parentId = updateCategoryDto.parentId;
      } else {
        category.parent = undefined;
        category.parentId = null;
      }
    }

    Object.assign(category, {
      ...updateCategoryDto,
      slug: category.slug,
    });

    return this.categoryRepo.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    const childrenCount = await this.categoryRepo.count({
      where: { parentId: category.id },
    });
    if (childrenCount > 0) {
      throw new ConflictException('Cannot delete category with children');
    }

    const productCount = await this.categoryRepo.manager.count(Product, {
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new ConflictException('Cannot delete category linked to products');
    }

    await this.categoryRepo.remove(category);
  }

  private async getParent(parentId: number): Promise<Category> {
    if (parentId <= 0) {
      throw new BadRequestException('Invalid parent category');
    }
    const parent = await this.categoryRepo.findOne({ where: { id: parentId } });
    if (!parent) {
      throw new NotFoundException(`Parent category with ID ${parentId} not found`);
    }
    return parent;
  }

  private slugify(source: string): string {
    return source
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async ensureUniqueSlug(
    source?: string,
    ignoreId?: number,
  ): Promise<string> {
    const baseRaw = this.slugify(source ?? '');
    const base = baseRaw || `category-${Date.now()}`;
    let slug = base;
    let attempt = 1;

    while (true) {
      const existing = await this.categoryRepo.findOne({ where: { slug } });
      if (!existing || existing.id === ignoreId) {
        return slug;
      }
      slug = `${base}-${attempt++}`;
    }
  }
}
