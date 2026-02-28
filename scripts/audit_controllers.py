from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKEND_SRC = ROOT / "backend" / "src"


@dataclass(frozen=True)
class AuditResult:
    path: Path
    has_logger: bool
    has_try_catch: bool
    has_api_operation: bool
    has_api_response: bool
    has_required_statuses: bool
    has_access_control: bool


STATUS_RE = re.compile(r"status\s*:\s*(\d+)")


def audit_file(path: Path) -> AuditResult:
    text = path.read_text(encoding="utf-8", errors="replace")

    has_logger = "Logger" in text and "new Logger" in text
    has_try_catch = "try {" in text
    has_api_operation = "@ApiOperation" in text
    has_api_response = "@ApiResponse" in text

    statuses = {int(m.group(1)) for m in STATUS_RE.finditer(text)}
    # Treat 200/201 as success signal; require 400/401/403/500 to be documented somewhere in file.
    has_required_statuses = (200 in statuses or 201 in statuses) and {400, 401, 403, 500}.issubset(
        statuses
    )

    has_access_control = ("@UseGuards" in text) or ("@Public" in text)

    return AuditResult(
        path=path,
        has_logger=has_logger,
        has_try_catch=has_try_catch,
        has_api_operation=has_api_operation,
        has_api_response=has_api_response,
        has_required_statuses=has_required_statuses,
        has_access_control=has_access_control,
    )


def main() -> int:
    controller_files = sorted(BACKEND_SRC.rglob("*.controller.ts"))

    failing: list[AuditResult] = []
    for f in controller_files:
        # Skip tiny re-export shims (no actual class)
        text = f.read_text(encoding="utf-8", errors="replace")
        if "export class" not in text:
            continue
        failing.append(audit_file(f))

    # Filter to only those missing something.
    failing = [
        r
        for r in failing
        if not (
            r.has_logger
            and r.has_try_catch
            and r.has_api_operation
            and r.has_api_response
            and r.has_required_statuses
            and r.has_access_control
        )
    ]

    print(f"Found {len(controller_files)} controller files (real controllers: {len(controller_files) - sum(1 for f in controller_files if 'export class' not in f.read_text(encoding='utf-8', errors='replace'))}).")
    print(f"Controllers needing work (heuristic): {len(failing)}\n")

    for r in failing:
        missing: list[str] = []
        if not r.has_logger:
            missing.append("logger")
        if not r.has_try_catch:
            missing.append("try/catch")
        if not r.has_api_operation:
            missing.append("ApiOperation")
        if not r.has_api_response:
            missing.append("ApiResponse")
        if not r.has_required_statuses:
            missing.append("status set")
        if not r.has_access_control:
            missing.append("access control")

        rel = r.path.relative_to(ROOT).as_posix()
        print(f"- {rel}: missing {', '.join(missing)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
