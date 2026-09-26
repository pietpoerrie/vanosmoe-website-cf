/**
 * Content collection schemas
 * ===========================
 *
 * De content leeft als markdown in `src/content/`. Deze schemas valideren ze
 * bij de build; `src/lib/content.ts` leest ze uit en levert ze aan de pagina's.
 *
 * Deze bestanden zijn de bron van waarheid: een tekst wijzigen = de markdown
 * aanpassen en pushen. Er is geen CMS meer (zie ../../OVERDRACHT-PLAN.md).
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ============================================================================
// PRODUCTEN — wat groeit er op het veld
// ============================================================================
const producten = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/producten' }),
  schema: z.object({
    // Naamgeving
    name: z.string(),
    name_latin: z.string().optional(),
    slug: z.string().optional(),

    // Status & seizoen
    status: z.enum(['verwacht', 'actief', 'piek', 'einde', 'rust']).default('rust'),
    season_start_month: z.number().min(1).max(12),
    season_end_month: z.number().min(1).max(12),

    // Categorisatie
    category: z.enum(['groente', 'fruit', 'aardappel', 'kruid', 'soep', 'specialiteit']),
    is_specialiteit: z.boolean().default(false),

    // Inhoud
    short_description: z.string().max(160),
    intro: z.string().optional(),

    // Prijzen — optioneel; stonden een tijd niet op de site (keuze van Pieter)
    price_indication: z.string().optional(),
    unit: z.string().optional(), // 'bundel', 'kg', 'stuk', 'pot 500ml', ...

    // Beeld
    image: z.string().optional(),
    image_alt: z.string().optional(),

    // Bestel-link (voor nu: deep link naar shop.vanosmoe.be)
    shop_url: z.string().url().optional(),

    // Meta
    order: z.number().default(100), // sorteervolgorde
    featured: z.boolean().default(false)
  })
});

// ============================================================================
// RECEPTEN
// ============================================================================
const recepten = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recepten' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    intro: z.string(),

    // Tijd & porties
    prep_time_minutes: z.number().optional(),
    cook_time_minutes: z.number().optional(),
    servings: z.number().default(4),

    // Seizoen & koppeling
    season: z.array(z.enum(['lente', 'zomer', 'herfst', 'winter'])).default([]),
    products_used: z.array(z.string()).default([]), // slugs van producten

    // Beeld
    main_image: z.string().optional(),
    main_image_alt: z.string().optional(),

    // Meta
    featured: z.boolean().default(false),
    published_date: z.coerce.date().optional()
  })
});

// ============================================================================
// SOEPMOBIEL-STOPS
// ============================================================================
const soepmobiel = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/soepmobiel' }),
  schema: z.object({
    date: z.coerce.date(),
    start_time: z.string(), // "09:00"
    end_time: z.string(),   // "14:00"

    location_name: z.string(),
    address: z.string().optional(),
    city: z.string(),

    event_name: z.string().optional(),
    notes: z.string().optional(),

    status: z.enum(['gepland', 'bevestigd', 'geannuleerd']).default('gepland')
  })
});

// ============================================================================
// LOCATIONS — boerderij, automaten, vaste soepmobiel-stops
// ============================================================================
const locations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/locations' }),
  schema: z.object({
    name: z.string(),
    type: z.enum(['boerderij', 'automaat', 'levering', 'soepmobiel-vast']),
    address: z.string(),
    city: z.string(),
    postal_code: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
    opening_hours: z.string().optional(),
    access_24_7: z.boolean().default(false),
    description: z.string().optional(),
    // Foto van het verkooppunt (automaat, soepmobiel).
    image: z.string().optional(),
    order: z.number().default(100)
  })
});

// ============================================================================
// PAGES — losse vrije-tekst pagina's (Over de boerderij, etc.)
// ============================================================================
// Page-builder-blokken: richtext (markdown), image of quote, in volgorde.
// `content` is markdown en wordt in src/lib/content.ts naar HTML gerenderd.
const pageBlock = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('richtext'),
    content: z.string()
  }),
  z.object({
    type: z.literal('image'),
    src: z.string(),
    caption: z.string().optional(),
    layout: z.enum(['full', 'breed', 'portret']).default('full')
  }),
  z.object({
    type: z.literal('quote'),
    text: z.string(),
    attribution: z.string().optional()
  })
]);

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    meta_description: z.string().max(200).optional(),
    updated_at: z.coerce.date().optional(),

    // Beeld
    hero_image: z.string().optional(),
    portret: z.string().optional(),

    // Generieke pagina-tekst: bovenkop + intro (markdown).
    eyebrow: z.string().optional(),
    intro: z.string().optional(),

    // home: de drie sectie-koppen.
    sectie1_eyebrow: z.string().optional(),
    sectie1_titel: z.string().optional(),
    sectie2_eyebrow: z.string().optional(),
    sectie2_titel: z.string().optional(),
    sectie3_eyebrow: z.string().optional(),
    sectie3_titel: z.string().optional(),

    // vind-ons: sectie-titels.
    sectie_boerderij_titel: z.string().optional(),
    sectie_verkoop_eyebrow: z.string().optional(),
    sectie_verkoop_titel: z.string().optional(),
    sectie_verkoop_intro: z.string().optional(),

    // soepmobiel: tagline (mag inline HTML bevatten) + agenda-kop.
    tagline: z.string().optional(),
    agenda_titel: z.string().optional(),

    // Vrije opbouw van de pagina (de-boerderij, soepmobiel, vind-ons).
    blocks: z.array(pageBlock).default([])
  })
});

export const collections = {
  producten,
  recepten,
  soepmobiel,
  locations,
  pages
};
