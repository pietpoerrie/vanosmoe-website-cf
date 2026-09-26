# Overdracht — Van os Moe website

Voor wie de site overneemt en zelf gaat publiceren en uitbreiden. Deze pagina is
de snelste weg naar "ik snap hoe dit werkt". Diepere details staan in
[`README.md`](./README.md) (structuur) en [`DEPLOY.md`](./DEPLOY.md) (live gaan).

---

## In één alinea

Van os Moe is een streekboerderij in Begijnendijk: witte asperges, fleurs de
courgettes, primeuraardappelen, pompoenen en verse soep. Deze site is de
brand-site. Verkopen gebeurt **niet** hier — dat loopt via een externe webshop op
Linkedfarm (`shop.vanosmoe.be`), waar we naartoe deeplinken. De site is een
statische Astro-build: alle content staat als markdown in deze repo, een push
naar `main` laat Cloudflare Pages bouwen en publiceren.

---

## Content wijzigen

Alles staat in `src/content/`. Er is geen CMS en geen admin-panel — een tekst
aanpassen is een bestand aanpassen.

```
src/content/
├── producten/    6 stuks — wat er op het veld groeit
├── recepten/     3 stuks
├── locations/    4 — boerderij, twee automaten, de soepmobiel
├── soepmobiel/   stops-agenda (nu leeg — zie hieronder)
└── pages/        6 — home, de-boerderij, op-het-veld, recepten, soepmobiel, vind-ons
```

Elk bestand is markdown met frontmatter. De frontmatter wordt bij de build
gevalideerd tegen `src/content.config.ts` — dat bestand is de bron van waarheid
voor welke velden mogen en welke waarden geldig zijn. Zet je er iets in dat niet
klopt, dan faalt de build met een expliciete melding in plaats van dat het
stilletjes verdwijnt.

### Een product

```markdown
---
name: Witte asperges
name_latin: Asparagus officinalis
slug: witte-asperges
status: piek                    # verwacht | actief | piek | einde | rust
season_start_month: 4
season_end_month: 6
category: groente
is_specialiteit: true
short_description: Max 160 tekens — komt op de kaartjes en in de meta-description.
image: /img/products/asperge-bundel-500g.jpg
image_alt: Bundel witte asperges van 500g, gebonden met katoentouw
shop_url: https://shop.vanosmoe.be/webshop
order: 1                        # sorteervolgorde in de overzichten
featured: true                  # kan als hero-product op de homepage komen
---

De lopende tekst hieronder is gewoon markdown.
```

`status` en de seizoensmaanden sturen echt gedrag aan: de homepage toont wat er
**deze maand** in seizoen is, en `/op-het-veld` heeft filterknoppen per status.
Een product in april ziet er dus anders uit dan in oktober, zonder dat je iets
wijzigt. Dat is bedoeld.

### Een pagina

Pagina's in `src/content/pages/` zijn frontmatter-only: de tekst zit in velden en
in `blocks`, niet in de body. Zo kunnen koppen, intro's en losse tekstsecties elk
op hun eigen plek in het ontwerp landen.

```yaml
blocks:
  - type: richtext          # markdown, wordt naar HTML gerenderd
    content: |
      ## Een kop
      Een paragraaf.
  - type: image
    src: /img/portret/pieter.jpg
    layout: portret         # full | breed | portret
    caption: Bijschrift.
  - type: quote
    text: "Een uitspraak."
    attribution: Optioneel
```

De blokken renderen in de volgorde waarin ze staan. `de-boerderij.md` is het
uitgebreidste voorbeeld (acht blokken).

### De soepmobiel-agenda

`src/content/soepmobiel/` is **leeg**. Dat is geen vergetelheid: er stonden geen
stops gepland, en de pagina toont dan netjes "Geen geplande stops". De build
waarschuwt wel dat de collectie leeg is — die melding is onschuldig.

Een stop toevoegen = een bestand bijzetten, bv. `2026-10-12-aarschot.md`:

```markdown
---
date: 2026-10-12
start_time: "09:00"
end_time: "14:00"
location_name: Marktplein
city: Aarschot
status: bevestigd          # gepland | bevestigd | geannuleerd
---
```

Stops in het verleden verdwijnen vanzelf uit de agenda.

### Foto's

In `public/img/`, gesorteerd per soort (`products/`, `sfeer/`, `portret/`,
`verkoop/`). Verwijs ernaar met een pad vanaf de root: `/img/products/foo.jpg`.
`public/img/IMAGE-SOURCES.json` houdt bij waar de originelen vandaan komen.

---

## Lokaal draaien

```bash
npm install
npm run dev       # http://localhost:4321, herlaadt vanzelf
npm run build     # productiebuild in dist/
npm run preview   # dist/ serveren zoals Cloudflare het zou doen
```

Geen `.env` nodig, geen externe diensten. Draait de build lokaal, dan draait hij
ook op Cloudflare.

---

## Publiceren

Push naar `main` → Cloudflare Pages bouwt → live in één à twee minuten. Faalt de
build, dan blijft de vorige versie staan. Volledige procedure, domeinen en
post-deploy checklist: [`DEPLOY.md`](./DEPLOY.md).

---

## Hoe het in elkaar zit

- **Astro 5**, statische output. Enige runtime-dependency is `marked`, voor het
  renderen van markdown in de page-blocks.
- **Geen Tailwind, geen UI-framework.** De styling is met de hand geschreven CSS
  in `src/styles/global.css` — een "almanak"-ontwerp: Fraunces, Manrope en
  JetBrains Mono, kleuren parchment/asparagus/terracotta/saffron, scherpe hoeken.
- **`src/lib/content.ts` is het enige punt dat weet waar content vandaan komt.**
  Alle pagina's fetchen via die module. Wil je ooit een CMS aanhaken, dan hoeft
  enkel dat bestand te wijzigen zolang de return-vorm gelijk blijft. Dat is geen
  theorie: de site heeft een tijd op een Directus-CMS gedraaid en de omschakeling
  heen én terug paste allebei in dat ene bestand.
- **De sitemap is handgeschreven** (`src/pages/sitemap.xml.ts`), bewust zonder
  `@astrojs/sitemap`-dependency.

---

## Afspraken die niet in code staan

Deze komen uit de huisstijl en uit afspraken met de klant. Ze zien er willekeurig
uit, maar er zit telkens een reden achter.

- **De tagline mag nooit breken op "van os moe".** *"Niks smaakt zo goe als de
  soep van os moe"* — de regelafbreking hoort vóór "de soep" te vallen. Op de
  homepage staat daar een expliciete `<br>` voor.
- **Begijnendijk is het merk, Aarschot is de zetel.** De hoeve staat in de
  Heidestraat 39, 3130 Begijnendijk; dat is wat op de site hoort. Aarschot
  (Bloemsehoeve 34, BTW BE 0809.768.668) is enkel de juridische zetel en hoort
  niet in publieksteksten.
- **Het logo is de handgetekende badge**, nooit het woordmerk als primair logo.
- **Echte foto's, niks verzonnen.** Er is een beeldbibliotheek in
  `../../huisstijl/footage/`. Gebruik die in plaats van stock of AI-beelden.
- **Toon is casual Vlaams**, zoals je spreekt. Geen marketingtaal.

De volledige huisstijl staat in `../../huisstijl/`, met een kit die specifiek voor
agent-gebruik gemaakt is: `huisstijl/deliverables/codex-brandkit/` bevat een
`AGENTS.md` met de huisstijl als harde regels, design-tokens als JSON en CSS, alle
templates, en een render-check-tool.

---

## Niet doen

- **De Linkedfarm-webshop integreren of vervangen.** Custom PHP, geen API, en het
  platform levert logistiek en een B2B-netwerk dat de klant wil houden. We
  deeplinken ernaartoe, meer niet.
- **Een catch-all `/*` in `public/_redirects`.** Onbekende paden moeten 404'en.
- **HSTS toevoegen in `public/_headers`.** Pint het domein vast en maakt een
  latere hoster-wissel gevaarlijk.
- **`@astrojs/sitemap` of vergelijkbare dependencies toevoegen.** De lean opzet is
  een keuze; de handgeschreven sitemap doet precies wat nodig is.
- **`shop.vanosmoe.be` in DNS aanraken.**

---

## Openstaande punten

| Punt | Toestand |
|---|---|
| Contact-e-mail is `pieter_goris@hotmail.com` | Staat in `src/data/site.ts` → `contact.email` en komt zo in de JSON-LD terecht. Wacht al lang op een bedrijfsmail van de klant. |
| SEO-batch nog niet live | Commit `7fb1cab` (canonical, H1 op de homepage, Farm/Product/Recipe/Breadcrumb-schema, webmanifest) zit in de repo maar draait nog niet op de live site — die is van vóór die commit. De eerste geslaagde deploy brengt dit mee. |
| Eigendom van accounts | Cloudflare, GitHub-repo en DNS-zone staan nog op de oorspronkelijke bouwer. Zie `../../OVERDRACHT-PLAN.md`, fase 5. |
| `api.vanosmoe.be` | De klant vroeg ooit een subdomein voor een OAuth-callback. Nooit afgerond; er is geen record. Concept-antwoord in `../mails/mail-3-api-subdomein-reply.md`. |

---

## Waar de content vandaan komt

Van juni tot september 2026 kwam de content uit een Directus-CMS op een eigen
server. Die server is verdwenen zonder bruikbare backup. De content is
teruggehaald uit de laatste geslaagde Cloudflare-deploy en staat nu weer als
markdown in git — waar ze verifieerbaar en versiebeheerd is.

De mirror waaruit dat gebeurde, plus de scripts, staan in `../_rescue/`:
`extract.py` haalde de content uit de HTML, `vergelijk.py` toetste de nieuwe build
tekst-voor-tekst tegen de oude site (14 van de 15 pagina's identiek; de homepage
verschilt enkel doordat ze per maand andere producten toont). Die map is
historiek — je hebt ze niet nodig om de site te draaien, maar ze verklaart waarom
bepaalde keuzes zijn gemaakt en bewijst dat er niets verloren is gegaan.
