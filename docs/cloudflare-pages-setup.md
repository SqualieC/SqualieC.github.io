# Cloudflare Pages Setup

This repo is configured for a static Astro build with Pagefind indexing.

## Build Settings

Use these values in Cloudflare Pages:

- Framework preset: `Astro`
- Build command: `npm run build:search`
- Build output directory: `dist`
- Root directory: `/` (repo root)
- Node.js version: `22`

## Git Integration Steps

1. In Cloudflare dashboard, go to `Workers & Pages` -> `Create` -> `Pages`.
2. Connect GitHub and choose repository `SqualieC/SqualieC.github.io`.
3. Set production branch to `main`.
4. Enter the Build Settings above and save.
5. Trigger first deploy.

## Custom Domain

1. Open the created Pages project.
2. Go to `Custom domains` -> `Set up a custom domain`.
3. Add your domain/subdomain and complete DNS verification.

## Local Verification Before Deploy

- Fast dev: `npm run dev`
- LAN dev: `npm run dev:host`
- Production-like preview with search index: `npm run preview:local`

## Optional CLI Deploy

You can also deploy the built output manually:

```powershell
npx wrangler pages deploy dist --project-name mywebsite
```
