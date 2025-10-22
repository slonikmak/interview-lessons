<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: New principles established
	• Principle 1: Code Quality (MVP‑first)
	• Principle 2: Testing Standards (Acceptance‑driven MVP)
	• Principle 3: User Experience Consistency
	• Principle 4: Performance Baselines (MVP)
- Added sections:
	• Scope and MVP Discipline
	• Development Workflow and Quality Gates
- Removed sections:
	• Template placeholder for a fifth principle
- Templates requiring updates:
	• .specify/templates/plan-template.md — ✅ updated (fixed prompt reference path)
	• .specify/templates/spec-template.md — ✅ reviewed (no change required)
	• .specify/templates/tasks-template.md — ✅ updated (tests policy aligned with constitution)
	• .specify/templates/commands/*.md — ⚠ not present in repo (skipped)
- Follow-up TODOs:
	• None
-->

# Interview Lessons Constitution

## Core Principles

### I. Code Quality (MVP‑first)

- Keep scope minimal: implement only what’s required to deliver the P1 MVP slice.
- Enforce formatting and linting; fix violations before merge.
- Prefer small, single‑responsibility modules with clear interfaces.
- Pin language/runtime versions; use static typing where available and practical.
- Document public interfaces with concise comments or docstrings; remove dead code.
- Reviews: at least one reviewer approval required for P1/MVP changes.

Rationale: High quality with minimal surface area reduces rework and speeds up
iteration. MVP‑first quality focuses on correctness and clarity over breadth.

### II. Testing Standards (Acceptance‑driven MVP)

- Each P1 user story MUST have at least one acceptance/integration test that
	demonstrates end‑to‑end value. This is a release gate for MVP.
- Critical pure logic MUST have unit tests; edge cases documented and covered.
- Tests MUST be deterministic and isolated; stub/mock external dependencies.
- CI MUST run the test suite on every PR to the main branch.
- Flaky tests MUST be fixed or quarantined before merge with a tracked owner.
- Red‑Green‑Refactor is encouraged: write tests before or alongside code.

Rationale: Acceptance tests define “done” for MVP and protect core value paths.

### III. User Experience Consistency

- Use a minimal design system: shared typography scale, spacing units, and a
	primary/secondary color palette. Reuse components rather than duplicating.
- Accessibility baseline: contrast ratio ≥ 4.5:1, keyboard navigation for
	primary flows, alt text for meaningful imagery.
- Responsive baseline: layouts remain usable at widths ≥ 320px.
- Error handling: clear, friendly messages and inline validation on forms.
- Copy tone: simple and concise; avoid jargon.

Rationale: Consistency and accessibility ensure a usable MVP that users can
understand and succeed with, even when feature breadth is limited.

### IV. Performance Baselines (MVP)

- Web UI: LCP ≤ 2.5s on throttled “Fast 3G” and mid‑tier device; TTI ≤ 3.0s.
- JavaScript budget: initial route bundle ≤ 200KB gzipped for MVP pages.
- Backend/API (if applicable): p95 latency ≤ 300ms in dev‑like benchmarks;
	avoid N+1 patterns; prefer pagination/limits for list endpoints.
- Avoid long main‑thread tasks (>50ms). Use async/defer and incremental work.
- Measure via Web Vitals/Lighthouse locally or in CI; document results in PRs.

Rationale: Lightweight performance targets keep MVP snappy without premature
optimization.

## Scope and MVP Discipline

- Deliver value in vertical slices (P1 → P2 → P3). Defer “nice‑to‑haves” to
	backlog unless required to meet principles above.
- Prefer a simple architecture (monolith/modules) over microservices for MVP.
- Minimize configuration; choose sensible defaults. Avoid over‑engineering.
- Exceptions to principles MUST be time‑boxed with an owner and expiry.

## Development Workflow and Quality Gates

- Constitution Check: Each PR and plan/spec MUST state how it satisfies the
	four core principles; include explicit links to acceptance tests (for P1).
- Pre‑merge gates (automated where possible):
	• Lint/format pass
	• Tests pass with required acceptance coverage for P1
	• Performance notes for UI changes (budget respected) or rationale
	• UX checklist: accessibility basics, responsive baseline, consistent tokens
- Decision log: If a trade‑off conflicts with a principle, document rationale,
	owner, and a follow‑up task to reconcile.

## Governance

- Authority: This constitution guides technical decisions and implementation
	choices. Where conventions conflict, this document wins for MVP delivery.
- Decision application: Designs, plans, and PRs MUST reference relevant
	principles explicitly and demonstrate compliance (or documented exceptions).
- Amendments: Propose a PR updating `.specify/memory/constitution.md` with a
	Sync Impact Report and template alignment notes. Approval by repository owner
	or a designated maintainer is required.
- Versioning: Semantic versioning applies to this document.
	• MAJOR: Remove or redefine principles incompatibly
	• MINOR: Add a new principle/section or materially expand guidance
	• PATCH: Clarifications and non‑semantic wording fixes
- Compliance reviews: Run at MVP readiness and before major milestones. Non‑
	compliance MUST be resolved or explicitly excepted with expiry.

**Version**: 1.0.0 | **Ratified**: 2025-10-22 | **Last Amended**: 2025-10-22
