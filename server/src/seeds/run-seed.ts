
import { DataSource } from 'typeorm';
import { seedProducts } from './products.seed';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
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

runSeed();