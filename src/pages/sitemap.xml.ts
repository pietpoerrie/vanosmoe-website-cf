/**
 * sitemap.xml — handgeschreven endpoint
 * ======================================
 *
 * Bewust geen @astrojs/sitemap dependency: minder oppervlak, volledige
 * controle over welke routes erin gaan, en `lastmod` per type op maat.
 *
 * Regels:
 *   - Statische routes: geen lastmod (tenzij er een matchende `pages`-entry
 *     bestaat met `updated_at` — dan die datum gebruiken).
 *   - Producten: geen lastmod (schema heeft geen updated-veld).
 *   - Recepten: lastmod uit `published_date` als die er is.
 *   - Geen <priority> of <changefreq> — Google negeert die al jaren.
 */

import type { APIRoute } from 'astro';
import { getProducten, getRecepten, getPages } from '@lib/content';

const STATIC_ROUTES = [
  '/',
  '/op-het-veld/',
  '/recepten/',
  '/de-boerderij/',
  '/soepmobiel/',
  '/vind-ons/'
];

interface UrlEntry {
  loc: string;
  lastmod?: Date;
}

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&apos;');

const formatDate = (d: Date): string => d.toISOString().split('T')[0];

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('Astro.site is niet gezet in astro.config.mjs');
  }

  // Strip trailing slash zodat origin + path netjes samenvalt
  const origin = site.toString().replace(/\/$/, '');

  const [producten, recepten, pages] = await Promise.all([
    getProducten(),
    getRecepten(),
    getPages()
  ]);

  // Map: route-slug → updated_at uit pages-collection (bv. "de-boerderij")
  const pageUpdatedAt = new Map<string, Date>();
  for (const p of pages) {
    const slug = p.data.slug ?? p.id;
    if (p.data.updated_at) {
      pageUpdatedAt.set(slug, p.data.updated_at);
    }
  }

  const urls: UrlEntry[] = [];

  // Statische routes — match op de slug (= path zonder leading slash of trailing slash)
  for (const route of STATIC_ROUTES) {
    const slug = route === '/' ? '' : route.replace(/^\/|\/$/g, '');
    const lastmod = pageUpdatedAt.get(slug);
    urls.push({ loc: `${origin}${route === '/' ? '/' : route}`, lastmod });
  }

  // Producten — geen lastmod
  for (const p of producten) {
    const slug = p.data.slug ?? p.id;
    urls.push({ loc: `${origin}/op-het-veld/${slug}/` });
  }

  // Recepten — lastmod uit published_date
  for (const r of recepten) {
    const slug = r.data.slug ?? r.id;
    urls.push({
      loc: `${origin}/recepten/${slug}/`,
      lastmod: r.data.published_date
    });
  }

  const body =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => {
  const lm = u.lastmod ? `\n    <lastmod>${formatDate(u.lastmod)}</lastmod>` : '';
  return `  <url>
    <loc>${escapeXml(u.loc)}</loc>${lm}
  </url>`;
}).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8'
    }
  });
};
