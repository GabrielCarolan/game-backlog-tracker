# Game Backlog Tracker TODO

## High Priority
- [ ] Replace hardcoded `CurrentUserId = 1` with real authenticated user identity from JWT claims.
- [ ] Add auth endpoints (`register`, `login`) and issue JWTs from the API.
- [ ] Protect user log endpoints with `[Authorize]`.
- [ ] Protect admin/catalog management with role-based authorization (`Admin`).
- [ ] Move JWT key out of `appsettings*.json` into environment variables / user secrets.

## Medium Priority
- [ ] Fix User log edit Cancel button bug (`onClick={() => cancelEdit}` -> call `cancelEdit`).
- [ ] Add consistent validation rules for log create/update DTOs (especially rating range).
- [ ] Centralize API base URL into Vite env config (e.g. `VITE_API_BASE_URL`) instead of hardcoded strings.
- [ ] Add backend integration tests for games CRUD, log CRUD, and auth-protected behavior.
- [ ] Add basic frontend tests for Admin and User flows.

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
- [ ] 1. Auth foundation (register/login + JWT claims + `[Authorize]`)
- [ ] 2. Role authorization for admin routes
- [ ] 3. Validation hardening and bug fixes
- [ ] 4. Tests (API first, then UI)
- [ ] 5. Documentation refresh

## Auth Questions (For Next Session)
- [ ] Why this? and what is it doing?: `builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();`
- [ ] Full `IPasswordHasher` explanation is needed.
- [ ] What is the `IConfiguration config` for?
- [ ] JWT explanation needed: `GenerateJwt(user)` and all related JWT concepts.
