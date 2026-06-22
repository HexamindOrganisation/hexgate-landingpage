# Hexgate landing page

Marketing site for [Hexgate](https://github.com/HexamindOrganisation/hexgate) — authorization infrastructure for AI agents.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4 (CSS-first config via `@theme inline` in `globals.css`)
- Self-hosted Google fonts via `next/font`: Hanken Grotesk (sans + display), IBM Plex Mono (code)
- Deployed on Vercel

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # production build
npm run start        # serve the build locally
npm run lint
```

## Project layout

```
src/app/
  layout.tsx         # fonts + <metadata>
  page.tsx           # full landing page (will be split into components)
  globals.css        # design tokens (:root + @theme) + component styles
design/              # original HTML mockup + screenshots, kept as reference
```

## Design tokens

All colors, fonts, and the maxw/radius scale live as CSS variables in `:root` inside `globals.css` and are re-exported to Tailwind via `@theme inline`. Edit the variable, both raw CSS and Tailwind utilities update.

## Deployment

Pushes to `main` auto-deploy to Vercel. No environment variables are required.
