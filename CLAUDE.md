# SkinLab — Project Context for Claude Code

Repo: https://github.com/MoranBehar/Skinlab.git
This is a graduation (final) project: a full-stack e-commerce platform for selling skincare
products, built to demonstrate full-stack development, external API integration (Google OAuth),
relational database design, and basic security (password hashing, JWT).

Read this file before making changes. It reflects the **actual current state of the repo**
(checked on 2026-08-15), not just the original proposal, so treat "Known gaps" below as the
real backlog.

## Scope

- **Part 1 — User side:** registration/login (manual + Google), product catalog with
  filtering/sorting, interactive cart (no page refresh), placing orders + tracking.
- **Part 2 — Admin side:** product management (add/edit/delete), order status monitoring/updates,
  permissions blocking regular users from admin-only endpoints.
- **Bonus (optional):** real-time chat between users and admin via Socket.io.

## Tech stack

- Frontend: React 19 + TypeScript, react-router-dom v7, react-bootstrap, CRA (`react-scripts`)
- Backend: NestJS 11 + TypeScript, REST API
- Database: PostgreSQL (schema `skinLab`), TypeORM (`synchronize: false`)
- Image storage: AWS S3 (`@aws-sdk/client-s3`, presigned URLs)
- Auth: JWT (`@nestjs/jwt`, `passport-jwt`) + Google OAuth 2.0 (`passport-google-oauth20`)
- Real-time chat (bonus): Socket.io — **not yet added to either package.json**

## Repo layout

```
/                      root package.json (misc shared deps — see note below)
/client                 React + TS frontend (CRA)
  src/components/       admin/, cart/, orders/, products/, route/ (protected/public/admin guards)
  src/contexts/         authContext, cartContext (client-side auth/cart state)
  src/pages/            user pages + admin/ subfolder
  src/services/         *.api.ts — axios calls per domain (admin, auth, cart, order, products)
  src/types/            per-domain TS types
/server                 NestJS + TS backend
  src/contrrollers/     [sic — folder is misspelled, keep consistent until renamed, see below]
  src/services/         business logic per domain + s3.service.ts
  src/entities/         TypeORM entities (users, products, orders, cart, lookup tables)
  src/DTO/              class-validator DTOs, grouped by domain
  src/modules/          Nest modules wiring controllers/services/entities
  src/common/guards/    jwtAuth.guard.ts, roles.guard.ts
  src/common/decorators/roles.decorator.ts, getUser.decorator.ts
  src/strategies/       jwt.strategy.ts, google.strategy.ts
  src/seeds/            products.seed.ts + run-seed.ts (no migrations — see gaps)
```

Roles: `role_id` on `User` — `0` = regular user, `1` = admin. Admin routes are guarded with
`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(1)`.

## Conventions already in use (follow these)

- **Server formatting:** Prettier, single quotes, trailing commas (`server/.prettierrc`).
  Run `npm run format` / `npm run lint` inside `server/` before committing.
- **Server ESLint:** `typescript-eslint recommendedTypeChecked` + prettier, but with
  `no-explicit-any: off` and `no-floating-promises` / `no-unsafe-argument` downgraded to `warn`.
  Don't tighten these without checking with the project owner first — they were relaxed
  deliberately for a student timeline, but new code should still avoid `any` and unhandled
  promises where practical.
- **DTOs:** `class-validator` + `class-transformer`, one file per action per domain
  (`createX.dto.ts`, `updateX.dto.ts`, `filterX.dto.ts`). Multipart/form fields use
  `@Transform` to coerce strings to numbers/booleans (see `createProduct.dto.ts`).
- **Auth:** passwords hashed with `bcrypt` (cost 10) in `auth.service.ts` and
  `users.controller.ts`. JWT secret/expiry and all external credentials are read via
  `ConfigService.getOrThrow(...)` — never hardcode secrets, always add new ones to env vars.
- **Guards:** `JwtAuthGuard` at the controller level for "must be logged in", `RolesGuard` +
  `@Roles(1)` per-route for "admin only". Always strip `password` / `access_token` from any
  user object before returning it from a controller (existing pattern in `users.controller.ts`).
- **File naming:** camelCase filenames on the client (`productCard.tsx`), mixed casing on the
  server entities (see bug below) — match whatever the neighboring files in that folder do.

## Known gaps — please address these

Ordered roughly by how much they affect grading/robustness, not necessarily implementation order.

1. **Zero real tests.** The only test files in the whole repo are NestJS's default
   `app.controller.spec.ts` and `app.e2e-spec.ts` — untouched boilerplate. There are no unit
   tests for `auth.service`, `products.service`, `orders.service`, `cart.service`,
   `users.service`, or the guards (`RolesGuard`, `JwtAuthGuard`). The client has
   `@testing-library/*` installed as a dependency but **no test files exist at all**. Adding a
   handful of meaningful unit tests (auth register/login happy + failure paths, RolesGuard
   allow/deny, cart add/remove) would matter a lot for the project book's "testing" expectations.

2. **IDOR-style permission gap:** `GET /users/:id` in `server/src/contrrollers/users.controller.ts`
   has no `RolesGuard`/`@Roles` check — any logged-in user can fetch *any other user's* profile
   by guessing an ID (only password/token are stripped; name, email, points, role_id leak). Given
   the project's explicit goal of "permissions that block regular users from admin-only
   endpoints," this route should either require admin role or be removed if unused by the client.

3. **Case-mismatched import will break on Linux/CI.** The entity file is
   `server/src/entities/ShippingAddress.entity.ts` (capital S) but it's imported everywhere as
   `'../entities/shippingAddress.entity'` (lowercase s) — see `app.module.ts`, `orders.module.ts`,
   `orders.service.ts`. This resolves fine on macOS/Windows (case-insensitive filesystem) but will
   fail to compile on case-sensitive Linux (most CI runners, Docker, most hosting). Fix by
   renaming the file or the imports to match exactly.

4. **Dead/broken code in `createProduct.dto.ts`:** a leftover `IsNoEmpty()` function at the
   bottom that just throws `Function not implemented` and isn't referenced anywhere — safe to
   delete.

5. **Bonus feature not started:** no `socket.io` dependency in either `package.json`, no chat
   module/controller/gateway on the server, no chat UI/service on the client. This is the entire
   optional bonus and is currently 0% implemented.

6. **No DB migrations.** TypeORM is configured with `synchronize: false` (correct for anything
   beyond a toy project) but there's no `migrations/` folder — only a one-off `products.seed.ts`.
   Schema changes currently have no version-controlled path. Worth adding TypeORM migrations
   before the project book's "database" chapter is finalized, so schema evolution is documented.

7. **No environment documentation.** Required env vars are scattered across the code with no
   single reference: `DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME`, `JWT_SECRET`,
   `JWT_EXPIRATION`, `GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL`, `AWS_REGION/ACCESS_KEY_ID/
  SECRET_ACCESS_KEY/S3_BUCKET_NAME`, `FRONTEND_URL`, `PORT`. Add a `server/.env.example` (and
  `client/.env.example` if the client reads any `REACT_APP_*` vars) listing every key with a
  placeholder value.

8. **No README anywhere** (root, client, or server) — no setup/run instructions. Needed both for
   a grader trying to run the project and as source material for the Project Book's
   "folder structure" and "technologies used" chapters.

9. **No CI.** No `.github/workflows` — lint and tests (once they exist) aren't run
   automatically. A basic GitHub Actions workflow running `npm run lint` and `npm test` in both
   `client/` and `server/` on push/PR would be a good, low-effort addition.

10. **No API documentation.** No Swagger/OpenAPI setup (`@nestjs/swagger`) despite the project
    being a documented REST API deliverable — would also make the Project Book's architecture
    chapter easier to write.

11. **Minor/cosmetic:** the `server/src/contrrollers` folder name is misspelled (should be
    `controllers`). Harmless functionally, but rename it in a dedicated commit if there's time,
    since it's referenced by every controller import path.

12. **Client has no dedicated lint/format config** — it only inherits CRA's default
    `eslintConfig` (`react-app`, `react-app/jest`) with no Prettier config, so client formatting
    isn't enforced the way server formatting is via `server/.prettierrc`.

## What's already implemented and working (don't re-build these)

- Manual register/login with bcrypt + JWT (`auth.service.ts`, `auth.controller.ts`)
- Google OAuth login (`google.strategy.ts`, `googleAuthSuccess.tsx`)
- Product catalog with filtering/sorting/pagination (`products.controller.ts`,
  `productFilters.tsx`, `productSort.tsx`, `productPagination.tsx`)
- Cart (add/update/remove/clear, item count) fully wired client + server, no page refresh
  (`cartContext.tsx`, `cart.controller.ts`)
- Order placement + shipping address + tracking + status history
  (`orders.controller.ts`, `order.entity.ts`, `orderTracking.entity.ts`, `checkoutPage.tsx`)
- Admin product CRUD incl. multi-image upload to S3, soft delete
  (`products.controller.ts` admin routes, `adminProductsForm.tsx`)
- Admin order management: list/filter, status update, stats, revenue-by-period, recent orders
  (`orders.controller.ts` admin routes, `AdminAnalyticsPage.tsx`, `adminOrdersPage.tsx`)
- Role-based route/permission blocking (`RolesGuard`, `@Roles`, `adminRoutes.tsx`,
  `protectedRoute.tsx`)

## Working with this repo in Claude Code

- Always run `npm run lint` and `npm test` in `server/` (and `npm test` in `client/` once tests
  exist) before considering a change done.
- Keep new backend code in the existing layered style: Controller → Service → TypeORM
  Repository, with DTOs for all request bodies and guards applied at the controller/route level
  exactly like the existing admin routes.
- When adding the Socket.io bonus, mirror the existing module pattern (a `ChatModule` with its
  own controller/gateway/service/entities) rather than bolting it onto an existing module.
- Don't rename `contrrollers` → `controllers` or fix the `ShippingAddress` casing bug in the same
  commit as unrelated feature work — do those as isolated, easy-to-review commits since they
  touch many import lines.