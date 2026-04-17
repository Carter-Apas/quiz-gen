# Quiz Gen

Monorepo for the Quiz Gen app.

## Structure

- `apps/quiz-gen`: the releasable application
- `docs/`: local design and planning notes

## Scripts

Run these from the repo root:

- `npm run dev`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run format`

## Releases

Releases are managed by `release-please` in manifest mode. When a release is created for `apps/quiz-gen`, GitHub Actions builds and publishes a Docker image to GHCR:

- `ghcr.io/<owner>/quiz-gen:<version>`
- `ghcr.io/<owner>/quiz-gen:latest`
