import { OCTAGON_SHOP_URL } from './octagon';
import polExpert from '../assets/partners/pol-expert.webp';
import vanDedyk from '../assets/partners/van-dedyk.webp';
import legionOctagon from '../assets/partners/legion-octagon.webp';
import fitDiet from '../assets/partners/fit-diet.webp';
import stax from '../assets/partners/stax.webp';
import staxMono from '../assets/partners/stax-mono.webp';
import polExpertMono from '../assets/partners/pol-expert-mono.webp';
import fitDietMono from '../assets/partners/fit-diet-mono.webp';
import vanDedykMono from '../assets/partners/van-dedyk-mono.webp';
import legionOctagonMono from '../assets/partners/legion-octagon-mono.webp';

/*
 * Partnerzy Bałagan Team. Nowego partnera dodajesz, dopisując obiekt do listy.
 * Logo: src/assets/partners/ (webp/png). `plate` = kolor tła pod logo, `glow` = poświata karty w barwach marki.
 */
export interface PartnerLink { type: 'website' | 'instagram' | 'facebook' | 'phone' | 'maps' | 'shop'; url: string; label: string }
export interface Partner {
  id: string;
  name: string;
  role: string;
  city?: string;
  logo: string;
  /** białe logo na przezroczystym tle – do ciemnych sekcji */
  mono: string;
  plate: string;
  glow: string;
  lead: string;
  text: string;
  tags: string[];
  links: PartnerLink[];
  /** sponsor główny – wyróżniony na stronie głównej i na górze listy partnerów */
  sponsor?: boolean;
}

export const PARTNERS: Partner[] = [
  {
    id: 'stax',
    name: 'STAX Afbouw B.V.',
    role: 'Sponsor główny',
    sponsor: true,
    logo: stax,
    mono: staxMono,
    plate: '#ffffff',
    glow: 'rgba(30,140,80,.5)',
    lead: 'Sponsor główny Bałagan Team. Solidna robota – na budowie i na macie.',
    text: 'Firma wykończeniowa (afbouw) działająca w Holandii – prace wykończeniowe w budynkach, czyli etap, po którym surowa budowa zamienia się w gotowe wnętrze. Jako sponsor główny stoi za klubem najmocniej – dzięki takim firmom sala może rosnąć, a zawodnicy trenować w dobrych warunkach.',
    tags: ['Afbouw', 'Wykończenia wnętrz', 'Budownictwo'],
    links: [],
  },
  {
    id: 'legion-octagon',
    name: 'Legion Octagon',
    role: 'Partner sprzętowy',
    logo: legionOctagon,
    mono: legionOctagonMono,
    plate: '#0b0b0b',
    glow: 'rgba(227,19,28,.45)',
    lead: 'Rękawice, ochraniacze i kaski, w których trenujemy na sali.',
    text: 'Polska marka odzieży i sprzętu do sportów walki – boks, kickboxing, MMA i BJJ. W Holandii kupisz ją w sklepie Octagon Sport NL, tam też znajdziesz linię Legion Octagon Kevlar z naszej sekcji „Sprzęt”.',
    tags: ['Sprzęt fight', 'Fightwear', 'Kevlar', 'Dostawa w NL'],
    links: [{ type: 'shop', url: OCTAGON_SHOP_URL, label: 'octagonsport.nl' }],
  },
  {
    id: 'pol-expert',
    name: 'Pol-Expert',
    role: 'Partner · Księgowość',
    city: 'Lelystad',
    logo: polExpert,
    mono: polExpertMono,
    plate: '#ffffff',
    glow: 'rgba(176,96,110,.42)',
    lead: 'Księgowość w Holandii po polsku – z biurem w Lelystad, kilka minut od sali.',
    text: 'Biuro rachunkowe prowadzone przez Justynę Janiak. Kompleksowa księgowość w Holandii oraz pomoc w sprawach urzędowych i administracyjnych dla Polaków mieszkających w Holandii. Wizyty w biurze po wcześniejszym umówieniu, wycena jest bezpłatna.',
    tags: ['Księgowość', 'Administracja', 'Sprawy urzędowe', 'Bezpłatna wycena'],
    links: [
      { type: 'website', url: 'https://www.pol-expert.nl/', label: 'pol-expert.nl' },
      { type: 'facebook', url: 'https://www.facebook.com/profile.php?id=61573719968439', label: 'Pol-Expert' },
      { type: 'instagram', url: 'https://www.instagram.com/polexpert.nl', label: '@polexpert.nl' },
      { type: 'phone', url: 'tel:+31617417917', label: '+31 6 17417917' },
    ],
  },
  {
    id: 'fit-diet',
    name: 'Fit Diet Catering',
    role: 'Partner · Dieta pudełkowa',
    city: 'Holandia i Belgia',
    logo: fitDiet,
    mono: fitDietMono,
    plate: '#ffffff',
    glow: 'rgba(141,198,63,.4)',
    lead: 'Forma robi się na sali i w kuchni. Fit Diet ugotuje za Ciebie.',
    text: 'Catering dietetyczny z dostawą pod drzwi w Holandii i Belgii. Diety od Fit Balance i High Protein, przez Keto, po Fit Sport do 5000 kcal dla trenujących – jest też kuchnia polska. Posiłki przygotowują kucharze z dietetykami, Ty tylko podgrzewasz.',
    tags: ['Fit Sport', 'High Protein', 'Keto', 'Kuchnia polska'],
    links: [
      { type: 'website', url: 'https://www.fitdiet.nl/en', label: 'fitdiet.nl' },
      { type: 'instagram', url: 'https://www.instagram.com/fitdietcatering', label: '@fitdietcatering' },
      { type: 'facebook', url: 'https://www.facebook.com/fitdietcatering', label: 'Fit Diet Catering' },
    ],
  },
  {
    id: 'van-dedyk',
    name: 'Fietsenmakerij Van Dedyk',
    role: 'Partner · Serwis rowerowy',
    city: 'Almere',
    logo: vanDedyk,
    mono: vanDedykMono,
    plate: '#ffffff',
    glow: 'rgba(200,70,70,.38)',
    lead: 'Na trening najlepiej rowerem – a gdy coś się zepsuje, jest Van Dedyk.',
    text: 'Warsztat rowerowy (fietsenmakerij) w Almere, działający od 2015 roku. Naprawy i serwis rowerów, czyli wszystko, żeby rower znów jeździł jak trzeba. Adres: Markerkant 12, Almere.',
    tags: ['Naprawy rowerów', 'Serwis', 'Od 2015', 'Almere'],
    links: [
      { type: 'website', url: 'https://sites.google.com/view/dedykfietsenmaker', label: 'Strona warsztatu' },
      { type: 'maps', url: 'https://www.google.com/maps/search/?api=1&query=Dedyk+de+Fietsenmaker+Markerkant+12+Almere', label: 'Markerkant 12, Almere' },
    ],
  },
];
