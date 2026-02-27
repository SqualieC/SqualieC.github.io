# MyWebsite

Astro + TypeScript portfolio/catalog site.

## Stack

- Astro
- TypeScript
- Tailwind CSS
- MDX
- Astro content collections
- Pagefind
- Cloudflare Pages

## Commands

- `npm run dev` (local development)
- `npm run dev:host` (LAN-accessible local development)
- `npm run build` (Astro static build)
- `npm run search:index` (generate Pagefind index)
- `npm run build:search` (build + search index; use for Cloudflare)
- `npm run preview:local` (production-like localhost preview)

## Deployment

Cloudflare Pages configuration is documented in [docs/cloudflare-pages-setup.md](docs/cloudflare-pages-setup.md).

## Planning

Current backlog is in [TODO.md](TODO.md).

## Optional Environment Variables

- `PUBLIC_CF_ANALYTICS_TOKEN` for Cloudflare Web Analytics beacon injection.

## BassProgram release packaging

See [docs/bassprogram-release.md](docs/bassprogram-release.md).

## Korean TTS Asset Refresh

Regenerate static Korean audio (Microsoft Edge `ko-KR-SunHiNeural`) with:

- `python scripts/generate_korean_audio.py`
