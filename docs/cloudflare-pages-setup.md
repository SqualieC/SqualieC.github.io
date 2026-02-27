# Cloudflare Deployment Setup

This repo builds a static Astro site and then uploads the built `dist` directory as Cloudflare static assets.

## Build + Deploy Values

Use these exact values:

- Production branch: `main`
- Root directory: `/`
- Build command: `npm run build:search`
- Deploy command: `npm run cf:deploy`
- Node.js version: `22`

`npm run cf:deploy` runs:

- `npx wrangler deploy --config wrangler.jsonc`

## Required Files In Repo Root

- `wrangler.jsonc` with:
  - `name`
  - `compatibility_date`
  - `assets.directory = "./dist"`

## Local Verification Before Cloudflare

- Dev server: `npm run dev`
- LAN dev server: `npm run dev:host`
- Production build + search index: `npm run build:search`

## Common Failures

- `Missing entry-point to Worker script or to assets directory`
  - Cause: using `wrangler versions upload` without valid assets config.
  - Fix: use `npm run cf:deploy` (already points to `wrangler deploy --config wrangler.jsonc`).

- `ENOENT ... package.json`
  - Cause: wrong root directory in Cloudflare.
  - Fix: set Root directory to `/`.

- `invalid request body`
  - Cause: stale/incorrect Worker deploy payload.
  - Fix: keep only `wrangler.jsonc` in repo root and deploy with `npm run cf:deploy`.
