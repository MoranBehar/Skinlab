import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { METHODS } from 'http';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // for enablling nest to use my dto and validate fields
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PUT, PATCH, DELETE",
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
