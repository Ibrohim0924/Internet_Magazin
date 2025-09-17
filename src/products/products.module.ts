import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewsService } from './reviews/product-reviews.service';
import { ProductReviewsController } from './reviews/product-reviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, ProductReview])],
  controllers: [ProductsController, ProductReviewsController],
  providers: [ProductsService, ProductReviewsService],
  exports: [ProductsService, ProductReviewsService],
})
export class ProductsModule {}
