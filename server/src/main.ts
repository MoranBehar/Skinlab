import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for React frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3001",
    credentials: true,
  });

  // Enable validation pipes globally for nest to use DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log('Server is running!');
  console.log(`http://localhost:${port}`);
  console.log(`Database: ${process.env.DATABASE_NAME}`);
}

bootstrap();
