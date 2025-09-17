import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductReview } from '../products/entities/product-review.entity';
import { Category } from '../categories/entities/category.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkSuperAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, Product, ProductReview, Category],
    synchronize: false,
  });
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const superAdmin = await userRepo.findOne({
    where: { email: 'ibrohimtoshqoriyev3@mail.com' },
  });

  if (superAdmin) {
    console.log('Superadmin found:');
    console.log('ID:', superAdmin.id);
    console.log('Name:', superAdmin.name);
    console.log('Email:', superAdmin.email);
    console.log('Role:', superAdmin.role);
  } else {
    console.log('Superadmin not found!');
  }

  await dataSource.destroy();
}

checkSuperAdmin();
