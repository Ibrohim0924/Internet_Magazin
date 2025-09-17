import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductReview } from '../products/entities/product-review.entity';
import { Category } from '../categories/entities/category.entity';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

dotenv.config();

async function generateSuperAdminToken() {
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
    const payload = { sub: superAdmin.id, email: superAdmin.email };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' },
    );

    console.log('Superadmin token:');
    console.log(token);
  } else {
    console.log('Superadmin not found!');
  }

  await dataSource.destroy();
}

generateSuperAdminToken();
