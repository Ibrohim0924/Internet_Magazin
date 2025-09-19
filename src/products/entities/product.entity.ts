import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { Category } from '../../categories/entities/category.entity';
import { ProductReview } from './product-review.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nameUz: string;

  @Column({ type: 'varchar', length: 255 })
  nameRu: string;

  @Column({ type: 'text', nullable: true })
  descriptionUz: string;

  @Column({ type: 'text', nullable: true })
  descriptionRu: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryUz: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryRu: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brandUz: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brandRu: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => Category, category => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @OneToMany(() => ProductReview, review => review.product)
  reviews: ProductReview[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

