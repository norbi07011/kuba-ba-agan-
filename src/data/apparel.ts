/*
 * Kolekcja odzieży Bałagan Team. Zdjęcia: mockupy klubu wycięte z tła (src/assets/wear).
 * Ceny: komplet (koszulka + spodenki) 45 €, dres (góra + dół) 70 €. Reszta – cena na zapytanie.
 * Zamówienie przez WhatsApp, odbiór na sali treningowej.
 */
const w = (n: string) => new URL(`../assets/wear/${n}.webp`, import.meta.url).href;

export interface Garment {
  id: string;
  name: string;
  type: string;
  tag: string;
  front: string;
  back: string;
  side?: string;
  /** dodatkowa część zestawu (np. spodenki do koszulki) */
  extra?: { front: string; back: string; label: string };
  lead: string;
  text: string;
  features: string[];
  sizes: string[];
  /** cena w euro; brak = cena na zapytanie */
  price?: number;
  glow: string;
  details: { img: string; label: string }[];
}

export const GARMENTS: Garment[] = [
  {
    id: 'jersey',
    name: 'Fight Jersey Grunge',
    type: 'Koszulka sportowa',
    tag: 'Bestseller na macie',
    front: w('jersey-front'),
    back: w('jersey-back'),
    lead: 'Godło klubu na piersi i plecach, czerwono-białe pociągnięcia jak ślady po rękawicach.',
    text: 'Koszulka, w której trenuje cała ekipa. Pełny nadruk sublimacyjny z dużą tarczą BAŁAGAN TEAM LELYSTAD z przodu i z tyłu, kontrastowe lamówki na rękawach i kołnierzu. Na trening, na zawody i po treningu.',
    features: ['Nadruk na całej powierzchni', 'Godło z przodu i z tyłu', 'Lamówki w kolorze klubu'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    glow: 'rgba(227,19,28,.55)',
    details: [{ img: w('d-storm-fabric'), label: 'Oddychająca siatka' }],
  },
  {
    id: 'rashguard',
    name: 'Rashguard Crown Edition',
    type: 'Rashguard',
    tag: 'Premium',
    front: w('rash-front'),
    back: w('rash-back'),
    lead: 'Dopasowany jak druga skóra. Z przodu tarcza z koroną, na plecach wielki monogram BT.',
    text: 'Rashguard do sparingów, grapplingu i ciężkich obwodów. Przylega do ciała, nie podwija się i nie krępuje ruchów. Z przodu niewielka tarcza Bałagan Team z koroną, na rękawach monogram BT, a na plecach pełne logo LELYSTAD.',
    features: ['Materiał rashguard premium', 'Raglanowe rękawy', 'Logo na piersi, rękawach i plecach'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    glow: 'rgba(200,205,215,.4)',
    details: [
      { img: w('d-rash-chest'), label: 'Tarcza na piersi' },
      { img: w('d-rash-sleeve'), label: 'Monogram na rękawie' },
      { img: w('d-rash-fabric'), label: 'Tkanina rashguard' },
    ],
  },
  {
    id: 'hoodie',
    name: 'Fight Night Zip Hoodie',
    type: 'Bluza z kapturem',
    tag: 'Na rozgrzewkę i po walce',
    front: w('hoodie-front'),
    back: w('hoodie-back'),
    lead: 'Z przodu haftowana naszywka, na plecach cała scena: klatka, rękawice i napis Boxing & Kickboxing.',
    text: 'Czarna bluza na zamek z kapturem – idealna na rozgrzewkę, dojazd na trening i chłodne wieczory po sparingu. Haftowana naszywka na piersi, napis BAŁAGAN TEAM wzdłuż rękawa i duży nadruk na plecach z rękawicami zawieszonymi na klatce.',
    features: ['Haftowana naszywka', 'Zamek na całej długości', 'Duży nadruk na plecach', 'Kaptur ze ściągaczem'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    glow: 'rgba(227,19,28,.5)',
    details: [
      { img: w('d-hoodie-patch'), label: 'Haftowana naszywka' },
      { img: w('d-hoodie-print'), label: 'Nadruk na plecach' },
    ],
  },
  {
    id: 'set',
    name: 'Lightning Set',
    type: 'Komplet: koszulka + spodenki',
    tag: '4 edycje kolorystyczne',
    price: 45,
    front: w('set-shirt-front'),
    back: w('set-shirt-back'),
    extra: { front: w('set-shorts-front'), back: w('set-shorts-back'), label: 'Spodenki' },
    lead: 'Komplet treningowy z błyskawicami i flagą na rękawie. „Together Stronger” na karku.',
    text: 'Koszulka i spodenki w jednym wzorze – na trening, zawody i wyjazdy całej drużyny. Lekki, szybkoschnący i oddychający materiał. Polska flaga na rękawie i spodenkach, napis TOGETHER STRONGER na karku. Dostępny w edycjach Red, Gray, Blue i Green.',
    features: ['Oddychający materiał', 'Szybkoschnący', 'Lekki', 'Wytrzymały'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    glow: 'rgba(227,19,28,.55)',
    details: [{ img: w('d-set-collar'), label: 'Metka na karku' }],
  },
  {
    id: 'storm',
    name: 'Storm Training Tee',
    type: 'Koszulka treningowa',
    tag: 'Codzienny trening',
    front: w('storm-front'),
    back: w('storm-back'),
    lead: 'Czarna baza, czerwone błyski na barkach i monogram BG na rękawach.',
    text: 'Koszulka na codzienny trening. Tarcza Bałagan Team Lelystad na piersi i plecach, monogram BG na rękawach i karku, siateczkowe wstawki na barkach dla lepszej wentylacji.',
    features: ['Siateczkowe wstawki', 'Monogram BG na rękawach', 'Czerwona lamówka przy kołnierzu'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    glow: 'rgba(227,19,28,.5)',
    details: [{ img: w('d-storm-fabric'), label: 'Siatka na barkach' }],
  },
  {
    id: 'tracksuit',
    name: 'Team Tracksuit Navy',
    type: 'Dres: bluza + spodnie',
    tag: 'Na wyjazdy i gale',
    price: 70,
    front: w('track-front'),
    back: w('track-back'),
    side: w('track-side'),
    lead: 'Granatowy dres z białymi lampasami – reprezentacyjny strój ekipy.',
    text: 'Dres, w którym drużyna jedzie na zawody, gale i wyjazdy. Rozpinana bluza ze stójką i spodnie z lampasami. Godło Bałagan Team na piersi, rękawie, nogawce i duże na plecach.',
    features: ['Bluza ze stójką na zamek', 'Białe lampasy', 'Godło na piersi, rękawie, nogawce i plecach'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    glow: 'rgba(60,110,230,.5)',
    details: [{ img: w('d-track-chest'), label: 'Godło na piersi' }],
  },
];

/** Edycje kolorystyczne Lightning Set – filtr CSS na czerwonej wersji. */
export const EDITIONS = [
  { id: 'red', name: 'Red Edition', filter: 'none', color: '#e3131c' },
  { id: 'gray', name: 'Gray Edition', filter: 'grayscale(1) brightness(1.08)', color: '#b9bcc4' },
  { id: 'blue', name: 'Blue Edition', filter: 'hue-rotate(218deg) saturate(1.25)', color: '#2f6bff' },
  { id: 'green', name: 'Green Edition', filter: 'hue-rotate(110deg) saturate(1.3) brightness(1.05)', color: '#3ddc5c' },
];

export const priceLabel = (g: Garment) => (g.price ? `€${g.price}` : 'Cena na zapytanie');
