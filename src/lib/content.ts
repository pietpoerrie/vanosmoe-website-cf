/**
 * Content abstraction layer
 * ==========================
 *
 * Alle content komt uit de markdown-collecties in `src/content/`, gevalideerd
 * door de Zod-schemas in `src/content.config.ts`. Pagina's fetchen nooit
 * rechtstreeks — alles loopt via deze module.
 *
 * Historiek: tussen juni en september 2026 draaide dit op een Directus-CMS
 * (cms.tisgefixt.be). Die server bestaat niet meer; de content is uit de laatste
 * geslaagde deploy teruggehaald en staat nu weer in git. Zie
 * `../../OVERDRACHT-PLAN.md` voor de volledige toedracht.
 *
 * Wil je later tóch een CMS? Dit is het enige bestand dat het moet weten:
 * vervang elke functie-body door een fetch en hou de return-vorm gelijk —
 *
 *   { id, slug, data: {...}, body: string, bodyHtml: string }
 *
 * dan blijven alle pagina's ongewijzigd werken. Dat was ook hoe de
 * Directus-migratie destijds in één bestand paste.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { marked } from 'marked';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
type Entry<T> = {
  id: string;
  slug: string;
  data: T;
  body: string;
  bodyHtml: string;
};

function md(source: string | undefined): string {
  if (!source) return '';
  return marked.parse(source, { async: false }) as string;
}

/** Collectie-entry naar de vorm die de pagina's verwachten. */
function wrap<C extends 'producten' | 'recepten' | 'soepmobiel' | 'locations' | 'pages'>(
  entry: CollectionEntry<C>,
  slugFallback?: string,
): Entry<CollectionEntry<C>['data']> {
  const data = entry.data as CollectionEntry<C>['data'] & { slug?: string };
  const slug = data.slug ?? slugFallback ?? entry.id;
  const body = entry.body ?? '';
  return { id: slug, slug, data, body, bodyHtml: md(body) };
}

// ---------------------------------------------------------------------------
// Producten
// ---------------------------------------------------------------------------
export type Product = Entry<CollectionEntry<'producten'>['data']>;

export async function getProducten(): Promise<Product[]> {
  const all = await getCollection('producten');
  return all
    .map((e) => wrap(e))
    .sort(
      (a, b) =>
        (a.data.order ?? 100) - (b.data.order ?? 100) ||
        a.data.name.localeCompare(b.data.name),
    );
}

export async function getProductenInSeizoen(date: Date = new Date()): Promise<Product[]> {
  const m = date.getMonth() + 1;
  const all = await getProducten();
  return all.filter((p) => {
    const { season_start_month: s, season_end_month: e } = p.data;
    // Cross-year meenemen (bv. november → februari).
    if (s <= e) return m >= s && m <= e;
    return m >= s || m <= e;
  });
}

export async function getSpecialiteiten(): Promise<Product[]> {
  const all = await getProducten();
  return all.filter((p) => p.data.is_specialiteit);
}

// ---------------------------------------------------------------------------
// Recepten
// ---------------------------------------------------------------------------
export type Recept = Entry<CollectionEntry<'recepten'>['data']>;

export async function getRecepten(): Promise<Recept[]> {
  const all = await getCollection('recepten');
  return all
    .map((e) => wrap(e))
    .sort((a, b) => {
      const da = a.data.published_date?.getTime() ?? 0;
      const db = b.data.published_date?.getTime() ?? 0;
      return db - da; // nieuwste eerst
    });
}

export async function getReceptenInSeizoen(seizoenNaam: string): Promise<Recept[]> {
  const all = await getRecepten();
  const key = seizoenNaam.toLowerCase() as 'lente' | 'zomer' | 'herfst' | 'winter';
  return all.filter((r) => r.data.season.includes(key));
}

// ---------------------------------------------------------------------------
// Soepmobiel-stops
// ---------------------------------------------------------------------------
export type SoepmobielStop = Entry<CollectionEntry<'soepmobiel'>['data']>;

export async function getSoepmobielStops(): Promise<SoepmobielStop[]> {
  const all = await getCollection('soepmobiel');
  return all
    .map((e, i) => wrap(e, `stop-${i}`))
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export async function getKomendeSoepmobielStops(date: Date = new Date()): Promise<SoepmobielStop[]> {
  const all = await getSoepmobielStops();
  return all
    .filter((s) => s.data.date >= date)
    .filter((s) => s.data.status !== 'geannuleerd');
}

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------
export type Location = Entry<CollectionEntry<'locations'>['data']>;

export async function getLocations(): Promise<Location[]> {
  const all = await getCollection('locations');
  return all
    .map((e) => wrap(e, e.data.name.toLowerCase().replace(/\s+/g, '-')))
    .sort(
      (a, b) =>
        (a.data.order ?? 100) - (b.data.order ?? 100) ||
        a.data.name.localeCompare(b.data.name),
    );
}

export async function getLocationsByType(type: Location['data']['type']): Promise<Location[]> {
  const all = await getLocations();
  return all.filter((l) => l.data.type === type);
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
/**
 * Page-builder-blok zoals `PageBlocks.astro` het verwacht: de richtext-`content`
 * is hier al HTML (in de markdown-bron is het markdown).
 */
export type PageBlock =
  | { type: 'richtext'; content: string }
  | { type: 'image'; src: string; caption?: string; layout: string }
  | { type: 'quote'; text: string; attribution?: string };

type RawBlock = CollectionEntry<'pages'>['data']['blocks'][number];

/** Markdown in de richtext-blokken naar HTML; de rest gaat ongewijzigd door. */
function renderBlocks(blocks: RawBlock[] = []): PageBlock[] {
  return blocks.map((b) =>
    b.type === 'richtext' ? { type: 'richtext' as const, content: md(b.content) } : b,
  );
}

export type Page = Entry<
  Omit<CollectionEntry<'pages'>['data'], 'blocks'> & { blocks: PageBlock[] }
>;

export async function getPages(): Promise<Page[]> {
  const all = await getCollection('pages');
  return all.map((entry) => {
    const base = wrap(entry);
    return {
      ...base,
      data: {
        ...base.data,
        // Intro wordt met set:html gerenderd, dus hier al naar HTML.
        intro: base.data.intro ? md(base.data.intro) : undefined,
        blocks: renderBlocks(base.data.blocks),
      },
    } as Page;
  });
}

export async function getPage(slug: string): Promise<Page | undefined> {
  const all = await getPages();
  return all.find((p) => p.slug === slug);
}
