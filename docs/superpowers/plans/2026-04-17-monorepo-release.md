# Monorepo Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the repo to a monorepo-style layout with one releasable app and release automation that publishes a GHCR Docker image on each release.

**Architecture:** Move the current app into `apps/quiz-gen`, add a workspace root that delegates commands to that app, and mirror the `minecraft-stats` release pattern with `release-please` manifest mode and a dedicated Docker publish job.

**Tech Stack:** npm workspaces, Node.js, GitHub Actions, release-please, Docker, GHCR

---

### Task 1: Introduce the workspace root

**Files:**

- Modify: `.gitignore`
- Modify: `.prettierignore`
- Create: `package.json`

- [ ] Add a root workspace package with root scripts delegating to `apps/quiz-gen`.
- [ ] Expand root ignore rules for workspace outputs and root `node_modules`.

### Task 2: Move the app into `apps/quiz-gen`

**Files:**

- Modify: `apps/quiz-gen/package.json`
- Move existing app config and source files under `apps/quiz-gen`

- [ ] Keep the app build/test/dev scripts working from its new location.
- [ ] Give the app a stable package name for release-please.

### Task 3: Add release-please metadata

**Files:**

- Create: `release-please-config.json`
- Create: `.release-please-manifest.json`

- [ ] Configure one releasable package at `apps/quiz-gen`.
- [ ] Use `quiz-gen` as the release component so tags read `quiz-gen-vX.Y.Z`.

### Task 4: Add workflow and Docker publishing

**Files:**

- Create: `.github/workflows/release-please.yml`
- Create: `Dockerfile.quiz-gen`
- Create: `.dockerignore`

- [ ] Validate the workspace on pushes to `main`.
- [ ] Run release-please after validation.
- [ ] Publish a GHCR image only when a release is created.

### Task 5: Rebuild lockfile and verify

**Files:**

- Modify: `package-lock.json`

- [ ] Run `npm install` at the repo root to rebuild the lockfile for workspaces.
- [ ] Run `npm run lint`, `npm test`, and `npm run build` from the repo root.
