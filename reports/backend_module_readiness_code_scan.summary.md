# Backend Module Launch-Readiness (Code Scan)

Generated: 2026-02-23T12:42:10.969Z

This report is generated from code only (modules + migrations + tests presence). It does not read any .md/docs.

## Scoring (structure-based heuristic)

Weights: module 10%, controller 15%, service 15%, dto 15%, schema wiring 15%, tests 20%, migrations 10%.

Notes:
- tests: both means both controller + service spec exist; some means at least one spec exists.
- schema wiring means module/service references Mongoose schemas via InjectModel / forFeature / database/schemas import.

## Structurally Complete (100%)

- accounting
- ai-services
- analytics
- auth
- billing
- chat
- cms
- coupons
- crm
- custom-domains
- dashboard
- developer-portal
- domains
- health
- hierarchy
- hrm
- logger
- logs
- marketplace
- metrics
- notifications
- onboarding
- orders
- packages
- payments
- pos
- products
- profile
- projects
- rbac
- reports
- seo
- settings
- social
- support
- tenant
- tenants
- theme
- themes
- user
- users
- vcards
- workspaces

## Validated Green This Session (tests + build run)

- auth
- billing
- custom-domains
- domains
- hierarchy
- logs
- packages
- payments
- profile
- rbac
- reports
- social
- support
- theme
- themes
- notifications
- projects
- dashboard
- onboarding
- hrm
- tenant
- user
- users
- vcards

## All Modules

| Module | Launch % | Missing |
|---|---:|---|
| accounting | 100% | — |
| ai-services | 100% | — |
| analytics | 100% | — |
| auth | 100% | — |
| billing | 100% | — |
| chat | 100% | — |
| cms | 100% | — |
| coupons | 100% | — |
| crm | 100% | — |
| custom-domains | 100% | — |
| dashboard | 100% | — |
| developer-portal | 100% | — |
| domains | 100% | — |
| health | 100% | — |
| hierarchy | 100% | — |
| hrm | 100% | — |
| logger | 100% | — |
| logs | 100% | — |
| marketplace | 100% | — |
| metrics | 100% | — |
| notifications | 100% | — |
| onboarding | 100% | — |
| orders | 100% | — |
| packages | 100% | — |
| payments | 100% | — |
| pos | 100% | — |
| products | 100% | — |
| profile | 100% | — |
| projects | 100% | — |
| rbac | 100% | — |
| reports | 100% | — |
| seo | 100% | — |
| settings | 100% | — |
| social | 100% | — |
| support | 100% | — |
| tenant | 100% | — |
| tenants | 100% | — |
| theme | 100% | — |
| themes | 100% | — |
| user | 100% | — |
| users | 100% | — |
| vcards | 100% | — |
| workspaces | 100% | — |

## Next Targets (lowest first)

- accounting (100%) -> missing: —
- ai-services (100%) -> missing: —
- analytics (100%) -> missing: —
- auth (100%) -> missing: —
- billing (100%) -> missing: —
- chat (100%) -> missing: —
- cms (100%) -> missing: —
- coupons (100%) -> missing: —
- crm (100%) -> missing: —
- custom-domains (100%) -> missing: —
