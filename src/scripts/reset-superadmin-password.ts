import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductReview } from '../products/entities/product-review.entity';
import { Category } from '../categories/entities/category.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Role } from '../auth/decorators/roles.enum';

dotenv.config();

async function resetSuperAdminPassword() {
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
    where: { email: 'ibrohimtoshqoriyev3@gmail.com' },
  });

  if (!superAdmin) {
    console.log('Superadmin not found, creating new one...');
    const password = await bcrypt.hash('superadmin123', 10);
    await userRepo.save({
      name: 'Super Admin',
      email: 'ibrohimtoshqoriyev3@gmail.com',
      password,
      role: Role.SuperAdmin,
    });
  } else {
    superAdmin.password = await bcrypt.hash('superadmin123', 10);
    superAdmin.role = Role.SuperAdmin;
    await userRepo.save(superAdmin);
    console.log('Superadmin password and role reset.');
  }

  await dataSource.destroy();
}

resetSuperAdminPassword();
