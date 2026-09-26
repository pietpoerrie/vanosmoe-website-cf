# Van os Moe — Astro site

Brand-site voor Van os Moe (streekboerderij in Begijnendijk). Astro + content collections; alle content staat als markdown in deze repo.

## Status

✓ **Live.** `www.vanosmoe.be` draait op Cloudflare Pages. De build levert 16 pagina's
+ sitemap. Webshop draait extern op `shop.vanosmoe.be` (Linkedfarm) en blijft daar.

Nieuw hier? Begin bij **[`HANDOVER.md`](./HANDOVER.md)** — dat legt uit hoe je
content wijzigt en publiceert.

## Stack

- **Astro 5** — static site generator
- **Content collections** met Zod schemas — markdown in `src/content/`, gevalideerd bij de build
- **CSS-only** styling — geen Tailwind, geen build-step buiten Astro zelf
- **Fonts**: Fraunces (display), Manrope (body), JetBrains Mono (labels/dates), via Google Fonts
- **Nauwelijks dependencies** — enkel `astro` en `marked` (voor markdown in de page-blocks). Sitemap, filtering en de rest is vanilla code

## Project structuur

```
.
├── astro.config.mjs                 # site-URL, trailingSlash: always
├── package.json
├── tsconfig.json                    # met @/ aliases
├── HANDOVER.md                      # ★ begin hier
├── DEPLOY.md                        # live gaan
├── public/
│   ├── _headers                     # CSP + security + cache
│   ├── _redirects                   # legacy paden + webshop-deeplinks
│   ├── robots.txt
│   ├── favicon.svg
│   ├── fonts/
│   └── img/
│       ├── IMAGE-SOURCES.json       # herkomst van de originelen
│       ├── products/
│       ├── sfeer/
│       ├── portret/
│       └── verkoop/
└── src/
    ├── content.config.ts            # ★ Zod schemas — welke velden content mag hebben
    ├── content/                     # ★ de content zelf
    │   ├── producten/               # 6 producten
    │   ├── recepten/                # 3 recepten
    │   ├── soepmobiel/              # stops-agenda (leeg)
    │   ├── locations/               # 4 locaties
    │   └── pages/                   # 6 pagina's (velden + blocks)
    ├── lib/
    │   └── content.ts               # ★ abstraction laag — enige plek die de bron kent
    ├── data/
    │   └── site.ts                  # contact, navigatie, seizoenen
    ├── styles/
    │   └── global.css               # almanak design system
    ├── layouts/
    │   └── Base.astro               # canonical, OG/Twitter, skip-link, nav-toggle
    ├── components/
    │   ├── Nav.astro
    │   ├── Footer.astro
    │   ├── DateStrip.astro
    │   ├── BestelBlock.astro
    │   ├── ProductCard.astro
    │   ├── AlmanakHero.astro
    │   ├── PageBlocks.astro         # rendert de page-builder-blokken
    │   └── SoepmobielAgenda.astro
    └── pages/
        ├── index.astro
        ├── 404.astro
        ├── sitemap.xml.ts           # handgeschreven sitemap-endpoint
        ├── de-boerderij.astro
        ├── soepmobiel.astro
        ├── vind-ons.astro
        ├── op-het-veld/
        │   ├── index.astro          # filter op status
        │   └── [slug].astro         # productdetail
        └── recepten/
            ├── index.astro          # filter op seizoen
            └── [slug].astro         # receptdetail
```
.
├── astro.config.mjs                 # site URL, trailingSlash: never
├── package.json
├── tsconfig.json                    # met @/ aliases
├── DEPLOY.md                        # Cloudflare Pages + Netlify
├── public/
│   ├── _headers                     # CSP + security + cache
│   ├── _redirects                   # legacy paden + webshop deeplink
│   ├── robots.txt
│   ├── favicon.svg
│   ├── fonts/
│   └── img/
│       ├── IMAGE-SOURCES.json       # manifest met originele URLs
│       ├── products/
│       ├── sfeer/
│       ├── portret/
│       └── verkoop/
└── src/
    ├── content.config.ts            # ★ Zod schemas — welke velden content mag hebben
    ├── lib/
    │   └── content.ts               # ★ abstraction laag — enige plek die de bron kent
    ├── data/
    │   └── site.ts                  # site-wide settings (contact, nav, seizoenen)
    ├── styles/
    │   └── global.css               # almanak design system
    ├── layouts/
    │   └── Base.astro               # canonical, OG/Twitter, skip-link, nav-toggle
    ├── components/
    │   ├── Nav.astro
    │   ├── Footer.astro
    │   ├── DateStrip.astro
    │   ├── BestelBlock.astro
    │   ├── ProductCard.astro
    │   ├── AlmanakHero.astro
    │   └── SoepmobielAgenda.astro
    ├── content/                     # ★ de content zelf
    │   ├── producten/               # 6 producten
    │   ├── recepten/                # 3 recepten
    │   ├── soepmobiel/              # stops-agenda (leeg)
    │   ├── locations/               # 4 locaties
    │   └── pages/                   # 6 pagina's (velden + blocks)
    └── pages/
        ├── index.astro
        ├── 404.astro
        ├── sitemap.xml.ts           # handgeschreven sitemap endpoint
        ├── de-boerderij.astro
        ├── soepmobiel.astro
        ├── vind-ons.astro
        ├── op-het-veld/
        │   ├── index.astro          # filter op status
        │   └── [slug].astro         # productdetail
        └── recepten/
            ├── index.astro          # filter op seizoen
            └── [slug].astro         # receptdetail
```

## Lokaal draaien

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # production build in ./dist
npm run preview      # serve dist/ lokaal
```

## Foto's

Staan in `public/img/`, per soort gesorteerd (`products/`, `sfeer/`, `portret/`,
`verkoop/`). Verwijzen gaat met een pad vanaf de root: `/img/products/foo.jpg`.
`public/img/IMAGE-SOURCES.json` documenteert waar de originelen vandaan komen.

## Deploy

Volledige procedure in [`DEPLOY.md`](./DEPLOY.md). Kort samengevat:

- **Cloudflare Pages**, git-gekoppeld: een push naar `main` bouwt en publiceert.
- Build command: `npm run build`. Output: `dist/`. Geen environment variables.
- `www.vanosmoe.be` is canonical; de apex en `preview.vanosmoe.tisgefixt.be`
  hangen aan hetzelfde project.
- `shop.vanosmoe.be` ongemoeid laten (draait op Linkedfarm).

## Een andere contentbron aanhaken

`src/lib/content.ts` is het enige bestand dat weet waar content vandaan komt: elke
pagina fetcht via die module. Wil je er ooit een CMS of API achter hangen, vervang
dan de body van elke functie en hou de return-vorm gelijk —

```ts
{ id, slug, data: {...}, body: string, bodyHtml: string }
```

— dan blijven alle pagina's ongewijzigd werken. De site heeft in 2026 een tijd op
een Directus-CMS gedraaid; zowel de omschakeling heen als terug paste in dat ene
bestand. Zie `HANDOVER.md` voor wat er toen gebeurd is.

## Open punten

- Contact-e-mail `pieter_goris@hotmail.com` vervangen door een bedrijfsmail zodra
  die bestaat. Plek: `src/data/site.ts` → `contact.email`.
- De SEO-batch (commit `7fb1cab`) zit in de repo maar draait nog niet live — de
  eerste geslaagde deploy brengt hem mee.
- Sitemap indienen in Google Search Console na een domeinwissel.

Volledige lijst en context: [`HANDOVER.md`](./HANDOVER.md).
