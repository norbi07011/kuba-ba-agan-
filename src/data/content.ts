/*
 * Treści strony – dyscypliny, wartości, przebieg treningu, FAQ.
 * Zdjęcia: sesja klubu (src/assets/photos) i zdjęcia z sali (src/assets/media).
 */
import portrait from '../assets/photos/coach-portrait.webp';
import mitts from '../assets/photos/mitts-boks.webp';
import coachTalk from '../assets/photos/coach-talk.webp';
import tire from '../assets/photos/tire-flip.webp';
import kickPads from '../assets/photos/kick-pads.webp';
import kickSponsors from '../assets/photos/kick-sponsors.webp';
import punchSponsors from '../assets/photos/punch-sponsors.webp';
import wraps from '../assets/photos/hand-wraps.webp';
import kidsMitts from '../assets/photos/kids-mitts.webp';
import kidsTalk from '../assets/photos/kids-talk.webp';
import ropes from '../assets/photos/battle-ropes.webp';
import teamRing from '../assets/media/team-ring.jpg';
import teamMat from '../assets/media/team-mat.jpg';
import coachKid from '../assets/media/coach-kid.jpg';
import logo from '../assets/media/logo.jpg';

export const IMG = {
  portrait, mitts, coachTalk, tire, kickPads, kickSponsors, punchSponsors, wraps, kidsMitts, kidsTalk, ropes,
  teamRing, teamMat, coachKid, logo,
  // starsze nazwy – wskazują na nowe zdjęcia
  boxer: portrait, boks: mitts, kick: kickPads, crossfit: tire, personal: coachTalk,
};

export interface Discipline {
  id: string;
  name: string;
  tag: string;
  img: string;
  imgPos?: string;
  photo: string;
  photoPos?: string;
  lead: string;
  body: string[];
  learn: string[];
  forWho: string;
}

export const DISCIPLINES: Discipline[] = [
  {
    id: 'boks',
    name: 'Boks',
    tag: 'Ręce · praca nóg · obrona',
    img: mitts,
    imgPos: '45% 30%',
    photo: punchSponsors,
    photoPos: '50% 40%',
    lead: 'Szlachetna sztuka pięści. Najpierw technika i głowa, potem szybkość i siła.',
    body: [
      'Boks to coś więcej niż mocny cios. To praca nóg, która ustawia Cię we właściwym miejscu, garda, która chroni, i spokój, który pozwala myśleć, kiedy tętno skacze pod sufit.',
      'Na treningach zaczynamy od postawy i prostych, a kończymy na kombinacjach na tarczach, pracy na worku i – kiedy jesteś gotowy – kontrolowanym sparingu. Każdy ruch poprawia trener, więc od pierwszego dnia uczysz się dobrych nawyków.',
    ],
    learn: ['Postawa, garda i praca nóg', 'Proste, sierpowe i podbródkowe', 'Kombinacje na tarczach', 'Uniki, zejścia i kontry', 'Kondycja na pełne rundy'],
    forWho: 'Dla początkujących, którzy chcą się sprawdzić, i dla tych, którzy myślą o pierwszej walce.',
  },
  {
    id: 'kickboxing',
    name: 'Kickboxing',
    tag: 'Ręce + nogi',
    img: kickPads,
    imgPos: '55% 40%',
    photo: kickSponsors,
    photoPos: '50% 40%',
    lead: 'Ręce boksera, nogi kickboksera. Pełny arsenał i kondycja, która nie siada.',
    body: [
      'Kickboxing łączy techniki bokserskie z kopnięciami. Uczysz się low kicków, kopnięć na korpus i głowę oraz łączenia ich z rękami w płynne serie.',
      'To jeden z najbardziej wymagających treningów kondycyjnych – pracujesz całym ciałem, budujesz gibkość, równowagę i pewność siebie. Pracujemy na ochraniaczach, tarczach i w parach, zawsze z kontrolą.',
    ],
    learn: ['Kopnięcia: low, middle, high', 'Łączenie rąk i nóg w serie', 'Bloki, balans i dystans', 'Praca na tarczach i ochraniaczach', 'Kondycja walki'],
    forWho: 'Dla każdego, kto chce spalić najwięcej energii i nauczyć się walczyć na pełnym dystansie.',
  },
  {
    id: 'crossfit',
    name: 'CrossFit',
    tag: 'Siła · wytrzymałość',
    img: tire,
    imgPos: '40% 40%',
    photo: ropes,
    photoPos: '40% 40%',
    lead: 'Silnik, który ciągnie Cię przez ostatnią rundę. Siła, moc i oddech.',
    body: [
      'Treningi funkcjonalne z kettlebell, sztangą i ciężarem ciała. Obwody na czas, interwały i ćwiczenia, które przekładają się na codzienną sprawność – i na to, jak czujesz się w ringu.',
      'Każde ćwiczenie skalujemy do Twojego poziomu: zaczynasz od techniki ruchu, a ciężar i tempo dokładamy dopiero wtedy, gdy ruch jest czysty i bezpieczny.',
    ],
    learn: ['Technika martwego ciągu i swingów', 'Interwały i obwody czasowe', 'Siła całego ciała', 'Mobilność i stabilizacja', 'Wydolność na lata'],
    forWho: 'Dla zawodników, którzy chcą mocniejszego silnika, i dla osób, które po prostu chcą być w formie.',
  },
  {
    id: 'personalne',
    name: 'Personalne',
    tag: '1vs1 · 2vs1',
    img: coachTalk,
    imgPos: '50% 40%',
    photo: mitts,
    photoPos: '45% 30%',
    lead: 'Trener tylko dla Ciebie albo dla Was dwojga. Plan szyty na miarę celu.',
    body: [
      'Trening personalny 1vs1 to pełna uwaga trenera przez cały trening: technika poprawiana na bieżąco, tempo dopasowane do Ciebie i plan, który prowadzi prosto do celu.',
      'W formacie 2vs1 trenujecie we dwoje – z partnerem, przyjacielem albo dzieckiem. Ta sama indywidualna opieka, więcej motywacji i zabawy.',
    ],
    learn: ['Indywidualny plan', 'Szybszy postęp techniczny', 'Przygotowanie do walki', 'Redukcja wagi i kondycja', 'Termin ustalany z trenerem'],
    forWho: 'Dla osób z konkretnym celem, początkujących, którzy wolą zacząć na spokojnie, i par.',
  },
];

/** Typowy przebieg treningu – ogólny schemat, nie sztywny plan. */
export const SESSION = [
  { t: 'Rozgrzewka', d: 'Skakanka, mobilność, rozruch stawów. Ciało i głowa wchodzą w tryb treningu.' },
  { t: 'Technika', d: 'Jeden temat na trening – postawa, kombinacja albo obrona. Powtarzasz, aż wejdzie w krew.' },
  { t: 'Tarcze i worki', d: 'Technika pod presją czasu i tempa. Trener trzyma tarcze, Ty dokładasz siłę.' },
  { t: 'Kondycja', d: 'Rundy, interwały, praca całym ciałem. Tu rodzi się silnik na ostatnią rundę.' },
  { t: 'Wyciszenie', d: 'Rozciąganie i oddech. Wychodzisz zmęczony, ale z głową lżejszą niż przed treningiem.' },
];

export const VALUES = [
  { en: 'Discipline', pl: 'Dyscyplina', text: 'Przychodzisz, nawet gdy się nie chce. Szanujesz czas trenera, partnera z pary i swój. Dyscyplina to fundament, na którym stoi cała reszta.' },
  { en: 'Work', pl: 'Praca', text: 'Nie ma skrótów. Jest jeszcze jedna runda, jeszcze jedna seria, jeszcze jedno powtórzenie techniki. Pot na macie to waluta, którą płacisz za postęp.' },
  { en: 'Results', pl: 'Wyniki', text: 'Lepsza kondycja, czystsza technika, więcej pewności siebie – na ringu i poza nim. Wyniki przychodzą same, kiedy dwie pierwsze rzeczy są na miejscu.' },
];

export const MANIFEST =
  'Bałagan to nie chaos. To sala, w której zostawiasz wymówki przy drzwiach, owijasz dłonie i robisz jeszcze jedną rundę, kiedy wszystko w Tobie mówi stop. Dzieci, dorośli, początkujący i zawodnicy – jedna ekipa, jedna mata. Dyscyplina. Praca. Wyniki. Dokładnie w tej kolejności.';
