import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({ type: 'decimal', precision: 10, scale: 2 })
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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}