import 'dotenv/config';
import { DataSource } from 'typeorm';
import { seedProducts } from './products.seed';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/entities/*.entity.ts'],
  synchronize: false,
});

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    await seedProducts(AppDataSource);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

void runSeed();
