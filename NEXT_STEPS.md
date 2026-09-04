# SkinLab — Prioritized Code Roadmap

Based on the actual repo audit (see CLAUDE.md). Ordered so each phase is small, reviewable on
its own, and unblocks the next one. Hand this to Claude Code a phase at a time rather than all
at once — easier to review, and each phase is a clean commit (or a few).

## Phase 0 — Quick, isolated bug fixes (do first, ~1 commit each)

These are small, low-risk, and worth clearing before anything else touches the same files.

1. Fix the `ShippingAddress` filename-casing bug (rename the entity file or fix the three
   imports so they match exactly) — this is currently a ticking time bomb that only fails on
   case-sensitive filesystems (i.e. most CI/Linux hosting), so it's worth fixing before you ever
   try to deploy or run this in Docker/CI.
2. Add a `RolesGuard` + `@Roles(1)` check (or remove the route if unused) on
   `GET /users/:id` in `users.controller.ts` — right now any logged-in user can pull any other
   user's profile by ID.
3. Delete the dead `IsNoEmpty()` function at the bottom of `createProduct.dto.ts`.

Do these as 2–3 separate small commits, not one big one — they touch unrelated files.

## Phase 1 — Environment & onboarding docs

Nothing to build, just document what already exists. Needed both for you to hand this to a
grader and as raw material for the Project Book's architecture/setup chapters.

4. Add `server/.env.example` listing every env var actually used (`DATABASE_*`, `JWT_SECRET`,
   `JWT_EXPIRATION`, `GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL`, `AWS_REGION/ACCESS_KEY_ID/
   SECRET_ACCESS_KEY/S3_BUCKET_NAME`, `FRONTEND_URL`, `PORT`) with placeholder values.
5. Add a root `README.md` (or one per `client`/`server`) with setup + run instructions. This
   becomes almost directly usable in the Project Book's "folder structure" and "technologies"
   chapters.

## Phase 2 — Tests

This is the biggest visible gap and the one most likely to be checked directly (there are
currently zero real tests in the whole repo).

6. Server unit tests for the riskiest logic first: `auth.service` (register/login happy +
   failure paths), `RolesGuard` (allow/deny), `cart.service` (add/remove/update quantity edge
   cases). Nest + Jest are already configured — just add `*.spec.ts` files next to the services.
7. A couple of e2e tests extending the existing `test/app.e2e-spec.ts` pattern — e.g. register →
   login → hit a protected route without a token (expect 401) → hit an admin route as a regular
   user (expect 403).
8. Client: at least a few `@testing-library/react` tests for `cartContext` and one or two pages
   (e.g. login form validation, product filtering) — the dependency is already installed and
   unused.

## Phase 3 — CI + polish

9. A basic GitHub Actions workflow (`.github/workflows/ci.yml`) running `npm run lint` and
   `npm test` in both `client/` and `server/` on push/PR — cheap to add once Phase 2 exists, and
   demonstrates "basic system security/quality practice" for the grade.
10. Add TypeORM migrations (replacing reliance on `synchronize: false` + manual seeding) so
    schema changes are version-controlled — worth doing before finalizing the Project Book's
    database chapter, since "how the schema evolved" is easy to document once migrations exist.
11. Optional: add `@nestjs/swagger` for auto-generated API docs — makes the architecture chapter
    of the Project Book easier to write and gives you a live reference while building the bonus
    chat feature.

## Phase 4 — Bonus: real-time chat (Socket.io)

Only after the above, since it's optional and the core deliverable (Parts 1 & 2) is what's
actually graded. Suggested shape, mirroring the existing module pattern:

12. `ChatModule` on the server: a `ChatGateway` (Socket.io), a `Message` entity (sender, receiver
    or "admin channel", body, timestamp, read/unread), a `ChatService`, guarded the same way as
    other authenticated routes (`JwtAuthGuard` equivalent for socket handshake).
13. Client: a `ChatContext` + a chat widget component (mirroring `cartContext`/`cartIcon`
    pattern), one view for the user side and one for the admin side (list of conversations).
14. Basic tests for the gateway's auth handshake and message persistence, once Phase 2's testing
    patterns exist to copy from.

---

**Suggested cadence:** do Phase 0 and Phase 1 yourself or with Claude Code in one sitting (they're
small). Then have Claude Code do Phase 2 test-by-test rather than in one giant PR, so you can
actually read and understand each test as it's added — that matters for your ability to defend
the project. Phase 3 and 4 can come later, time permitting.