# Bałagan Team Lelystad – strona

Vite + React 19 + TypeScript + Tailwind 4. Bez bibliotek do animacji – wszystkie efekty są w `src/components/fx` i `src/lib`.

## Start
```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # dist/  → wrzuć na Netlify / Vercel
npm run build:single   # dist-single/index.html – jeden plik ze wszystkim
```

## Do uzupełnienia
- `src/data/octagon.ts` – produkty Octagon (zdjęcia, nazwy, ceny, slugi z repo octagonsport.l). Adres sklepu: `OCTAGON_SHOP_URL`, linki mają postać `/product/<slug>`.
- `src/data/site.ts` – link do Facebooka to wyszukiwarka; wstaw bezpośredni adres profilu.

## Gdzie co jest
- `lib/smoothScroll.ts` – inercyjne przewijanie (tylko komputer), `lib/scrollLoop.ts` – wspólna pętla scrolla
- `fx/ShaderStage.tsx` – WebGL dym + reflektory + pył, `fx/IntroOverlay.tsx` – logo z cząsteczek
- `fx/ScrollFx.tsx` – reveal, tilt, parallax, velocity marquee, progress bar, licznik, napis w stopce
- `fx/Kinetic.tsx` – kinetic typography, magnetic buttons, rolling numbers
- `sections/Hero.tsx` – arena z ArenaHero Octagon: produkty krążą wokół godła Bałagan Team
- `fx/Cutout.tsx` – zdjęcie produktu z grubością 3D
- `sections/Story.tsx` – sticky storytelling, `sections/Shop.tsx` – karuzela/orbita 3D z wyborem koloru

## Podstrony
`src/pages/` – Start, Treningi, Grafik, Trener, Sprzęt, Partnerzy, Kontakt. Adresy: `#treningi`, `#grafik`, `#trener`, `#sprzet`, `#partnerzy`, `#kontakt`.
Zmiana strony przez View Transitions API, działa „wstecz” w przeglądarce.

## Partnerzy
`src/data/partners.ts` – logo w `src/assets/partners/`. STAX Afbouw nie ma jeszcze linku (nie znalazłem strony firmy).

## Zapisy dzieci
`src/pages/SignupPage.tsx` – formularz układa wiadomość i otwiera WhatsApp klubu (+31 6 47125929, numer w `src/data/site.ts`). Nic nie jest zapisywane na serwerze.

## Kod rabatowy
`PROMO` w `src/data/octagon.ts` (BALAGANKUBA, 10%). Kod musi być też aktywny w koszyku sklepu Octagon (repo octagonsport.l, `src/pages/CartPage.tsx`).

## Premium
`src/components/fx/Premium.tsx` – kurtyna przejść między stronami, własny kursor, odsłanianie zdjęć, tekst wjeżdżający słowami, manifest podświetlany scrollem, poziome panele (HScroll), filtr zdjęć Duo.
Treści (dyscypliny, przebieg treningu, wartości, manifest): `src/data/content.ts`. Sylwetki trenujących wycięte z plakatu: `src/assets/athletes/`.

### Kod w koszyku sklepu Octagon (repo octagonsport.l, `src/pages/CartPage.tsx`)
```ts
} else if (code === 'BALAGANKUBA') {
  setAppliedPromo({ code, discount: Number((total * 0.10).toFixed(2)) });
```
Kod jest wielkość-liter-obojętny (koszyk zamienia wpis na wielkie litery), więc zadziała też „balagankuba”.
