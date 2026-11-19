import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

declare const process: { env: Record<string, string | undefined> }

/**
 * Absolute URLs for share cards. On Vercel the production domain is provided at build time;
 * set SITE_URL to override (e.g. a custom domain). Locally the tags fall back to root-relative.
 */
function siteUrl(): Plugin {
  const raw = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  const site = raw.replace(/\/$/, '')
  return {
    name: 'site-url',
    transformIndexHtml: (html) =>
      // without a known domain, drop the canonical link rather than ship a relative one
      (site ? html : html.replace(/\s*<link rel="canonical"[^>]*>/, '')).replaceAll('__SITE__', site),
  }
}

export default defineConfig({
  plugins: [react(), siteUrl()],
  server: { port: 5173, strictPort: true },
})
