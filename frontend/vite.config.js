import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { SITE } from './src/config.js'

// ─────────────────────────────────────────────────────────────────────────
//  Plugin SEO : génère les balises <head>, robots.txt et sitemap.xml à partir
//  de SITE.seo (config.js). Un fork n'a qu'à éditer config.js — rien en dur ici.
// ─────────────────────────────────────────────────────────────────────────
function seoPlugin() {
  const seo = SITE.seo || {}
  const base = (seo.siteUrl || '').replace(/\/+$/, '')
  const abs = (u) => (!u ? '' : /^https?:\/\//.test(u) ? u : base + u)
  const esc = (s) =>
    String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const headTags = () => {
    const img = abs(seo.image)
    const url = base + '/'
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: SITE.ownerName,
      url,
      ...(img && { image: img }),
      ...(seo.jobTitle && { jobTitle: seo.jobTitle }),
      ...(seo.description && { description: seo.description }),
      ...(seo.sameAs?.length && { sameAs: seo.sameAs }),
    }
    return [
      `<title>${esc(seo.title)}</title>`,
      `<meta name="description" content="${esc(seo.description)}" />`,
      `<meta name="author" content="${esc(SITE.ownerName)}" />`,
      base && `<link rel="canonical" href="${url}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="${esc(SITE.ownerName)}" />`,
      base && `<meta property="og:url" content="${url}" />`,
      `<meta property="og:title" content="${esc(seo.title)}" />`,
      `<meta property="og:description" content="${esc(seo.description)}" />`,
      img && `<meta property="og:image" content="${img}" />`,
      seo.locale && `<meta property="og:locale" content="${esc(seo.locale)}" />`,
      `<meta name="twitter:card" content="summary" />`,
      `<meta name="twitter:title" content="${esc(seo.title)}" />`,
      `<meta name="twitter:description" content="${esc(seo.description)}" />`,
      img && `<meta name="twitter:image" content="${img}" />`,
      `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
    ]
      .filter(Boolean)
      .join('\n    ')
  }

  return {
    name: 'portfolio-seo',
    // Injecte les balises dans le <head> (dev + build) en remplaçant le marqueur.
    transformIndexHtml(html) {
      return html.replace('<!--%SEO%-->', headTags())
    },
    // Émet robots.txt + sitemap.xml au build (domaine tiré de la config).
    generateBundle() {
      const robots =
        `User-agent: *\nAllow: /\nDisallow: /admin\n` +
        (base ? `\nSitemap: ${base}/sitemap.xml\n` : '')
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })
      if (base) {
        const sitemap =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          `  <url>\n    <loc>${base}/</loc>\n    <changefreq>weekly</changefreq>\n` +
          `    <priority>1.0</priority>\n  </url>\n</urlset>\n`
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), seoPlugin()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
