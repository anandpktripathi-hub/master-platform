# Launch + Earning Completion Matrix (Code-Only, Evidence-Based)

**Generated**: 2026-02-19

**Scan source**: reports/_repo_scan_code_only.json


## Important: What These Percentages Mean
These are **evidence-based completion percentages** computed from the real codebase (controllers/services/DTOs/models/tests, plus route/page heuristics).

They measure: **visible + reachable + implemented surface** — not guaranteed bug-free behavior in production.


## Earning Readiness (Money Loop)
This section is the **real-world monetization loop** score (subscription → payment → webhook → entitlement → invoice → admin control).

**Overall weighted score:** 100% | **Critical-path minimum:** 100%

| Stage | Score | Checks Passed |
|---|---:|---:|
| subscriptions | 100% | 6/6 |
| payments | 100% | 6/6 |
| webhooks | 100% | 6/6 |
| entitlements | 100% | 5/5 |
| invoicing | 100% | 5/5 |
| adminControls | 100% | 6/6 |
| marketplaceReady | 100% | 4/4 |

### Missing / Blockers (Auto-detected)
- None detected by the scanner.

## Backend Modules (Top Summary)
| Module | Evidence % | Launch % | Submodules | API Controllers | API Routes | Avg Route % |
|---|---:|---:|---:|---:|---:|---:|
| settings | 73% | 71% | 3 | 1 | 48 | 85% |
| domains | 70% | 71% | 2 | 1 | 11 | 79% |
| auth | 67% | 71% | 4 | 2 | 14 | 73% |
| themes | 65% | 71% | 4 | 2 | 12 | 68% |
| payments | 60% | 57% | 2 | 2 | 6 | 67% |
| billing | 60% | 57% | 0 | 1 | 9 | 70% |
| notifications | 60% | 57% | 0 | 2 | 4 | 65% |
| crm | 60% | 57% | 0 | 1 | 12 | 70% |
| hierarchy | 57% | 57% | 0 | 6 | 21 | 50% |
| users | 55% | 57% | 1 | 3 | 16 | 76% |
| custom-domains | 55% | 57% | 2 | 2 | 14 | 76% |
| coupons | 55% | 57% | 2 | 1 | 10 | 75% |
| rbac | 55% | 57% | 1 | 1 | 15 | 65% |
| tenants | 55% | 57% | 1 | 1 | 9 | 75% |
| profile | 55% | 57% | 1 | 1 | 8 | 79% |
| packages | 45% | 43% | 1 | 1 | 14 | 74% |
| products | 45% | 43% | 0 | 2 | 3 | 57% |
| accounting | 45% | 43% | 0 | 1 | 24 | 70% |
| ai-services | 45% | 43% | 0 | 1 | 3 | 70% |
| analytics | 45% | 43% | 0 | 1 | 1 | 70% |
| chat | 45% | 43% | 0 | 1 | 8 | 70% |
| dashboard | 45% | 43% | 0 | 1 | 8 | 68% |
| developer-portal | 45% | 43% | 0 | 1 | 6 | 73% |
| hrm | 45% | 43% | 0 | 1 | 13 | 55% |
| logs | 45% | 43% | 0 | 1 | 3 | 70% |
| marketplace | 45% | 43% | 0 | 1 | 5 | 76% |
| onboarding | 45% | 43% | 0 | 1 | 2 | 70% |
| pos | 45% | 43% | 0 | 1 | 5 | 66% |
| projects | 45% | 43% | 0 | 1 | 9 | 57% |
| reports | 45% | 43% | 0 | 1 | 3 | 70% |
| social | 45% | 43% | 0 | 1 | 10 | 70% |
| support | 45% | 43% | 0 | 1 | 4 | 70% |
| theme | 45% | 43% | 0 | 1 | 5 | 70% |
| user | 45% | 43% | 0 | 1 | 5 | 70% |
| vcards | 45% | 43% | 0 | 1 | 5 | 70% |
| cms | 30% | 29% | 0 | 1 | 1 | 30% |
| health | 30% | 29% | 0 | 1 | 1 | 30% |
| orders | 30% | 29% | 0 | 1 | 1 | 30% |
| seo | 30% | 29% | 0 | 1 | 3 | 50% |
| tenant | 30% | 29% | 0 | 1 | 2 | 50% |

## Backend Modules Sorted By Incompleteness (Most Missing First)
Sorted so the **most incomplete modules appear first** (lowest Launch % → lowest Evidence %).

| Module | Launch % | Evidence % | Avg Route % | Missing | Done | Files | Submodules |
|---|---:|---:|---:|---|---|---:|---:|
| cms | 29% | 30% | 30% | Service, DTO, Schema/Entity, Tests, Migrations | Module, Controller | 2 | 0 |
| health | 29% | 30% | 30% | Service, DTO, Schema/Entity, Tests, Migrations | Module, Controller | 2 | 0 |
| orders | 29% | 30% | 30% | Service, DTO, Schema/Entity, Tests, Migrations | Module, Controller | 2 | 0 |
| tenant | 29% | 30% | 50% | Module, DTO, Schema/Entity, Tests, Migrations | Controller, Service | 2 | 0 |
| seo | 29% | 30% | 50% | Service, DTO, Schema/Entity, Tests, Migrations | Module, Controller | 2 | 0 |
| hrm | 43% | 45% | 55% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| products | 43% | 45% | 57% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 4 | 0 |
| projects | 43% | 45% | 57% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| pos | 43% | 45% | 66% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| dashboard | 43% | 45% | 68% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| analytics | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| onboarding | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| ai-services | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| logs | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| reports | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| support | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| theme | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| user | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| vcards | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| chat | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| social | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| accounting | 43% | 45% | 70% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| developer-portal | 43% | 45% | 73% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| packages | 43% | 45% | 74% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 4 | 1 |
| marketplace | 43% | 45% | 76% | DTO, Schema/Entity, Tests, Migrations | Module, Controller, Service | 3 | 0 |
| rbac | 57% | 55% | 65% | Schema/Entity, Tests, Migrations | Module, Controller, Service, DTO | 5 | 1 |
| tenants | 57% | 55% | 75% | Schema/Entity, Tests, Migrations | Module, Controller, Service, DTO | 5 | 1 |
| coupons | 57% | 55% | 75% | Schema/Entity, Tests, Migrations | Module, Controller, Service, DTO | 5 | 2 |
| custom-domains | 57% | 55% | 76% | Schema/Entity, Tests, Migrations | Module, Controller, Service, DTO | 6 | 2 |
| users | 57% | 55% | 76% | Schema/Entity, Tests, Migrations | Module, Controller, Service, DTO | 8 | 1 |
| profile | 57% | 55% | 79% | Schema/Entity, Tests, Migrations | Module, Controller, Service, DTO | 4 | 1 |
| hierarchy | 57% | 57% | 50% | DTO, Tests, Migrations | Module, Controller, Service, Schema/Entity | 14 | 0 |
| notifications | 57% | 60% | 65% | DTO, Schema/Entity, Migrations | Module, Controller, Service, Tests | 6 | 0 |
| payments | 57% | 60% | 67% | DTO, Schema/Entity, Migrations | Module, Controller, Service, Tests | 7 | 2 |
| billing | 57% | 60% | 70% | DTO, Schema/Entity, Migrations | Module, Controller, Service, Tests | 6 | 0 |
| crm | 57% | 60% | 70% | DTO, Schema/Entity, Migrations | Module, Controller, Service, Tests | 5 | 0 |
| themes | 71% | 65% | 68% | Tests, Migrations | Module, Controller, Service, DTO, Schema/Entity | 7 | 4 |
| auth | 71% | 67% | 73% | Tests, Migrations | Module, Controller, Service, DTO, Schema/Entity | 14 | 4 |
| domains | 71% | 70% | 79% | Schema/Entity, Migrations | Module, Controller, Service, DTO, Tests | 9 | 2 |
| settings | 71% | 73% | 85% | Tests, Migrations | Module, Controller, Service, DTO, Schema/Entity | 49 | 3 |

### Focused “Done vs Missing” per module (concise)

**cms** — Launch 29% | Evidence 30% | Avg route 30%
- Done: Module, Controller
- Missing: Service, DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 1 routes, 0 submodules

**health** — Launch 29% | Evidence 30% | Avg route 30%
- Done: Module, Controller
- Missing: Service, DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 1 routes, 0 submodules

**orders** — Launch 29% | Evidence 30% | Avg route 30%
- Done: Module, Controller
- Missing: Service, DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 1 routes, 0 submodules

**tenant** — Launch 29% | Evidence 30% | Avg route 50%
- Done: Controller, Service
- Missing: Module, DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 2 routes, 0 submodules

**seo** — Launch 29% | Evidence 30% | Avg route 50%
- Done: Module, Controller
- Missing: Service, DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 3 routes, 0 submodules

**hrm** — Launch 43% | Evidence 45% | Avg route 55%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 13 routes, 0 submodules

**products** — Launch 43% | Evidence 45% | Avg route 57%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 2 controllers, 3 routes, 0 submodules

**projects** — Launch 43% | Evidence 45% | Avg route 57%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 9 routes, 0 submodules

**pos** — Launch 43% | Evidence 45% | Avg route 66%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 5 routes, 0 submodules

**dashboard** — Launch 43% | Evidence 45% | Avg route 68%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 8 routes, 0 submodules

**analytics** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 1 routes, 0 submodules

**onboarding** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 2 routes, 0 submodules

**ai-services** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 3 routes, 0 submodules

**logs** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 3 routes, 0 submodules

**reports** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 3 routes, 0 submodules

**support** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 4 routes, 0 submodules

**theme** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 5 routes, 0 submodules

**user** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 5 routes, 0 submodules

**vcards** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 5 routes, 0 submodules

**chat** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 8 routes, 0 submodules

**social** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 10 routes, 0 submodules

**accounting** — Launch 43% | Evidence 45% | Avg route 70%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 24 routes, 0 submodules

**developer-portal** — Launch 43% | Evidence 45% | Avg route 73%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 6 routes, 0 submodules

**packages** — Launch 43% | Evidence 45% | Avg route 74%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 14 routes, 1 submodules

**marketplace** — Launch 43% | Evidence 45% | Avg route 76%
- Done: Module, Controller, Service
- Missing: DTO, Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 5 routes, 0 submodules

**rbac** — Launch 57% | Evidence 55% | Avg route 65%
- Done: Module, Controller, Service, DTO
- Missing: Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 15 routes, 1 submodules

**tenants** — Launch 57% | Evidence 55% | Avg route 75%
- Done: Module, Controller, Service, DTO
- Missing: Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 9 routes, 1 submodules

**coupons** — Launch 57% | Evidence 55% | Avg route 75%
- Done: Module, Controller, Service, DTO
- Missing: Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 10 routes, 2 submodules

**custom-domains** — Launch 57% | Evidence 55% | Avg route 76%
- Done: Module, Controller, Service, DTO
- Missing: Schema/Entity, Tests, Migrations
- Surface: 2 controllers, 14 routes, 2 submodules

**users** — Launch 57% | Evidence 55% | Avg route 76%
- Done: Module, Controller, Service, DTO
- Missing: Schema/Entity, Tests, Migrations
- Surface: 3 controllers, 16 routes, 1 submodules

**profile** — Launch 57% | Evidence 55% | Avg route 79%
- Done: Module, Controller, Service, DTO
- Missing: Schema/Entity, Tests, Migrations
- Surface: 1 controllers, 8 routes, 1 submodules

**hierarchy** — Launch 57% | Evidence 57% | Avg route 50%
- Done: Module, Controller, Service, Schema/Entity
- Missing: DTO, Tests, Migrations
- Surface: 6 controllers, 21 routes, 0 submodules

**notifications** — Launch 57% | Evidence 60% | Avg route 65%
- Done: Module, Controller, Service, Tests
- Missing: DTO, Schema/Entity, Migrations
- Surface: 2 controllers, 4 routes, 0 submodules

**payments** — Launch 57% | Evidence 60% | Avg route 67%
- Done: Module, Controller, Service, Tests
- Missing: DTO, Schema/Entity, Migrations
- Surface: 2 controllers, 6 routes, 2 submodules

**billing** — Launch 57% | Evidence 60% | Avg route 70%
- Done: Module, Controller, Service, Tests
- Missing: DTO, Schema/Entity, Migrations
- Surface: 1 controllers, 9 routes, 0 submodules

**crm** — Launch 57% | Evidence 60% | Avg route 70%
- Done: Module, Controller, Service, Tests
- Missing: DTO, Schema/Entity, Migrations
- Surface: 1 controllers, 12 routes, 0 submodules

**themes** — Launch 71% | Evidence 65% | Avg route 68%
- Done: Module, Controller, Service, DTO, Schema/Entity
- Missing: Tests, Migrations
- Surface: 2 controllers, 12 routes, 4 submodules

**auth** — Launch 71% | Evidence 67% | Avg route 73%
- Done: Module, Controller, Service, DTO, Schema/Entity
- Missing: Tests, Migrations
- Surface: 2 controllers, 14 routes, 4 submodules

**domains** — Launch 71% | Evidence 70% | Avg route 79%
- Done: Module, Controller, Service, DTO, Tests
- Missing: Schema/Entity, Migrations
- Surface: 1 controllers, 11 routes, 2 submodules

**settings** — Launch 71% | Evidence 73% | Avg route 85%
- Done: Module, Controller, Service, DTO, Schema/Entity
- Missing: Tests, Migrations
- Surface: 1 controllers, 48 routes, 3 submodules

## Backend Deep Dive (Modules → Submodules → Endpoints)
This section is **modules → submodules → API endpoints**.

Definitions:
- **Evidence %**: do we see controllers/services/DTOs/models/tests (static, heuristic).
- **Launch %**: structural completeness derived from missing artifacts.
- **Avg Route %**: heuristic per-endpoint readiness (guards/DTO/service call/swagger/try-catch).


### backend/src/modules/settings
- Evidence %: **73%**
- Launch %: **71%**
- Files: **49**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist
- Schema/entity exists

**What’s missing / remaining**
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| dto | 14% | 14% | 25 | Module, Controller, Service, Schema/Entity, Tests, Migrations |
| schemas | 10% | 14% | 1 | Module, Controller, Service, DTO, Tests, Migrations |
| mappers | 2% | 0% | 19 | Module, Controller, Service, DTO, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** settings.controller.ts
- File: backend/src/modules/settings/settings.controller.ts
- Base path: (none)
- Routes: 48 | Avg route %: 85%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /admin/settings/basic/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/basic/typed | 85% | swagger, try/catch |
| GET | /admin/settings/application/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/application/typed | 85% | swagger, try/catch |
| GET | /admin/settings/system/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/system/typed | 85% | swagger, try/catch |
| GET | /admin/settings/ui/toggles/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/ui/toggles/typed | 85% | swagger, try/catch |
| GET | /admin/settings/ui/colors/light/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/ui/colors/light/typed | 85% | swagger, try/catch |
| GET | /admin/settings/ui/colors/dark/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/ui/colors/dark/typed | 85% | swagger, try/catch |
| GET | /admin/settings/ui/colors/categories/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/ui/colors/categories/typed | 85% | swagger, try/catch |
| GET | /admin/settings/ui/typography/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/ui/typography/typed | 85% | swagger, try/catch |
| GET | /admin/settings/branding/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/branding/typed | 85% | swagger, try/catch |
| GET | /admin/settings/pages/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/pages/typed | 85% | swagger, try/catch |
| GET | /admin/settings/currency/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/currency/typed | 85% | swagger, try/catch |
| GET | /admin/settings/seo/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/seo/typed | 85% | swagger, try/catch |
| GET | /admin/settings/email/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/email/typed | 85% | swagger, try/catch |
| POST | /admin/settings/email/test | 85% | swagger, try/catch |
| GET | /admin/settings/referral/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/referral/typed | 85% | swagger, try/catch |
| GET | /admin/settings/reports/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/reports/typed | 85% | swagger, try/catch |
| GET | /settings/reports | 85% | swagger, try/catch |
| GET | /admin/settings/payment/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/payment/typed | 85% | swagger, try/catch |
| GET | /admin/settings/integrations/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/integrations/typed | 85% | swagger, try/catch |
| GET | /admin/settings/tracker/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/tracker/typed | 85% | swagger, try/catch |
| GET | /admin/settings/notifications/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/notifications/typed | 85% | swagger, try/catch |
| GET | /admin/settings/zoom/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/zoom/typed | 85% | swagger, try/catch |
| GET | /admin/settings/calendar/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/calendar/typed | 85% | swagger, try/catch |
| GET | /admin/settings/webhooks/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/webhooks/typed | 85% | swagger, try/catch |
| GET | /admin/settings/ip-restriction/typed | 85% | swagger, try/catch |
| PUT | /admin/settings/ip-restriction/typed | 85% | swagger, try/catch |

### backend/src/modules/domains
- Evidence %: **70%**
- Launch %: **71%**
- Files: **9**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist
- Tests exist

**What’s missing / remaining**
- Schema/Entity
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| services | 30% | 29% | 5 | Module, Controller, DTO, Schema/Entity, Migrations |
| dto | 10% | 14% | 2 | Module, Controller, Service, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** domains.controller.ts
- File: backend/src/modules/domains/domains.controller.ts
- Base path: domains
- Routes: 11 | Avg route %: 79%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /domains/me | 85% | swagger, try/catch |
| POST | /domains/me | 85% | swagger, try/catch |
| PATCH | /domains/me/:domainId | 85% | swagger, try/catch |
| POST | /domains/me/:domainId/primary | 70% | dto, swagger, try/catch |
| DELETE | /domains/me/:domainId | 75% | dto, swagger |
| GET | /domains/availability | 75% | dto, swagger |
| GET | /domains | 85% | swagger, try/catch |
| POST | /domains | 85% | swagger, try/catch |
| PATCH | /domains/:domainId | 85% | swagger, try/catch |
| POST | /domains/:domainId/primary | 70% | dto, swagger, try/catch |
| DELETE | /domains/:domainId | 70% | dto, swagger, try/catch |

### backend/src/modules/auth
- Evidence %: **67%**
- Launch %: **71%**
- Files: **14**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist
- Schema/entity exists

**What’s missing / remaining**
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| services | 15% | 14% | 3 | Module, Controller, DTO, Schema/Entity, Tests, Migrations |
| dto | 10% | 14% | 3 | Module, Controller, Service, Schema/Entity, Tests, Migrations |
| schemas | 10% | 14% | 1 | Module, Controller, Service, DTO, Tests, Migrations |
| strategies | 0% | 0% | 1 | Module, Controller, Service, DTO, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** auth.controller.ts
- File: backend/src/modules/auth/auth.controller.ts
- Base path: auth
- Routes: 13 | Avg route %: 75%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /auth/logout | 85% | swagger, try/catch |
| POST | /auth/login | 85% | swagger, try/catch |
| POST | /auth/register | 85% | swagger, try/catch |
| POST | /auth/tenant-register | 85% | swagger, try/catch |
| POST | /auth/send-verification-email | 70% | dto, swagger, try/catch |
| POST | /auth/verify-email | 70% | dto, swagger, try/catch |
| GET | /auth/verify-email | 70% | dto, swagger, try/catch |
| POST | /auth/request-password-reset | 70% | dto, swagger, try/catch |
| POST | /auth/reset-password | 70% | dto, swagger, try/catch |
| GET | /auth/google | 70% | dto, swagger, try/catch |
| GET | /auth/google/callback | 70% | dto, swagger, try/catch |
| GET | /auth/github | 70% | dto, swagger, try/catch |
| GET | /auth/github/callback | 70% | dto, swagger, try/catch |

**Controller:** refresh.controller.ts
- File: backend/src/modules/auth/refresh.controller.ts
- Base path: auth
- Routes: 1 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /auth/refresh | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/themes
- Evidence %: **65%**
- Launch %: **71%**
- Files: **7**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist
- Schema/entity exists

**What’s missing / remaining**
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| controllers | 15% | 14% | 2 | Module, Service, DTO, Schema/Entity, Tests, Migrations |
| services | 15% | 14% | 1 | Module, Controller, DTO, Schema/Entity, Tests, Migrations |
| schemas | 10% | 14% | 2 | Module, Controller, Service, DTO, Tests, Migrations |
| dto | 10% | 14% | 1 | Module, Controller, Service, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** admin-themes.controller.ts
- File: backend/src/modules/themes/controllers/admin-themes.controller.ts
- Base path: admin/themes
- Routes: 7 | Avg route %: 64%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /admin/themes | 85% | swagger, try/catch |
| GET | /admin/themes | 85% | swagger, try/catch |
| GET | /admin/themes/:id | 65% | guards/roles, swagger, try/catch |
| PATCH | /admin/themes/:id | 65% | guards/roles, swagger, try/catch |
| PATCH | /admin/themes/:id/activate | 50% | dto, guards/roles, swagger, try/catch |
| PATCH | /admin/themes/:id/deactivate | 50% | dto, guards/roles, swagger, try/catch |
| DELETE | /admin/themes/:id | 50% | dto, guards/roles, swagger, try/catch |

**Controller:** tenant-themes.controller.ts
- File: backend/src/modules/themes/controllers/tenant-themes.controller.ts
- Base path: tenant/theme
- Routes: 5 | Avg route %: 73%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /tenant/theme | 85% | swagger, try/catch |
| GET | /tenant/theme/css | 85% | swagger, try/catch |
| GET | /tenant/theme/variables | 65% | guards/roles, swagger, try/catch |
| POST | /tenant/theme/select | 65% | guards/roles, swagger, try/catch |
| POST | /tenant/theme/customize | 65% | guards/roles, swagger, try/catch |

### backend/src/modules/payments
- Evidence %: **60%**
- Launch %: **57%**
- Files: **7**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- Tests exist

**What’s missing / remaining**
- DTO
- Schema/Entity
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| services | 30% | 29% | 4 | Module, Controller, DTO, Schema/Entity, Migrations |
| controllers | 15% | 14% | 1 | Module, Service, DTO, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** offline-payments.controller.ts
- File: backend/src/modules/payments/controllers/offline-payments.controller.ts
- Base path: offline-payments
- Routes: 4 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /offline-payments | 70% | dto, swagger, try/catch |
| GET | /offline-payments/me | 70% | dto, swagger, try/catch |
| GET | /offline-payments | 70% | dto, swagger, try/catch |
| PATCH | /offline-payments/:id/status | 70% | dto, swagger, try/catch |

**Controller:** payments.controller.ts
- File: backend/src/modules/payments/payments.controller.ts
- Base path: payments
- Routes: 2 | Avg route %: 60%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /payments/logs | 70% | dto, swagger, try/catch |
| POST | /payments/webhook/paypal/capture | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/billing
- Evidence %: **60%**
- Launch %: **57%**
- Files: **6**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- Tests exist

**What’s missing / remaining**
- DTO
- Schema/Entity
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** billing.controller.ts
- File: backend/src/modules/billing/billing.controller.ts
- Base path: billings
- Routes: 9 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /billings/admin/all | 70% | dto, swagger, try/catch |
| POST | /billings/admin | 70% | dto, swagger, try/catch |
| PATCH | /billings/admin/:id | 70% | dto, swagger, try/catch |
| DELETE | /billings/admin/:id | 70% | dto, swagger, try/catch |
| GET | /billings | 70% | dto, swagger, try/catch |
| GET | /billings/:id | 70% | dto, swagger, try/catch |
| POST | /billings | 70% | dto, swagger, try/catch |
| PUT | /billings/:id | 70% | dto, swagger, try/catch |
| DELETE | /billings/:id | 70% | dto, swagger, try/catch |

### backend/src/modules/notifications
- Evidence %: **60%**
- Launch %: **57%**
- Files: **6**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- Tests exist

**What’s missing / remaining**
- DTO
- Schema/Entity
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** notifications.controller.ts
- File: backend/src/modules/notifications/notifications.controller.ts
- Base path: notifications
- Routes: 2 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /notifications/my | 70% | dto, swagger, try/catch |
| POST | /notifications/mark-all-read | 70% | dto, swagger, try/catch |

**Controller:** push-subscriptions.controller.ts
- File: backend/src/modules/notifications/push-subscriptions.controller.ts
- Base path: notifications/push-subscriptions
- Routes: 2 | Avg route %: 60%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /notifications/push-subscriptions/subscribe | 70% | dto, swagger, try/catch |
| POST | /notifications/push-subscriptions/unsubscribe | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/crm
- Evidence %: **60%**
- Launch %: **57%**
- Files: **5**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- Tests exist

**What’s missing / remaining**
- DTO
- Schema/Entity
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** crm.controller.ts
- File: backend/src/modules/crm/crm.controller.ts
- Base path: crm
- Routes: 12 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /crm/contacts | 70% | dto, swagger, try/catch |
| POST | /crm/contacts | 70% | dto, swagger, try/catch |
| GET | /crm/companies | 70% | dto, swagger, try/catch |
| POST | /crm/companies | 70% | dto, swagger, try/catch |
| GET | /crm/deals | 70% | dto, swagger, try/catch |
| POST | /crm/deals | 70% | dto, swagger, try/catch |
| PATCH | /crm/deals/:id/stage | 70% | dto, swagger, try/catch |
| GET | /crm/tasks/my | 70% | dto, swagger, try/catch |
| POST | /crm/tasks | 70% | dto, swagger, try/catch |
| PATCH | /crm/tasks/:id/completed | 70% | dto, swagger, try/catch |
| PATCH | /crm/tasks/:id/delete | 70% | dto, swagger, try/catch |
| GET | /crm/analytics | 70% | dto, swagger, try/catch |

### backend/src/modules/hierarchy
- Evidence %: **57%**
- Launch %: **57%**
- Files: **14**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- Schema/entity exists

**What’s missing / remaining**
- DTO
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** hierarchy.controller.ts
- File: backend/src/modules/hierarchy/hierarchy.controller.ts
- Base path: hierarchy
- Routes: 6 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /hierarchy | 50% | dto, guards/roles, swagger, try/catch |
| GET | /hierarchy/:id | 50% | dto, guards/roles, swagger, try/catch |
| GET | /hierarchy/:id/children | 50% | dto, guards/roles, swagger, try/catch |
| PATCH | /hierarchy/:id | 50% | dto, guards/roles, swagger, try/catch |
| DELETE | /hierarchy/:id | 50% | dto, guards/roles, swagger, try/catch |
| GET | /hierarchy | 50% | dto, guards/roles, swagger, try/catch |

**Controller:** billing-hierarchy.controller.ts
- File: backend/src/modules/hierarchy/billing-hierarchy.controller.ts
- Base path: billing-hierarchy
- Routes: 3 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /billing-hierarchy/:billingId | 50% | dto, guards/roles, swagger, try/catch |
| GET | /billing-hierarchy/:billingId | 50% | dto, guards/roles, swagger, try/catch |
| DELETE | /billing-hierarchy/:billingId | 50% | dto, guards/roles, swagger, try/catch |

**Controller:** domain-hierarchy.controller.ts
- File: backend/src/modules/hierarchy/domain-hierarchy.controller.ts
- Base path: domain-hierarchy
- Routes: 3 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /domain-hierarchy/:domainId | 50% | dto, guards/roles, swagger, try/catch |
| GET | /domain-hierarchy/:domainId | 50% | dto, guards/roles, swagger, try/catch |
| DELETE | /domain-hierarchy/:domainId | 50% | dto, guards/roles, swagger, try/catch |

**Controller:** package-hierarchy.controller.ts
- File: backend/src/modules/hierarchy/package-hierarchy.controller.ts
- Base path: package-hierarchy
- Routes: 3 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /package-hierarchy/:packageId | 50% | dto, guards/roles, swagger, try/catch |
| GET | /package-hierarchy/:packageId | 50% | dto, guards/roles, swagger, try/catch |
| DELETE | /package-hierarchy/:packageId | 50% | dto, guards/roles, swagger, try/catch |

**Controller:** role-hierarchy.controller.ts
- File: backend/src/modules/hierarchy/role-hierarchy.controller.ts
- Base path: role-hierarchy
- Routes: 3 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /role-hierarchy/:roleName | 50% | dto, guards/roles, swagger, try/catch |
| GET | /role-hierarchy/:roleName | 50% | dto, guards/roles, swagger, try/catch |
| DELETE | /role-hierarchy/:roleName | 50% | dto, guards/roles, swagger, try/catch |

**Controller:** user-hierarchy.controller.ts
- File: backend/src/modules/hierarchy/user-hierarchy.controller.ts
- Base path: user-hierarchy
- Routes: 3 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /user-hierarchy/:userId | 50% | dto, guards/roles, swagger, try/catch |
| GET | /user-hierarchy/:userId | 50% | dto, guards/roles, swagger, try/catch |
| DELETE | /user-hierarchy/:userId | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/users
- Evidence %: **55%**
- Launch %: **57%**
- Files: **8**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist

**What’s missing / remaining**
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| dto | 10% | 14% | 1 | Module, Controller, Service, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** users.controller.ts
- File: backend/src/modules/users/users.controller.ts
- Base path: users
- Routes: 8 | Avg route %: 84%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /users | 95% | try/catch |
| POST | /users/bulk | 95% | try/catch |
| GET | /users/public | 80% | dto, try/catch |
| GET | /users/me | 80% | dto, try/catch |
| GET | /users | 80% | dto, try/catch |
| GET | /users/:id | 80% | dto, try/catch |
| PATCH | /users/:id | 80% | dto, try/catch |
| DELETE | /users/:id | 80% | dto, try/catch |

**Controller:** user.controller.ts
- File: backend/src/modules/users/user.controller.ts
- Base path: users
- Routes: 7 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /users/all | 70% | dto, swagger, try/catch |
| GET | /users | 70% | dto, swagger, try/catch |
| GET | /users/:id | 70% | dto, swagger, try/catch |
| GET | /users/me | 70% | dto, swagger, try/catch |
| POST | /users | 70% | dto, swagger, try/catch |
| PUT | /users/:id | 70% | dto, swagger, try/catch |
| DELETE | /users/:id | 70% | dto, swagger, try/catch |

**Controller:** users.stats.controller.ts
- File: backend/src/modules/users/users.stats.controller.ts
- Base path: users/stats
- Routes: 1 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /users/stats/dashboard | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/custom-domains
- Evidence %: **55%**
- Launch %: **57%**
- Files: **6**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist

**What’s missing / remaining**
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| services | 15% | 14% | 1 | Module, Controller, DTO, Schema/Entity, Tests, Migrations |
| dto | 10% | 14% | 1 | Module, Controller, Service, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** custom-domains.controller.ts
- File: backend/src/modules/custom-domains/custom-domains.controller.ts
- Base path: custom-domains
- Routes: 10 | Avg route %: 79%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /custom-domains/me | 85% | swagger, try/catch |
| POST | /custom-domains/me | 85% | swagger, try/catch |
| POST | /custom-domains/me/:domainId/verify | 70% | dto, swagger, try/catch |
| POST | /custom-domains/me/:domainId/ssl/issue | 70% | dto, swagger, try/catch |
| POST | /custom-domains/me/:domainId/primary | 85% | swagger, try/catch |
| PATCH | /custom-domains/me/:domainId | 85% | swagger, try/catch |
| DELETE | /custom-domains/me/:domainId | 70% | dto, swagger, try/catch |
| GET | /custom-domains | 70% | dto, swagger, try/catch |
| POST | /custom-domains/:domainId/activate | 85% | swagger, try/catch |
| PATCH | /custom-domains/:domainId | 85% | swagger, try/catch |

**Controller:** tenant-domains.controller.ts
- File: backend/src/modules/custom-domains/tenant-domains.controller.ts
- Base path: domains/tenant
- Routes: 4 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /domains/tenant/health-summary | 70% | dto, swagger, try/catch |
| GET | /domains/tenant/list | 70% | dto, swagger, try/catch |
| POST | /domains/tenant/:domainId/verify-dns | 70% | dto, swagger, try/catch |
| POST | /domains/tenant/:domainId/issue-ssl | 70% | dto, swagger, try/catch |

### backend/src/modules/coupons
- Evidence %: **55%**
- Launch %: **57%**
- Files: **5**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist

**What’s missing / remaining**
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| services | 15% | 14% | 1 | Module, Controller, DTO, Schema/Entity, Tests, Migrations |
| dto | 10% | 14% | 2 | Module, Controller, Service, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** coupons.controller.ts
- File: backend/src/modules/coupons/coupons.controller.ts
- Base path: coupons
- Routes: 10 | Avg route %: 75%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /coupons/validate | 70% | dto, swagger, try/catch |
| POST | /coupons/apply | 70% | dto, swagger, try/catch |
| GET | /coupons | 85% | swagger, try/catch |
| POST | /coupons | 85% | swagger, try/catch |
| PATCH | /coupons/:couponId | 85% | swagger, try/catch |
| DELETE | /coupons/:couponId | 70% | dto, swagger, try/catch |
| GET | /coupons/:couponId/usage | 70% | dto, swagger, try/catch |
| POST | /coupons/:couponId/activate | 70% | dto, swagger, try/catch |
| POST | /coupons/:couponId/deactivate | 70% | dto, swagger, try/catch |
| POST | /coupons/bulk-actions/update-status | 70% | dto, swagger, try/catch |

### backend/src/modules/rbac
- Evidence %: **55%**
- Launch %: **57%**
- Files: **5**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist

**What’s missing / remaining**
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| dto | 10% | 14% | 1 | Module, Controller, Service, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** rbac.controller.ts
- File: backend/src/modules/rbac/rbac.controller.ts
- Base path: rbac
- Routes: 15 | Avg route %: 65%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /rbac/check-field-permission | 85% | swagger, try/catch |
| GET | /rbac/permissions | 65% | guards/roles, swagger, try/catch |
| GET | /rbac/permissions/module/:module | 65% | guards/roles, swagger, try/catch |
| POST | /rbac/permissions | 65% | guards/roles, swagger, try/catch |
| POST | /rbac/roles | 65% | guards/roles, swagger, try/catch |
| GET | /rbac/roles | 65% | guards/roles, swagger, try/catch |
| GET | /rbac/roles/:roleId | 65% | guards/roles, swagger, try/catch |
| PUT | /rbac/roles/:roleId | 65% | guards/roles, swagger, try/catch |
| DELETE | /rbac/roles/:roleId | 65% | guards/roles, swagger, try/catch |
| POST | /rbac/users | 65% | guards/roles, swagger, try/catch |
| GET | /rbac/users | 65% | guards/roles, swagger, try/catch |
| PUT | /rbac/users/:userTenantId | 65% | guards/roles, swagger, try/catch |
| DELETE | /rbac/users/:userTenantId | 65% | guards/roles, swagger, try/catch |
| POST | /rbac/users/:userTenantId/reset-password | 65% | guards/roles, swagger, try/catch |
| POST | /rbac/users/:userTenantId/toggle-login | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/tenants
- Evidence %: **55%**
- Launch %: **57%**
- Files: **5**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist

**What’s missing / remaining**
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| dto | 10% | 14% | 2 | Module, Controller, Service, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** tenants.controller.ts
- File: backend/src/modules/tenants/tenants.controller.ts
- Base path: tenants
- Routes: 9 | Avg route %: 75%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /tenants/custom-domains | 70% | dto, swagger, try/catch |
| GET | /tenants/quota | 70% | dto, swagger, try/catch |
| GET | /tenants/me | 85% | swagger, try/catch |
| POST | /tenants/manual-create | 85% | swagger, try/catch |
| PUT | /tenants/public-profile | 85% | swagger, try/catch |
| GET | /tenants/public-directory | 70% | dto, swagger, try/catch |
| GET | /tenants/public/:slug | 70% | dto, swagger, try/catch |
| GET | /tenants/public/:slug/reviews | 70% | dto, swagger, try/catch |
| POST | /tenants/public/:slug/reviews | 70% | dto, swagger, try/catch |

### backend/src/modules/profile
- Evidence %: **55%**
- Launch %: **57%**
- Files: **4**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists
- DTOs exist

**What’s missing / remaining**
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| dto | 10% | 14% | 1 | Module, Controller, Service, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** profile.controller.ts
- File: backend/src/modules/profile/profile.controller.ts
- Base path: (none)
- Routes: 8 | Avg route %: 79%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /me/profile | 85% | swagger, try/catch |
| PUT | /me/profile | 85% | swagger, try/catch |
| GET | /tenant/profile | 85% | swagger, try/catch |
| PUT | /tenant/profile | 85% | swagger, try/catch |
| GET | /me/public-profile | 85% | swagger, try/catch |
| PUT | /me/public-profile | 85% | swagger, try/catch |
| GET | /public/profiles/check-handle | 70% | dto, swagger, try/catch |
| GET | /public/profiles/:handle | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/packages
- Evidence %: **45%**
- Launch %: **43%**
- Files: **4**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
| Submodule | Evidence % | Launch % | Files | Missing |
|---|---:|---:|---:|---|
| services | 15% | 14% | 1 | Module, Controller, DTO, Schema/Entity, Tests, Migrations |

#### API Endpoints (controllers + routes)

**Controller:** packages.controller.ts
- File: backend/src/modules/packages/packages.controller.ts
- Base path: packages
- Routes: 14 | Avg route %: 74%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /packages/features | 70% | dto, swagger, try/catch |
| GET | /packages/me | 70% | dto, swagger, try/catch |
| GET | /packages/me/usage | 70% | dto, swagger, try/catch |
| GET | /packages/me/can-use/:feature | 85% | swagger, try/catch |
| GET | /packages | 85% | swagger, try/catch |
| POST | /packages | 85% | swagger, try/catch |
| PATCH | /packages/:packageId | 85% | swagger, try/catch |
| DELETE | /packages/:packageId | 70% | dto, swagger, try/catch |
| GET | /packages/:packageId | 70% | dto, swagger, try/catch |
| POST | /packages/:packageId/assign | 70% | dto, swagger, try/catch |
| GET | /packages/admin/all | 70% | dto, swagger, try/catch |
| GET | /packages/admin/plan-summary | 70% | dto, swagger, try/catch |
| POST | /packages/admin/subscription-expiry-warnings | 70% | dto, swagger, try/catch |
| POST | /packages/admin/subscription-expire-now | 70% | dto, swagger, try/catch |

### backend/src/modules/products
- Evidence %: **45%**
- Launch %: **43%**
- Files: **4**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** products.controller.ts
- File: backend/src/modules/products/products.controller.ts
- Base path: products
- Routes: 2 | Avg route %: 60%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /products | 60% | dto, guards/roles, try/catch |
| GET | /products/:id | 60% | dto, guards/roles, try/catch |

**Controller:** products.stats.controller.ts
- File: backend/src/modules/products/products.stats.controller.ts
- Base path: products/stats
- Routes: 1 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /products/stats/dashboard | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/accounting
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** accounting.controller.ts
- File: backend/src/modules/accounting/accounting.controller.ts
- Base path: accounting
- Routes: 24 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /accounting/accounts | 70% | dto, swagger, try/catch |
| POST | /accounting/accounts | 70% | dto, swagger, try/catch |
| PUT | /accounting/accounts/:id | 70% | dto, swagger, try/catch |
| DELETE | /accounting/accounts/:id | 70% | dto, swagger, try/catch |
| GET | /accounting/transactions | 70% | dto, swagger, try/catch |
| POST | /accounting/transactions | 70% | dto, swagger, try/catch |
| GET | /accounting/invoices | 70% | dto, swagger, try/catch |
| POST | /accounting/invoices | 70% | dto, swagger, try/catch |
| PUT | /accounting/invoices/:id | 70% | dto, swagger, try/catch |
| DELETE | /accounting/invoices/:id | 70% | dto, swagger, try/catch |
| GET | /accounting/invoices/:id/pdf | 70% | dto, swagger, try/catch |
| GET | /accounting/bills | 70% | dto, swagger, try/catch |
| POST | /accounting/bills | 70% | dto, swagger, try/catch |
| PUT | /accounting/bills/:id | 70% | dto, swagger, try/catch |
| DELETE | /accounting/bills/:id | 70% | dto, swagger, try/catch |
| GET | /accounting/goals | 70% | dto, swagger, try/catch |
| POST | /accounting/goals | 70% | dto, swagger, try/catch |
| PUT | /accounting/goals/:id | 70% | dto, swagger, try/catch |
| DELETE | /accounting/goals/:id | 70% | dto, swagger, try/catch |
| GET | /accounting/summary | 70% | dto, swagger, try/catch |
| GET | /accounting/reports/profit-and-loss | 70% | dto, swagger, try/catch |
| GET | /accounting/reports/balance-sheet | 70% | dto, swagger, try/catch |
| GET | /accounting/reports/profit-and-loss/export | 70% | dto, swagger, try/catch |
| GET | /accounting/reports/balance-sheet/export | 70% | dto, swagger, try/catch |

### backend/src/modules/ai-services
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** ai-services.controller.ts
- File: backend/src/modules/ai-services/ai-services.controller.ts
- Base path: ai
- Routes: 3 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /ai/complete | 70% | dto, swagger, try/catch |
| POST | /ai/sentiment | 70% | dto, swagger, try/catch |
| POST | /ai/suggest | 70% | dto, swagger, try/catch |

### backend/src/modules/analytics
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** analytics.controller.ts
- File: backend/src/modules/analytics/analytics.controller.ts
- Base path: admin/analytics
- Routes: 1 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /admin/analytics/saas-overview | 70% | dto, swagger, try/catch |

### backend/src/modules/chat
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** chat.controller.ts
- File: backend/src/modules/chat/chat.controller.ts
- Base path: chat
- Routes: 8 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /chat/rooms | 70% | dto, swagger, try/catch |
| POST | /chat/rooms | 70% | dto, swagger, try/catch |
| GET | /chat/rooms/:roomId/messages | 70% | dto, swagger, try/catch |
| POST | /chat/rooms/:roomId/messages | 70% | dto, swagger, try/catch |
| POST | /chat/rooms/:roomId/join | 70% | dto, swagger, try/catch |
| GET | /chat/rooms/:roomId/members | 70% | dto, swagger, try/catch |
| PATCH | /chat/admin/rooms/:roomId/archive | 70% | dto, swagger, try/catch |
| DELETE | /chat/admin/rooms/:roomId/members/:userId | 70% | dto, swagger, try/catch |

### backend/src/modules/dashboard
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** dashboard.controller.ts
- File: backend/src/modules/dashboard/dashboard.controller.ts
- Base path: dashboards
- Routes: 8 | Avg route %: 68%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /dashboards/audit/logs | 70% | dto, swagger, try/catch |
| GET | /dashboards/audit/logs/export | 50% | dto, guards/roles, swagger, try/catch |
| GET | /dashboards/admin/saas-overview | 70% | dto, swagger, try/catch |
| GET | /dashboards | 70% | dto, swagger, try/catch |
| GET | /dashboards/:id | 70% | dto, swagger, try/catch |
| POST | /dashboards | 70% | dto, swagger, try/catch |
| PUT | /dashboards/:id | 70% | dto, swagger, try/catch |
| DELETE | /dashboards/:id | 70% | dto, swagger, try/catch |

### backend/src/modules/developer-portal
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** developer-portal.controller.ts
- File: backend/src/modules/developer-portal/developer-portal.controller.ts
- Base path: developer
- Routes: 6 | Avg route %: 73%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /developer/api-keys | 85% | swagger, try/catch |
| GET | /developer/api-keys | 70% | dto, swagger, try/catch |
| POST | /developer/api-keys/:keyId/revoke | 70% | dto, swagger, try/catch |
| DELETE | /developer/api-keys/:keyId | 70% | dto, swagger, try/catch |
| GET | /developer/webhook-logs | 70% | dto, swagger, try/catch |
| GET | /developer/webhook-logs/:logId | 70% | dto, swagger, try/catch |

### backend/src/modules/hrm
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** hrm.controller.ts
- File: backend/src/modules/hrm/hrm.controller.ts
- Base path: hrm
- Routes: 13 | Avg route %: 55%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /hrm/summary | 70% | dto, swagger, try/catch |
| GET | /hrm/attendance/overview | 70% | dto, swagger, try/catch |
| GET | /hrm/employees | 70% | dto, swagger, try/catch |
| POST | /hrm/employees | 50% | dto, guards/roles, swagger, try/catch |
| GET | /hrm/attendance | 50% | dto, guards/roles, swagger, try/catch |
| POST | /hrm/attendance | 50% | dto, guards/roles, swagger, try/catch |
| GET | /hrm/leaves | 50% | dto, guards/roles, swagger, try/catch |
| POST | /hrm/leaves | 50% | dto, guards/roles, swagger, try/catch |
| PATCH | /hrm/leaves/:id/status | 50% | dto, guards/roles, swagger, try/catch |
| GET | /hrm/jobs | 50% | dto, guards/roles, swagger, try/catch |
| POST | /hrm/jobs | 50% | dto, guards/roles, swagger, try/catch |
| GET | /hrm/trainings | 50% | dto, guards/roles, swagger, try/catch |
| POST | /hrm/trainings | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/logs
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** tenant-log.controller.ts
- File: backend/src/modules/logs/tenant-log.controller.ts
- Base path: admin/logs
- Routes: 3 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /admin/logs/tenant/:id | 70% | dto, swagger, try/catch |
| GET | /admin/logs/tenant/:id/events | 70% | dto, swagger, try/catch |
| GET | /admin/logs/tenant/:id/stream | 70% | dto, swagger, try/catch |

### backend/src/modules/marketplace
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** marketplace.controller.ts
- File: backend/src/modules/marketplace/marketplace.controller.ts
- Base path: marketplace
- Routes: 5 | Avg route %: 76%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /marketplace/plugins | 85% | swagger, try/catch |
| POST | /marketplace/install | 85% | swagger, try/catch |
| GET | /marketplace/installs | 70% | dto, swagger, try/catch |
| POST | /marketplace/toggle | 70% | dto, swagger, try/catch |
| DELETE | /marketplace/installs/:pluginId | 70% | dto, swagger, try/catch |

### backend/src/modules/onboarding
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** onboarding.controller.ts
- File: backend/src/modules/onboarding/onboarding.controller.ts
- Base path: onboarding
- Routes: 2 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /onboarding/seed-sample | 70% | dto, swagger, try/catch |
| GET | /onboarding/sample-status | 70% | dto, swagger, try/catch |

### backend/src/modules/pos
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** pos.controller.ts
- File: backend/src/modules/pos/pos.controller.ts
- Base path: pos
- Routes: 5 | Avg route %: 66%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /pos/summary | 70% | dto, swagger, try/catch |
| GET | /pos/stock | 70% | dto, swagger, try/catch |
| POST | /pos/stock/adjust | 70% | dto, swagger, try/catch |
| GET | /pos/orders | 70% | dto, swagger, try/catch |
| POST | /pos/orders | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/projects
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** projects.controller.ts
- File: backend/src/modules/projects/projects.controller.ts
- Base path: projects
- Routes: 9 | Avg route %: 57%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /projects/summary | 70% | dto, swagger, try/catch |
| GET | /projects | 70% | dto, swagger, try/catch |
| POST | /projects | 70% | dto, swagger, try/catch |
| PATCH | /projects/:id | 50% | dto, guards/roles, swagger, try/catch |
| GET | /projects/:projectId/tasks | 50% | dto, guards/roles, swagger, try/catch |
| POST | /projects/:projectId/tasks | 50% | dto, guards/roles, swagger, try/catch |
| PATCH | /projects/tasks/:id | 50% | dto, guards/roles, swagger, try/catch |
| GET | /projects/timesheets | 50% | dto, guards/roles, swagger, try/catch |
| POST | /projects/timesheets/log | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/reports
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** reports.controller.ts
- File: backend/src/modules/reports/reports.controller.ts
- Base path: reports
- Routes: 3 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /reports/tenant/financial | 70% | dto, swagger, try/catch |
| GET | /reports/tenant/commerce | 70% | dto, swagger, try/catch |
| GET | /reports/tenant/traffic | 70% | dto, swagger, try/catch |

### backend/src/modules/social
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** social.controller.ts
- File: backend/src/modules/social/social.controller.ts
- Base path: social
- Routes: 10 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /social/connections/request | 70% | dto, swagger, try/catch |
| PATCH | /social/connections/:id/accept | 70% | dto, swagger, try/catch |
| PATCH | /social/connections/:id/reject | 70% | dto, swagger, try/catch |
| GET | /social/connections/pending | 70% | dto, swagger, try/catch |
| GET | /social/connections/my | 70% | dto, swagger, try/catch |
| POST | /social/posts | 70% | dto, swagger, try/catch |
| GET | /social/feed | 70% | dto, swagger, try/catch |
| PATCH | /social/posts/:id/like | 70% | dto, swagger, try/catch |
| POST | /social/posts/:id/comments | 70% | dto, swagger, try/catch |
| GET | /social/posts/:id/comments | 70% | dto, swagger, try/catch |

### backend/src/modules/support
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** support.controller.ts
- File: backend/src/modules/support/support.controller.ts
- Base path: support
- Routes: 4 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| POST | /support/tickets | 70% | dto, swagger, try/catch |
| GET | /support/tickets | 70% | dto, swagger, try/catch |
| GET | /support/admin/tickets | 70% | dto, swagger, try/catch |
| PATCH | /support/admin/tickets/:id/status | 70% | dto, swagger, try/catch |

### backend/src/modules/theme
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** theme.controller.ts
- File: backend/src/modules/theme/theme.controller.ts
- Base path: themes
- Routes: 5 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /themes | 70% | dto, swagger, try/catch |
| GET | /themes/:id | 70% | dto, swagger, try/catch |
| POST | /themes | 70% | dto, swagger, try/catch |
| PUT | /themes/:id | 70% | dto, swagger, try/catch |
| DELETE | /themes/:id | 70% | dto, swagger, try/catch |

### backend/src/modules/user
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** user.controller.ts
- File: backend/src/modules/user/user.controller.ts
- Base path: users
- Routes: 5 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /users | 70% | dto, swagger, try/catch |
| GET | /users/:id | 70% | dto, swagger, try/catch |
| POST | /users | 70% | dto, swagger, try/catch |
| PUT | /users/:id | 70% | dto, swagger, try/catch |
| DELETE | /users/:id | 70% | dto, swagger, try/catch |

### backend/src/modules/vcards
- Evidence %: **45%**
- Launch %: **43%**
- Files: **3**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** vcards.controller.ts
- File: backend/src/modules/vcards/vcards.controller.ts
- Base path: (none)
- Routes: 5 | Avg route %: 70%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /vcards | 70% | dto, swagger, try/catch |
| POST | /vcards | 70% | dto, swagger, try/catch |
| PUT | /vcards/:id | 70% | dto, swagger, try/catch |
| DELETE | /vcards/:id | 70% | dto, swagger, try/catch |
| GET | /public/vcards/:id | 70% | dto, swagger, try/catch |

### backend/src/modules/cms
- Evidence %: **30%**
- Launch %: **29%**
- Files: **2**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists

**What’s missing / remaining**
- Service
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** cms.menu.controller.ts
- File: backend/src/modules/cms/cms.menu.controller.ts
- Base path: cms/menu
- Routes: 1 | Avg route %: 30%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /cms/menu | 30% | service-call, dto, guards/roles, swagger, try/catch |

### backend/src/modules/health
- Evidence %: **30%**
- Launch %: **29%**
- Files: **2**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists

**What’s missing / remaining**
- Service
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** health.controller.ts
- File: backend/src/modules/health/health.controller.ts
- Base path: health
- Routes: 1 | Avg route %: 30%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /health | 30% | service-call, dto, guards/roles, swagger, try/catch |

### backend/src/modules/orders
- Evidence %: **30%**
- Launch %: **29%**
- Files: **2**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists

**What’s missing / remaining**
- Service
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** orders.stats.controller.ts
- File: backend/src/modules/orders/orders.stats.controller.ts
- Base path: orders/stats
- Routes: 1 | Avg route %: 30%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /orders/stats/dashboard | 30% | service-call, dto, guards/roles, swagger, try/catch |

### backend/src/modules/seo
- Evidence %: **30%**
- Launch %: **29%**
- Files: **2**

**What’s done (verified)**
- Nest module wiring exists
- Controller layer exists

**What’s missing / remaining**
- Service
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** seo.controller.ts
- File: backend/src/modules/seo/seo.controller.ts
- Base path: seo
- Routes: 3 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /seo/tenants/:slug/robots.txt | 50% | dto, guards/roles, swagger, try/catch |
| GET | /seo/tenants/:slug/sitemap.xml | 50% | dto, guards/roles, swagger, try/catch |
| GET | /seo/tenants/:slug/feed.xml | 50% | dto, guards/roles, swagger, try/catch |

### backend/src/modules/tenant
- Evidence %: **30%**
- Launch %: **29%**
- Files: **2**

**What’s done (verified)**
- Controller layer exists
- Service layer exists

**What’s missing / remaining**
- Module
- DTO
- Schema/Entity
- Tests
- Migrations

#### Submodules (immediate subfolders)
—

#### API Endpoints (controllers + routes)

**Controller:** tenant.controller.ts
- File: backend/src/modules/tenant/tenant.controller.ts
- Base path: tenants
- Routes: 2 | Avg route %: 50%

| Method | Path | Route % | Missing Evidence |
|---|---|---:|---|
| GET | /tenants | 50% | dto, guards/roles, swagger, try/catch |
| POST | /tenants | 50% | dto, guards/roles, swagger, try/catch |

## Frontend Deep Dive (Pages → Visibility/Workability)
This section is **frontend pages → visibility/workability evidence**.

Definitions:
- **Page %**: file exists (base), + referenced in router (visible), + API calls (workable), + forms (interactive).

### Router Surface
- Router file: C:/Users/annes/Desktop/smetasc-saas-multi-tenancy-app/frontend/src/router.tsx
- Route paths detected: 0

### Pages (each individually)
| Page | Page % | Visible in Router | Has API Calls | Has Forms | File |
|---|---:|---:|---:|---:|---|
| AiToolsPage | 100% | Yes | Yes | Yes | frontend/src/pages/AiToolsPage.tsx |
| DeveloperPortalPage | 100% | Yes | Yes | Yes | frontend/src/pages/developer/DeveloperPortalPage.tsx |
| ForgotPassword | 100% | Yes | Yes | Yes | frontend/src/pages/ForgotPassword.tsx |
| ManageRoles | 100% | Yes | Yes | Yes | frontend/src/pages/ManageRoles.tsx |
| ManageUsers | 100% | Yes | Yes | Yes | frontend/src/pages/ManageUsers.tsx |
| PackagesPage | 100% | Yes | Yes | Yes | frontend/src/pages/packages/PackagesPage.tsx |
| ResetPassword | 100% | Yes | Yes | Yes | frontend/src/pages/ResetPassword.tsx |
| AccountingDashboard | 90% | Yes | Yes | No | frontend/src/pages/AccountingDashboard.tsx |
| ActivityFeedPage | 90% | Yes | Yes | No | frontend/src/pages/ActivityFeedPage.tsx |
| AdminBillingAnalyticsPage | 90% | Yes | Yes | No | frontend/src/pages/admin/AdminBillingAnalyticsPage.tsx |
| AdminDomainsPage | 90% | Yes | Yes | No | frontend/src/pages/admin/AdminDomainsPage.tsx |
| AdminInvoicesPage | 90% | Yes | Yes | No | frontend/src/pages/admin/AdminInvoicesPage.tsx |
| AdminNavigationMapPage | 90% | Yes | Yes | No | frontend/src/pages/admin/AdminNavigationMapPage.tsx |
| AdminSupportTickets | 90% | Yes | Yes | No | frontend/src/pages/AdminSupportTickets.tsx |
| AdvancedSettings | 90% | Yes | Yes | No | frontend/src/pages/AdvancedSettings.tsx |
| AffiliateDashboard | 90% | Yes | Yes | No | frontend/src/pages/AffiliateDashboard.tsx |
| ApiDocsPage | 90% | Yes | Yes | No | frontend/src/pages/ApiDocsPage.tsx |
| AuditLogs | 90% | Yes | Yes | No | frontend/src/pages/dashboard/AuditLogs.tsx |
| BillingDashboard | 90% | Yes | Yes | No | frontend/src/pages/BillingDashboard.tsx |
| BillingPaypalReturn | 90% | Yes | Yes | No | frontend/src/pages/BillingPaypalReturn.tsx |
| BusinessDirectory | 90% | Yes | Yes | No | frontend/src/pages/BusinessDirectory.tsx |
| BusinessProfilePublicView | 90% | Yes | Yes | No | frontend/src/pages/BusinessProfilePublicView.tsx |
| CmsAnalyticsPage | 90% | Yes | Yes | No | frontend/src/pages/cms/CmsAnalyticsPage.tsx |
| CmsMenuManagement | 90% | Yes | Yes | No | frontend/src/pages/dashboard/CmsMenuManagement.tsx |
| CmsSeoAuditPage | 90% | Yes | Yes | No | frontend/src/pages/cms/CmsSeoAuditPage.tsx |
| CompanySettings | 90% | Yes | Yes | No | frontend/src/pages/CompanySettings.tsx |
| ConnectionRequestsPage | 90% | Yes | Yes | No | frontend/src/pages/ConnectionRequestsPage.tsx |
| CrmAnalyticsPage | 90% | Yes | Yes | No | frontend/src/pages/CrmAnalyticsPage.tsx |
| CrmCompaniesPage | 90% | Yes | Yes | No | frontend/src/pages/CrmCompaniesPage.tsx |
| CrmContactsPage | 90% | Yes | Yes | No | frontend/src/pages/CrmContactsPage.tsx |
| CrmDealsPage | 90% | Yes | Yes | No | frontend/src/pages/CrmDealsPage.tsx |
| CrmKanbanPage | 90% | Yes | Yes | No | frontend/src/pages/CrmKanbanPage.tsx |
| CrmMyTasksPage | 90% | Yes | Yes | No | frontend/src/pages/CrmMyTasksPage.tsx |
| CustomDomains | 90% | Yes | Yes | No | frontend/src/pages/dashboard/CustomDomains.tsx |
| Dashboard | 90% | Yes | Yes | No | frontend/src/pages/Dashboard.tsx |
| DomainListPage | 90% | Yes | Yes | No | frontend/src/pages/domains/DomainListPage.tsx |
| Invoices | 90% | Yes | Yes | No | frontend/src/pages/Invoices.tsx |
| MarketplacePage | 90% | Yes | Yes | No | frontend/src/pages/marketplace/MarketplacePage.tsx |
| MyConnectionsPage | 90% | Yes | Yes | No | frontend/src/pages/MyConnectionsPage.tsx |
| NotificationCenterPage | 90% | Yes | Yes | No | frontend/src/pages/NotificationCenterPage.tsx |
| Onboarding | 90% | Yes | Yes | No | frontend/src/pages/Onboarding.tsx |
| PackageFeatures | 90% | Yes | Yes | No | frontend/src/pages/dashboard/PackageFeatures.tsx |
| PaymentLogsPage | 90% | Yes | Yes | No | frontend/src/pages/admin/PaymentLogsPage.tsx |
| PlatformOverviewDashboard | 90% | Yes | Yes | No | frontend/src/pages/admin/PlatformOverviewDashboard.tsx |
| ProfilePublicEdit | 90% | Yes | Yes | No | frontend/src/pages/ProfilePublicEdit.tsx |
| ProfileSettings | 90% | Yes | Yes | No | frontend/src/pages/ProfileSettings.tsx |
| PublicUserProfileView | 90% | Yes | Yes | No | frontend/src/pages/PublicUserProfileView.tsx |
| SeoToolsPage | 90% | Yes | Yes | No | frontend/src/pages/SeoToolsPage.tsx |
| SignupWizard | 90% | Yes | Yes | No | frontend/src/pages/SignupWizard.tsx |
| SupportTickets | 90% | Yes | Yes | No | frontend/src/pages/SupportTickets.tsx |
| SystemHealthPage | 90% | Yes | Yes | No | frontend/src/pages/dashboard/SystemHealthPage.tsx |
| TeamChatPage | 90% | Yes | Yes | No | frontend/src/pages/TeamChatPage.tsx |
| TenantDomainHealthPage | 90% | Yes | Yes | No | frontend/src/pages/domains/TenantDomainHealthPage.tsx |
| TenantQuotaUsage | 90% | Yes | Yes | No | frontend/src/pages/dashboard/TenantQuotaUsage.tsx |
| Tenants | 90% | Yes | Yes | No | frontend/src/pages/admin/Tenants.tsx |
| UiSettings | 90% | Yes | Yes | No | frontend/src/pages/UiSettings.tsx |
| VerifyEmail | 90% | Yes | Yes | No | frontend/src/pages/VerifyEmail.tsx |
| BillingStripeCheckoutPage | 80% | Yes | No | Yes | frontend/src/pages/BillingStripeCheckoutPage.tsx |
| Login | 80% | Yes | No | Yes | frontend/src/pages/Login.tsx |
| AdminThemesPage | 70% | Yes | No | No | frontend/src/pages/admin/AdminThemesPage.tsx |
| CmsPageBuilder | 70% | Yes | No | No | frontend/src/pages/CmsPageBuilder.tsx |
| CustomDomainRequestModal | 70% | No | Yes | Yes | frontend/src/pages/domains/CustomDomainRequestModal.tsx |
| DomainCreateModal | 70% | No | Yes | Yes | frontend/src/pages/domains/DomainCreateModal.tsx |
| HierarchyManagement | 70% | Yes | No | No | frontend/src/pages/HierarchyManagement.tsx |
| HrmDashboard | 70% | Yes | No | No | frontend/src/pages/HrmDashboard.tsx |
| LandingPage | 70% | Yes | No | No | frontend/src/pages/LandingPage.tsx |
| PosDashboard | 70% | Yes | No | No | frontend/src/pages/PosDashboard.tsx |
| ProjectsDashboard | 70% | Yes | No | No | frontend/src/pages/ProjectsDashboard.tsx |
| Register | 70% | No | Yes | Yes | frontend/src/pages/Register.tsx |
| TenantThemeCustomizerPage | 70% | Yes | No | No | frontend/src/pages/app/theme/TenantThemeCustomizerPage.tsx |
| TenantThemeCustomizerPage | 70% | Yes | No | No | frontend/src/pages/tenant/TenantThemeCustomizerPage.tsx |
| TenantThemeSelectorPage | 70% | Yes | No | No | frontend/src/pages/app/theme/TenantThemeSelectorPage.tsx |
| TenantThemeSelectorPage | 70% | Yes | No | No | frontend/src/pages/tenant/TenantThemeSelectorPage.tsx |
| VcardPublicView | 70% | Yes | No | No | frontend/src/pages/VcardPublicView.tsx |
| VcardsManager | 70% | Yes | No | No | frontend/src/pages/VcardsManager.tsx |
| AuditLogViewer | 60% | No | Yes | No | frontend/src/pages/admin/AuditLogViewer.tsx |
| PlanManager | 60% | No | Yes | No | frontend/src/pages/admin/PlanManager.tsx |
| Pricing | 60% | No | Yes | No | frontend/src/pages/Pricing.tsx |
| Settings | 60% | No | Yes | No | frontend/src/pages/Settings.tsx |
| billingService | 40% | No | No | No | frontend/src/pages/services/billingService.ts |
| CurrentPlanCard | 40% | No | No | No | frontend/src/pages/packages/CurrentPlanCard.tsx |
| index | 40% | No | No | No | frontend/src/pages/admin/index.tsx |
| NotAuthorized | 40% | No | No | No | frontend/src/pages/NotAuthorized.tsx |
| Users | 40% | No | No | No | frontend/src/pages/Users.tsx |

### What’s typically missing for “real-world accessible + executable”
- E2E tests verifying login → navigate → pay → entitlement → invoice download flows
- A route-by-route RBAC matrix (which roles can access which pages/endpoints) validated in runtime
- Production config validation (CORS origins, cookies, secure headers) verified by running behind HTTPS
- Error states + retry handling for all API calls (timeouts, 401/403, 5xx)