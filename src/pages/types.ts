export const PAGES = ['start', 'treningi', 'zapisy', 'grafik', 'trener', 'sprzet', 'partnerzy', 'kontakt'] as const;
export type PageId = (typeof PAGES)[number];
export interface PageProps { go: (id: PageId) => void }
export const isPage = (s: string): s is PageId => (PAGES as readonly string[]).includes(s);

/** Tytuł karty przeglądarki dla każdej podstrony. */
export const PAGE_TITLE: Record<PageId, string> = {
  start: 'Bałagan Team Lelystad',
  treningi: 'Treningi · Bałagan Team',
  zapisy: 'Zapisy dzieci · Bałagan Team',
  grafik: 'Grafik · Bałagan Team',
  trener: 'Trener · Bałagan Team',
  sprzet: 'Sprzęt Octagon · Bałagan Team',
  partnerzy: 'Partnerzy · Bałagan Team',
  kontakt: 'Kontakt · Bałagan Team',
};
