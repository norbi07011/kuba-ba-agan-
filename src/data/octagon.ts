/*
 * Produkty Octagon – dane i zdjęcia (wycięte z tła) przeniesione z repozytorium
 * norbi07011/octagonsport.l (src/data/products.ts + public/showcase).
 * Kliknięcie produktu otwiera jego kartę w sklepie Octagon Sport NL (trasa /product/<slug>).
 *
 * ADRES SKLEPU: zmień tylko tutaj, jeśli sklep z repo stoi pod innym adresem
 * (np. tymczasowo https://octagonsport-nl.netlify.app).
 */
export const OCTAGON_SHOP_URL = 'https://www.octagonsport.nl';
export const octagonProductUrl = (slug: string) => `${OCTAGON_SHOP_URL}/product/${slug}`;

const img = (name: string) => new URL(`../assets/octagon/${name}.webp`, import.meta.url).href;

export interface OctagonItem { slug: string; name: string; price: number; img: string; w: number }

/** Orbita w hero – te same produkty i kolejność co w ArenaHero sklepu Octagon. */
export const ORBIT: OctagonItem[] = [
  { slug: 'bokshandschoenen-legion-octagon-kevlar-rood', name: 'Bokshandschoenen Legion Octagon Kevlar rood', price: 69.99, img: img('kevlar-red-pair'), w: 1 },
  { slug: 'bokshelm-legion-octagon-guardox-diepzwart-2-in-1', name: 'Bokshelm Legion Octagon Guardox diepzwart 2-in-1', price: 49.99, img: img('guardox-black-hero'), w: 0.95 },
  { slug: 'scheenbeschermers-legion-octagon-kevlar-rood', name: 'Scheenbeschermers Legion Octagon Kevlar rood', price: 59.99, img: img('shin-kevlar-red-hero'), w: 0.9 },
  { slug: 'bokshandschoenen-legion-octagon-kevlar-goud', name: 'Bokshandschoenen Legion Octagon Kevlar goud', price: 69.99, img: img('kevlar-gold-side'), w: 1 },
  { slug: 'boksbandages-legion-octagon-supreme-rood-3m', name: 'Boksbandages Legion Octagon Supreme rood 3m', price: 19.99, img: img('supreme-red-hero'), w: 0.85 },
  { slug: 'bokshelm-legion-octagon-guardox-donkerrood-2-in-1', name: 'Bokshelm Legion Octagon Guardox donkerrood 2-in-1', price: 49.99, img: img('guardox-red-hero'), w: 0.95 },
  { slug: 'bokshandschoenen-legion-octagon-kevlar-zwart', name: 'Bokshandschoenen Legion Octagon Kevlar zwart', price: 69.99, img: img('kevlar-black-pair'), w: 1 },
  { slug: 'scheenbeschermers-legion-octagon-kevlar-zwart', name: 'Scheenbeschermers Legion Octagon Kevlar zwart', price: 59.99, img: img('shin-kevlar-black-hero'), w: 0.9 },
];

export interface Variant { id: string; name: string; swatch: string; glow: string; slug: string; img: string }
export interface OctagonModel { id: string; name: string; type: string; price: number; text: string; variants: Variant[] }

/** Karuzela 3D z wyborem koloru – każdy kolor to osobny produkt w sklepie Octagon. */
export const MODELS: OctagonModel[] = [
  {
    id: 'kevlar-gloves', name: 'Legion Octagon Kevlar', type: 'Rękawice bokserskie', price: 69.99,
    text: 'Rękawice do worka, tarcz i sparingu. W tych samych trenujemy na sali.',
    variants: [
      { id: 'red', name: 'Czerwone', swatch: '#c8121b', glow: '#e3131c', slug: 'bokshandschoenen-legion-octagon-kevlar-rood', img: img('kevlar-red-pair') },
      { id: 'black', name: 'Czarne', swatch: '#1c1a1b', glow: '#e3131c', slug: 'bokshandschoenen-legion-octagon-kevlar-zwart', img: img('kevlar-black-pair') },
      { id: 'gold', name: 'Złote', swatch: '#c9a227', glow: '#f2c14e', slug: 'bokshandschoenen-legion-octagon-kevlar-goud', img: img('kevlar-gold-pair') },
      { id: 'blue', name: 'Niebieskie', swatch: '#1d3f8f', glow: '#3d6bff', slug: 'bokshandschoenen-legion-octagon-kevlar-blauw', img: img('kevlar-blue-pair') },
      { id: 'white', name: 'Białe', swatch: '#ecebe8', glow: '#ff6a5a', slug: 'bokshandschoenen-legion-octagon-kevlar-wit', img: img('kevlar-white-pair') },
    ],
  },
  {
    id: 'kevlar-shin', name: 'Legion Octagon Kevlar', type: 'Ochraniacze piszczel + stopa', price: 59.99,
    text: 'Do kickboxingu – chronią piszczel i stopę przy low kickach i blokach.',
    variants: [
      { id: 'red', name: 'Czerwone', swatch: '#c8121b', glow: '#e3131c', slug: 'scheenbeschermers-legion-octagon-kevlar-rood', img: img('shin-kevlar-red-hero') },
      { id: 'black', name: 'Czarne', swatch: '#1c1a1b', glow: '#e3131c', slug: 'scheenbeschermers-legion-octagon-kevlar-zwart', img: img('shin-kevlar-black-hero') },
      { id: 'gold', name: 'Złote', swatch: '#c9a227', glow: '#f2c14e', slug: 'scheenbeschermers-legion-octagon-kevlar-goud', img: img('shin-kevlar-gold-hero') },
      { id: 'blue', name: 'Niebieskie', swatch: '#1d3f8f', glow: '#3d6bff', slug: 'scheenbeschermers-legion-octagon-kevlar-blauw', img: img('shin-kevlar-blue-hero') },
      { id: 'white', name: 'Białe', swatch: '#ecebe8', glow: '#ff6a5a', slug: 'scheenbeschermers-legion-octagon-kevlar-wit', img: img('shin-kevlar-white-hero') },
    ],
  },
  {
    id: 'guardox', name: 'Legion Octagon Guardox 2-in-1', type: 'Kask sparingowy', price: 49.99,
    text: 'Kask na sparingi w ringu – ochrona głowy, policzków i podbródka.',
    variants: [
      { id: 'black', name: 'Czarny', swatch: '#1c1a1b', glow: '#e3131c', slug: 'bokshelm-legion-octagon-guardox-diepzwart-2-in-1', img: img('guardox-black-hero') },
      { id: 'red', name: 'Ciemnoczerwony', swatch: '#8e0f16', glow: '#e3131c', slug: 'bokshelm-legion-octagon-guardox-donkerrood-2-in-1', img: img('guardox-red-hero') },
      { id: 'blue', name: 'Granatowy', swatch: '#1b2a55', glow: '#3d6bff', slug: 'bokshelm-legion-octagon-guardox-donkerblauw-2-in-1', img: img('guardox-blue-hero') },
    ],
  },
  {
    id: 'supreme', name: 'Legion Octagon Supreme 3 m', type: 'Owijki bokserskie', price: 19.99,
    text: 'Owijki na każdy trening – stabilizują nadgarstek i chronią kostki dłoni.',
    variants: [
      { id: 'red', name: 'Czerwone', swatch: '#c8121b', glow: '#e3131c', slug: 'boksbandages-legion-octagon-supreme-rood-3m', img: img('supreme-red-hero') },
      { id: 'black', name: 'Czarne', swatch: '#1c1a1b', glow: '#e3131c', slug: 'boksbandages-legion-octagon-supreme-zwart-zwart-3m', img: img('supreme-black-hero') },
      { id: 'blue', name: 'Granatowe', swatch: '#1d3f8f', glow: '#3d6bff', slug: 'boksbandages-legion-octagon-supreme-donkerblauw-3m', img: img('supreme-blue-hero') },
    ],
  },
];

export const eur = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;

/*
 * Kod rabatowy dla klubowiczów Bałagan Team w sklepie Octagon Sport NL.
 * UWAGA: kod musi być też aktywny w sklepie (CartPage.tsx w repo octagonsport.l).
 */
export const PROMO = { code: 'BALAGANKUBA', percent: 10 };
