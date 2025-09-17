import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...payload } = createProductDto;
    const product = this.productRepository.create({
      ...payload,
      averageRating: 0,
      ratingCount: 0,
    });

    if (categoryId) {
      product.category = await this.findCategory(categoryId);
      product.categoryId = categoryId;
    }

    return this.productRepository.save(product);
  }

  async findAll(sort?: string): Promise<Product[]> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (sort === 'rating') {
      query
        .orderBy('product.averageRating', 'DESC')
        .addOrderBy('product.ratingCount', 'DESC')
        .addOrderBy('product.createdAt', 'DESC');
    } else {
      query.orderBy('product.createdAt', 'DESC');
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const { categoryId, ...rest } = updateProductDto;

    if (categoryId !== undefined) {
      if (categoryId === null) {
        product.category = undefined;
        product.categoryId = null;
      } else if (categoryId > 0) {
        product.category = await this.findCategory(categoryId);
        product.categoryId = categoryId;
      } else {
        throw new BadRequestException('Invalid category identifier');
      }
    }

    Object.assign(product, rest);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private async findCategory(categoryId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    return category;
  }
}
