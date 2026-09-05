import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/modules/auth.module';
import { UsersModule } from '../src/modules/users.module';
import { User } from '../src/entities/user.entity';

interface AuthResponseBody {
  access_token: string;
  user: { email: string; password?: string };
}

interface MeResponseBody {
  email: string;
}

// Full app bootstrap (AppModule) needs a live Postgres connection and AWS
// credentials, neither of which exist in CI yet. This wires up just the
// auth/users slice with an in-memory fake User repository instead, which is
// the standard NestJS pattern for exercising real guards/controllers/
// strategies without a database - see server/src/entities/user.entity.ts for
// the shape being faked.
describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;
  let users: User[];
  let nextUserId: number;

  const credentials = {
    full_name: 'E2E Test User',
    email: 'e2e-test-user@example.com',
    password: 'password123',
  };

  let token: string;

  const fakeUserRepository = {
    create: (data: Partial<User>) => ({ ...data }) as User,
    save: (entity: User) => {
      if (entity.user_id == null) {
        entity.user_id = nextUserId++;
        users.push(entity);
      } else {
        const index = users.findIndex((u) => u.user_id === entity.user_id);
        users[index] = entity;
      }
      return Promise.resolve(entity);
    },
    findOne: ({ where }: { where: Partial<User> }) => {
      const found = users.find((u) =>
        Object.entries(where).every(
          ([key, value]) =>
            (u as unknown as Record<string, unknown>)[key] === value,
        ),
      );
      return Promise.resolve(found ?? null);
    },
    update: (id: number, partial: Partial<User>) => {
      const index = users.findIndex((u) => u.user_id === id);
      if (index >= 0) {
        Object.assign(users[index], partial);
      }
      return Promise.resolve({ affected: index >= 0 ? 1 : 0 });
    },
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'e2e-test-jwt-secret';
    process.env.JWT_EXPIRATION = '1h';
    process.env.GOOGLE_CLIENT_ID = 'e2e-test-google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'e2e-test-google-client-secret';
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:3000/auth/google/callback';

    users = [];
    nextUserId = 1;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        UsersModule,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(fakeUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);

    const body = res.body as AuthResponseBody;
    expect(body.access_token).toBeDefined();
    expect(body.user.email).toBe(credentials.email);
    expect(body.user.password).toBeUndefined();
  });

  it('logs in with the registered credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    const body = res.body as AuthResponseBody;
    expect(body.access_token).toBeDefined();
    token = body.access_token;
  });

  it('rejects a protected route when no token is provided', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('allows a protected route when a valid token is provided', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect((res.body as MeResponseBody).email).toBe(credentials.email);
  });

  it('blocks a regular user from an admin-only route', async () => {
    await request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
