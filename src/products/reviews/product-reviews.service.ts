import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductReview } from '../entities/product-review.entity';
import { Product } from '../entities/product.entity';
import { CreateProductReviewDto } from '../dto/create-product-review.dto';

@Injectable()
export class ProductReviewsService {
  constructor(
    @InjectRepository(ProductReview)
    private readonly reviewRepository: Repository<ProductReview>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async upsert(
    productId: number,
    userId: number,
    createReviewDto: CreateProductReviewDto,
  ): Promise<ProductReview> {
    await this.ensureProductExists(productId);

    let review = await this.reviewRepository.findOne({
      where: { productId, userId },
    });

    if (review) {
      review.comment = createReviewDto.comment;
      review.rating = createReviewDto.rating;
    } else {
      review = this.reviewRepository.create({
        productId,
        userId,
        comment: createReviewDto.comment,
        rating: createReviewDto.rating,
      });
    }

    const saved = await this.reviewRepository.save(review);
    await this.recalculateProductRating(productId);
    return saved;
  }

  async listByProduct(productId: number) {
    await this.ensureProductExists(productId);

    const reviews = await this.reviewRepository.find({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user
        ? {
            id: review.user.id,
            name: review.user.name,
          }
        : null,
    }));
  }

  async remove(
    productId: number,
    reviewId: number,
    requesterId: number,
    isAdmin: boolean,
  ): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, productId },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }
    if (!isAdmin && review.userId !== requesterId) {
      throw new ForbiddenException('You can only remove your own review');
    }

    await this.reviewRepository.remove(review);
    await this.recalculateProductRating(productId);
  }

  private async ensureProductExists(productId: number): Promise<void> {
    const exists = await this.productRepository.exist({ where: { id: productId } });
    if (!exists) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
  }

  private async recalculateProductRating(productId: number): Promise<void> {
    const aggregate = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .getRawOne<{ avg: string | null; count: string }>();

    const average = aggregate?.avg ? Number(aggregate.avg) : 0;
    const total = aggregate?.count ? Number(aggregate.count) : 0;

    await this.productRepository.update(productId, {
      averageRating: average,
      ratingCount: total,
    });
  }
}

