/**
 * Site-wide settings
 * ===================
 *
 * Site-brede instellingen. Pas ze hier aan — ze worden overal vandaan gelezen.
 */

export const site = {
  naam: 'Van os Moe',
  domein: 'vanosmoe.be',
  tagline: 'Niks smaakt zo goe als de soep van os moe',
  subtagline: 'Streekboerderij in Begijnendijk',
  meta_description:
    'Verse hoevesoep, witte asperges en seizoensgroenten van onze boerderij in Begijnendijk. Afhalen aan de automaat, webshop of soepmobiel.',
  taal: 'nl-BE'
} as const;

export const contact = {
  naam: 'Pieter Goris',
  telefoon: '0497 77 28 41',
  telefoon_intl: '+32497772841',
  email: 'pieter_goris@hotmail.com', // ⚠ TODO: vervang door bedrijfsmail
  whatsapp: '+32497772841'
} as const;

export const bedrijf = {
  juridisch_naam: 'Pieter Goris',
  btw: 'BE 0809.768.668',
  adres_lijn_1: 'Bloemsehoeve 34',
  postcode: '3200',
  stad: 'Aarschot'
} as const;

export const social = {
  facebook: 'https://www.facebook.com/Vanosmoe/',
  instagram: null // nog niet bestaand — placeholder voor wanneer Pieter klaar is
} as const;

export const shop_links = {
  // B2C webshop op Linkedfarm — ook B2B (restaurants/winkels bestellen hier net als particulieren)
  shop_b2c: 'https://shop.vanosmoe.be/webshop',
  // Pallo (voor wanneer Pieter dit invult)
  pallo: 'https://www.pallo.be'
} as const;

// Navigatie — losse lijst zodat een pagina toevoegen één regel is
export const navigation = [
  { label: 'Op het veld', href: '/op-het-veld/' },
  { label: 'De boerderij', href: '/de-boerderij/' },
  { label: 'Soepmobiel', href: '/soepmobiel/' },
  { label: 'Recepten', href: '/recepten/' },
  { label: 'Vind ons', href: '/vind-ons/' }
] as const;

// Maand-labels voor de almanak-datestrip
export const maanden = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
] as const;

// Seizoens-edities voor het almanak-principe
export const seizoenen = [
  { naam: 'Winter',  maanden: [12, 1, 2],  kleur: '#5a6a3e' },
  { naam: 'Lente',   maanden: [3, 4, 5],   kleur: '#9bb87a' },
  { naam: 'Zomer',   maanden: [6, 7, 8],   kleur: '#e8a652' },
  { naam: 'Herfst',  maanden: [9, 10, 11], kleur: '#b8693f' }
] as const;

export function huidigSeizoen(date: Date = new Date()) {
  const m = date.getMonth() + 1;
  return seizoenen.find(s => s.maanden.includes(m as never)) ?? seizoenen[1];
}

export function huidigeMaand(date: Date = new Date()) {
  return maanden[date.getMonth()];
}

export function maandNummer(date: Date = new Date()) {
  return String(date.getMonth() + 1).padStart(2, '0');
}

// ---------------------------------------------------------------------------
// Google Maps Embed — kaart op /vind-ons
// ---------------------------------------------------------------------------
/**
 * ⚠️ VERVANG DEZE KEY. Hij hoort bij het Google-account van de oorspronkelijke
 * bouwer ('t is gefixt), dus de kaart draait nu op diens quota en facturatie.
 * Maak een eigen key in Google Cloud (Maps Embed API), beperk hem tot het eigen
 * domein via een HTTP-referrer-restrictie, en zet hem hier.
 *
 * Een Maps-Embed-key staat per definitie in de publieke HTML — dat is normaal;
 * de referrer-restrictie is wat hem beschermt, niet geheimhouding.
 */
export const mapsApiKey = 'AIzaSyAfHMrldIaIGq4DZZ_mSa4cvADjAmTEf5Q';

/** Adres dat de kaart toont. */
export const mapsQuery = 'heidestraat 39 3130 Begijnendijk';
