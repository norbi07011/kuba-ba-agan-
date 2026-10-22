/*
 * Jedna wspólna pętla requestAnimationFrame dla wszystkich efektów zależnych od przewijania
 * (parallax, sticky storytelling, marquee, wypełnianie napisu). Zamiast kilkunastu nasłuchiwaczy
 * `scroll` – jeden odczyt scrollY na klatkę, wygładzona prędkość i lista subskrybentów.
 * Pętla działa tylko, gdy ktoś słucha.
 */
type Fn = (s: { y: number; vel: number; vh: number; vw: number }) => void;

const subs = new Set<Fn>();
let raf = 0;
let last = typeof window !== 'undefined' ? window.scrollY : 0;
let vel = 0;

const tick = () => {
  const y = window.scrollY;
  vel += (y - last - vel) * 0.15;
  last = y;
  const s = { y, vel, vh: window.innerHeight, vw: window.innerWidth };
  subs.forEach(f => f(s));
  raf = subs.size ? requestAnimationFrame(tick) : 0;
};

export const onScrollFrame = (fn: Fn) => {
  subs.add(fn);
  if (!raf) raf = requestAnimationFrame(tick);
  return () => {
    subs.delete(fn);
    if (!subs.size && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
};

/** Postęp 0..1 przewijania elementu: 0 = góra elementu na górze ekranu, 1 = dół elementu na dole ekranu. */
export const pinProgress = (el: HTMLElement, vh: number) => {
  const r = el.getBoundingClientRect();
  const range = r.height - vh;
  return range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
};

/** Postęp przejścia elementu przez ekran: 0 = wchodzi od dołu, 1 = wychodzi górą. */
export const passProgress = (el: HTMLElement, vh: number) => {
  const r = el.getBoundingClientRect();
  return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
};
