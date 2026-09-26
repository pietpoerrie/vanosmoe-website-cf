# Deploy

De site is een statische Astro-build op **Cloudflare Pages**, gekoppeld aan een
GitHub-repo. Een push naar `main` triggert een build; die build is wat live gaat.

> **Stand van zaken (26 sep 2026):** `www.vanosmoe.be` en `vanosmoe.be` draaien
> live op het Pages-project `vanosmoe-site`, met `preview.vanosmoe.tisgefixt.be`
> als tweede hostname op hetzelfde project. De eigendomsoverdracht van
> Cloudflare-account, GitHub-repo en DNS-zone is nog een open beslissing —
> zie `../../OVERDRACHT-PLAN.md`, fase 5.

---

## Bouwen

```bash
npm install
npm run build     # -> dist/   (16 pagina's + sitemap)
npm run preview   # serveert dist/ op http://localhost:4321
```

| | |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node | 22 (lokaal getest op v22.22.2) |
| Environment variables | **geen** — alle content zit in de repo |

De build heeft geen netwerk nodig. Als hij faalt, ligt het aan de code of de
content, niet aan een externe dienst. (Dat was vroeger anders: tot september 2026
haalde de build z'n content bij een Directus-server, en toen die verdween lag de
build plat. Daarom staat alles nu in git.)

---

## Live gaan met een wijziging

```bash
git add -A && git commit -m "beschrijving"
git push origin main
```

Cloudflare pikt de push op en bouwt. Duurt doorgaans één à twee minuten. Faalt de
build, dan blijft de vorige deploy gewoon staan — de site gaat dus niet plat door
een kapotte commit.

### Zolang de repo op Forgejo staat

In de huidige opzet leeft de volledige klantenmap op Forgejo en bevat de
GitHub-repo **enkel de `site/`-submap**. Publiceren gaat dan via een subtree-push:

```bash
cd ~/projects/tisgefixt-clients
./scripts/deploy-to-github.sh vanosmoe
```

Dat script splitst `vanosmoe/vanosmoe-hosting/site` af en pusht die naar
`github.com/tisgefixt/vanosmoe-site` `main`. Na de overdracht aan een nieuwe
eigenaar vervalt die tussenstap: dan is de site-repo gewoon de repo.

---

## Domeinen

| Hostname | Rol |
|---|---|
| `www.vanosmoe.be` | canonical — dit is wat in `astro.config.mjs` als `site` staat |
| `vanosmoe.be` | apex, wijst naar hetzelfde Pages-project |
| `preview.vanosmoe.tisgefixt.be` | preview-hostname, zelfde project en dus zelfde inhoud |
| `shop.vanosmoe.be` | **niet van ons** — Linkedfarm-webshop, afblijven |

DNS staat op Cloudflare (nameservers `kobe`/`macy`). Een nieuwe hostname koppel je
in het Pages-project onder *Custom domains*; Cloudflare zet het CNAME zelf klaar
als de zone in hetzelfde account zit.

### `shop.vanosmoe.be` met rust laten

De webshop draait op Linkedfarm, een extern platform met eigen logistiek en
B2B-netwerk. De site deeplinkt ernaartoe (`/webshop` en `/shop` in
`public/_redirects`, plus de bestelknoppen op productpagina's). Raak het
DNS-record niet aan en probeer de webshop niet te integreren of te vervangen.

---

## Wat Cloudflare uit de repo leest

- **`public/_headers`** — CSP (`default-src 'self'`, geen `unsafe-eval`,
  `frame-src https://www.google.com` voor de kaart op `/vind-ons`),
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, en
  cache-immutable op `/_astro/*`. **Bewust geen HSTS** — dat pint het domein vast
  en maakt een latere hoster-wissel gevaarlijk; laat het aan Cloudflare zelf.
- **`public/_redirects`** — vier legacy 301's van de oude Webosaurus-site en twee
  302's naar de webshop. **Geen catch-all**: onbekende paden moeten 404'en, zowel
  als SEO-signaal als om zelf fouten te kunnen zien.
- **`public/robots.txt`** — `Allow: /` plus een verwijzing naar de sitemap.

---

## Na een deploy

- [ ] Homepage, `/op-het-veld`, een productdetail en `/vind-ons` openen
- [ ] `/sitemap.xml` — hoort 15 URL's te geven, allemaal met trailing slash
- [ ] Een legacy pad testen, bv. `/contact` → moet 301'en naar `/vind-ons/`
- [ ] `/webshop` → moet 302'en naar Linkedfarm
- [ ] Een onbestaand pad → moet de 404-pagina tonen, niet de homepage
- [ ] Bij een nieuw domein: sitemap indienen in Google Search Console

---

## Rollback

Cloudflare Pages bewaart elke deploy. In het dashboard bij *Deployments* kies je
een oudere en klik je *Rollback*. Dat is sneller dan een revert-commit en handig
als een wijziging pas live opvalt.
