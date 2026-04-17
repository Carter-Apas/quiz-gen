# Monorepo Release Design

**Date:** 2026-04-17

## Summary

Restructure the repo into a monorepo layout with a single releasable app at `apps/quiz-gen`, then add a `release-please` workflow modeled on `minecraft-stats`. Each merged release will publish one GitHub Release and one GHCR Docker image for the app.

## Decision

- Move the current app into `apps/quiz-gen`.
- Use an npm workspace root with root scripts delegating to the app workspace.
- Use `release-please` manifest mode with one package entry: `apps/quiz-gen`.
- Publish one image: `ghcr.io/<owner>/quiz-gen:<version>` and `latest`.

## Why

This preserves the current deployment model, where the frontend and backend ship together, while still giving the repo the same release automation shape as `minecraft-stats`.

## Scope

- Create root workspace configuration.
- Move app files under `apps/quiz-gen`.
- Add `release-please` config and workflow.
- Add a Dockerfile for the releasable app.
- Keep existing runtime behavior and local commands available from the repo root.
