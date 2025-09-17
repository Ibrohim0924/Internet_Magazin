import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductReview } from '../products/entities/product-review.entity';
import { Category } from '../categories/entities/category.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Role } from '../auth/decorators/roles.enum';

dotenv.config();

async function createSuperAdmin() {
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
  const exists = await userRepo.findOne({
    where: { email: 'ibrohimtoshqoriyev3@mail.com' },
  });
  if (!exists) {
    const password = await bcrypt.hash('superadmin123', 10);
    await userRepo.save({
      name: 'Super Admin',
      email: 'ibrohimtoshqoriyev3@mail.com',
      password,
      role: Role.SuperAdmin,
    });
    console.log('Superadmin created!');
  } else {
    console.log('Superadmin already exists!');
  }
  await dataSource.destroy();
}
createSuperAdmin();
