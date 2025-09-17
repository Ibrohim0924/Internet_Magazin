import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductReviewsService } from './product-reviews.service';
import { CreateProductReviewDto } from '../dto/create-product-review.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/decorators/roles.enum';

interface AuthRequest extends Request {
  user: { id: number; role?: string; roles?: string[] };
}

@Controller('products')
export class ProductReviewsController {
  constructor(private readonly productReviewsService: ProductReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':productId/reviews')
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createReviewDto: CreateProductReviewDto,
    @Req() req: AuthRequest,
  ) {
    return this.productReviewsService.upsert(
      productId,
      req.user.id,
      createReviewDto,
    );
  }

  @Get(':productId/reviews')
  findAll(@Param('productId', ParseIntPipe) productId: number) {
    return this.productReviewsService.listByProduct(productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Delete(':productId/reviews/:reviewId')
  removeAsAdmin(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Req() req: AuthRequest,
  ) {
    return this.productReviewsService.remove(
      productId,
      reviewId,
      req.user.id,
      true,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':productId/reviews/:reviewId/me')
  removeSelf(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Req() req: AuthRequest,
  ) {
    return this.productReviewsService.remove(
      productId,
      reviewId,
      req.user.id,
      false,
    );
  }
}
