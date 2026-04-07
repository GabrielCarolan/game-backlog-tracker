# Game Backlog Tracker TODO

## High Priority
- [x] Replace hardcoded `CurrentUserId = 1` with real authenticated user identity from JWT claims.
- [x] Add auth endpoints (`register`, `login`) and issue JWTs from the API.
- [x] Protect user log endpoints with `[Authorize]`.
- [x] Protect admin/catalog management with role-based authorization (`Admin`).
- [x] Move JWT key out of `appsettings*.json` into environment variables / user secrets.

## Medium Priority
- [x] Fix User log edit Cancel button bug (`onClick={() => cancelEdit}` -> call `cancelEdit`).
- [x] Add consistent validation rules for log create/update DTOs (especially rating range).
- [x] Centralize API base URL into Vite env config (e.g. `VITE_API_BASE_URL`) instead of hardcoded strings.
- [ ] Add backend integration tests for games CRUD, log CRUD, and auth-protected behavior.
- [ ] Add basic frontend tests for Admin and User flows.

## Backend Integration Test Checklist
- [x] Create `api/GameBacklog.api.Tests` test project.
- [x] Add integration test packages (`Microsoft.AspNetCore.Mvc.Testing`, test SDK, xUnit-related packages).
- [x] Add API test project to the solution/repo test workflow.
- [x] Make `Program` accessible to the test host if needed (for `WebApplicationFactory<Program>`).
- [ ] Create a custom test application factory for booting the API in tests.
- [ ] Replace the production DB registration with an isolated test database configuration.
- [ ] Add shared test data seeding helpers for users, games, and log entries.
- [ ] Add auth test helpers for obtaining/using JWTs in endpoint tests.
- [ ] Add integration tests for `GET /api/games`.
- [ ] Add integration tests for admin-only game create/update/delete endpoints.
- [ ] Add integration tests for unauthenticated access rejection on `/api/log`.
- [ ] Add integration tests for log create/update/delete flows.
- [ ] Add integration tests for validation failures like invalid `rating`.
- [ ] Add integration tests to confirm users cannot modify other users' log entries.
- [ ] Add an auth integration test pass for register/login happy paths.
- [ ] Run the backend integration test suite and fix any setup issues.

## Low Priority / Cleanup
- [ ] Update root `README.md` tech stack (currently says TypeScript + SQL Server, project uses React JS + SQLite).
- [ ] Add setup docs for local dev: run API, run UI, DB migration steps, env vars.
- [ ] Add architecture notes (controllers/stores/EF models + auth flow).
- [ ] Remove stale comments like "coming next" where features are already implemented.

## External Game API Integration (Major Feature)
- [ ] Choose provider (RAWG, IGDB, Giant Bomb, etc.) based on dataset size, pricing, and rate limits.
- [ ] Add provider credentials to environment variables / user secrets (never commit API keys).
- [ ] Create backend service abstraction for external catalog (`IExternalGameCatalogService`) so provider can be swapped later.
- [ ] Implement first provider client with `HttpClient` + typed response mapping.
- [ ] Add backend endpoint(s) for external search (example: `/api/external-games/search?query=`).
- [ ] Normalize external fields into internal DTO shape (`title`, `releaseYear`, `platforms`, `coverUrl`, external ID).
- [ ] Add pagination support for external search results.
- [ ] Add caching/rate-limit protection in backend to avoid provider quota issues.
- [ ] Add error handling for provider outages/timeouts and return clean API errors to UI.
- [ ] Add Admin UI flow: search external catalog -> preview -> import into local `Games` table.
- [ ] Prevent duplicates when importing (match on title + platform + release year or external ID).
- [ ] Add tests for provider mapping, endpoint behavior, and duplicate handling.
- [ ] Document setup and provider-specific configuration in `README.md`.

## Suggested Order
- [x] 1. Auth foundation (register/login + JWT claims + `[Authorize]`)
- [x] 2. Role authorization for admin routes
- [x] 3. Validation hardening and bug fixes
- [ ] 4. Tests (API first, then UI)
- [ ] 5. Documentation refresh

## Notes
- Frontend admin navigation/route gating is implemented, even though the TODO item is phrased as backend role authorization.
