# SkinLab

A full-stack e-commerce platform for selling skincare products. Built as a graduation (final)
project to demonstrate full-stack development, external API integration (Google OAuth), relational
database design, and basic application security (password hashing, JWT).

## Features

- **User side:** registration/login (manual + Google OAuth), product catalog with
  filtering/sorting/pagination, an interactive cart (add/update/remove with no page refresh), and
  placing/tracking orders.
- **Admin side:** product management (add/edit/delete, multi-image upload to S3), order status
  monitoring and updates, analytics (revenue by period, recent orders), and role-based permissions
  that block regular users from admin-only endpoints.

## Tech stack

| Layer          | Technology                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| Frontend       | React 19 + TypeScript, react-router-dom v7, react-bootstrap, Create React App |
| Backend        | NestJS 11 + TypeScript, REST API                                          |
| Database       | PostgreSQL (schema `skinLab`), TypeORM (`synchronize: false`)             |
| Image storage  | AWS S3 (`@aws-sdk/client-s3`, presigned URLs)                             |
| Auth           | JWT (`@nestjs/jwt`, `passport-jwt`) + Google OAuth 2.0 (`passport-google-oauth20`) |

## Folder structure

```
/                      root package.json (shared/misc deps)
/client                React + TS frontend (CRA)
  src/components/      admin/, cart/, orders/, products/, route/ (protected/public/admin guards)
  src/contexts/        authContext, cartContext (client-side auth/cart state)
  src/pages/           user pages + admin/ subfolder
  src/services/        *.api.ts — axios calls per domain (admin, auth, cart, order, products)
  src/types/           per-domain TS types
/server                NestJS + TS backend
  src/contrrollers/    REST controllers (folder name is a known typo, kept for now)
  src/services/        business logic per domain + s3.service.ts
  src/entities/        TypeORM entities (users, products, orders, cart, lookup tables)
  src/DTO/             class-validator DTOs, grouped by domain
  src/modules/         Nest modules wiring controllers/services/entities
  src/common/guards/   jwtAuth.guard.ts, roles.guard.ts
  src/common/decorators/ roles.decorator.ts, getUser.decorator.ts
  src/strategies/      jwt.strategy.ts, google.strategy.ts
  src/seeds/           products.seed.ts + run-seed.ts
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL (a running instance with a database created for this project)
- (Optional, for image upload) an AWS account with an S3 bucket
- (Optional, for Google login) a Google OAuth 2.0 client ID/secret

## Setup

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

Copy the example env files and fill in real values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

See `server/.env.example` and `client/.env.example` for the full list of variables (database
connection, JWT secret, Google OAuth credentials, AWS/S3 credentials, frontend URL, port).

### 3. Set up the database

Create a PostgreSQL database matching `DATABASE_NAME` in `server/.env`, then run the migrations:

```bash
cd server
npm run migration:run
```

See `server/src/migrations/` for the schema history and `server/package.json` for the other
`migration:*` scripts (`generate`, `create`, `revert`).

### 4. Seed the database (optional)

To populate the product catalog with sample data:

```bash
cd server
npx ts-node -r tsconfig-paths/register src/seeds/run-seed.ts
```

The seed script reads the same `DATABASE_*` variables as the server from `server/.env`.

### 5. Run the backend

```bash
cd server
npm run start:dev
```

The API starts on `http://localhost:<PORT>` (default `3000`).

### 6. Run the frontend

```bash
cd client
npm start
```

The React app starts on `http://localhost:3001` and talks to the API via `REACT_APP_API_URL`.

## Running lint & tests

```bash
cd server
npm run lint
npm test

cd ../client
npm test
```

## Roles

Users have a `role_id`: `0` = regular user, `1` = admin. Admin-only routes are protected with
`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(1)`.
