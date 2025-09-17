import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as dotenv from 'dotenv';
import { Role } from '../auth/decorators/roles.enum';

dotenv.config();

async function updateSuperAdminRole() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User],
    synchronize: false,
  });
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const superAdmin = await userRepo.findOne({ where: { email: 'ibrohimtoshqoriyev3@mail.com' } });
  
  if (superAdmin) {
    superAdmin.role = Role.SuperAdmin;
    await userRepo.save(superAdmin);
    console.log('Superadmin role updated to:', superAdmin.role);
  } else {
    console.log('Superadmin not found!');
  }
  
  await dataSource.destroy();
}

updateSuperAdminRole();