# Documentation Migration Map

This file maps documentation-like files into the consolidated `docs/` tree.

| From | To | Note |
|---|---|---|
| `README.md` | `docs/README.md` | Moved (repo entrypoint now under `docs/`) |
| `docs/README.md` | `docs/README-docs.md` | Renamed to avoid collision |
| `backend/README.md` | `docs/backend/README.md` | Moved |
| `frontend/README.md` | `docs/frontend/README.md` | Moved (replaced empty placeholder) |
| `frontend/EXTENSIBILITY.md` | `docs/frontend/EXTENSIBILITY.md` | Moved |
| `scripts/README.md` | `docs/scripts/README.md` | Moved |
| `test/test-full-scan.txt` | `docs/testing/test-full-scan.txt` | Moved |
| `reference-code/reference-code-full-scan.txt` | `docs/reference/reference-code-full-scan.txt` | Moved |
| `# Code Citations.md` | `docs/reference/# Code Citations.md` | Moved |
| `ZERO_ERROR_SETUP.md` | `docs/setup/ZERO_ERROR_SETUP.md` | Moved |
| `CODE_QUALITY_FIXES_SUMMARY.md` | `docs/reports/CODE_QUALITY_FIXES_SUMMARY.md` | Moved |
| `MASTER_BACKEND_BUILD_FIX_REPORT.txt` | `docs/reports/MASTER_BACKEND_BUILD_FIX_REPORT.txt` | Moved |
| `MASTER_BACKEND_ERROR_AND_ISSUE_REPORT.md` | `docs/reports/MASTER_BACKEND_ERROR_AND_ISSUE_REPORT.md` | Moved |
| `MASTER_BACKEND_FIX_AND_WARNING_REPORT.md` | `docs/reports/MASTER_BACKEND_FIX_AND_WARNING_REPORT.md` | Moved |
| `MASTER_CODEBASE_FEATURE_MAP.md` | `docs/reports/MASTER_CODEBASE_FEATURE_MAP.md` | Moved |
| `MASTER_FEATURE_HIERARCHY_REPORT.md` | `docs/reports/MASTER_FEATURE_HIERARCHY_REPORT.md` | Moved |
| `MASTER_FIX_REPORT.md` | `docs/reports/MASTER_FIX_REPORT.md` | Moved |
| `PRODUCTION_DEPLOYMENT_CHECKLIST.md` | `docs/deployment/PRODUCTION_DEPLOYMENT_CHECKLIST-root.md` | Moved (was untracked) |
| `nexelit_docs_tree.md` | `docs/reference/nexelit_docs_tree.md` | Moved (was untracked) |

Notes:
- `docs/frontend/README.md` previously existed but was empty; it was replaced by the migrated content.
