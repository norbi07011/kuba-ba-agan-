import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clamp, isFinePointer, prefersReducedMotion } from '../../lib/motion';
import { onScrollFrame } from '../../lib/scrollLoop';

/*
 * Efekty „premium” wspólne dla całej strony:
 *  - Duo: jednolity filtr zdjęć (czerń, czerwień, ziarno) – zdjęcia z sali i plakatu wyglądają jak jedna sesja,
 *  - ImageReveal: zdjęcie odsłania się kurtyną (clip-path) i „oddala” z powiększenia, z lekkim parallaxem,
 *  - LineReveal: tekst wjeżdża słowo po słowie spod maski,
 *  - ScrollWords: manifest, w którym słowa zapalają się w rytmie przewijania,
 *  - HScroll: przypięta sekcja, w której przewijanie w dół przesuwa panele w bok,
 *  - Cursor: własny kursor z etykietą (tylko komputer),
 *  - PageCurtain: kurtyna przejścia między podstronami.
 * Wszystko jest widoczne „w spoczynku”: animacja startuje tylko dla elementów, które zaczynają poniżej ekranu.
 */

/** Wywołuje `enter`, gdy element wjedzie na ekran; zwraca false, jeśli od razu był widoczny (bez animacji). */
const useEnter = (ref: React.RefObject<HTMLElement | null>, margin = '-12%') => {
  const [state, setState] = useState<'rest' | 'pending' | 'in'>('rest');
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState('pending');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setState('in'); io.disconnect(); }
    }, { rootMargin: `99999px 0px ${margin} 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return state;
};

/* ---------- Duo: jednolity look zdjęć ---------- */
export const Duo: React.FC<{
  src: string;
  alt: string;
  pos?: string;
  mono?: boolean;
  className?: string;
  imgClassName?: string;
  fade?: 'bottom' | 'left' | 'right' | 'none';
  eager?: boolean;
}> = ({ src, alt, pos = '50% 50%', mono = true, className = '', imgClassName = '', fade = 'bottom', eager }) => (
  <div className={`duo relative overflow-hidden bg-[#120d0d] ${className}`}>
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      className={`h-full w-full object-cover ${imgClassName}`}
      style={{ objectPosition: pos, filter: mono ? 'grayscale(1) contrast(1.18) brightness(.82)' : 'contrast(1.08) brightness(.9)' }}
    />
    {mono && <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(227,19,28,.55), rgba(120,8,14,.25) 45%, transparent 70%)', mixBlendMode: 'soft-light' }} />}
    <span aria-hidden className="duo-grain pointer-events-none absolute inset-0" />
    {fade !== 'none' && (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            fade === 'bottom' ? 'linear-gradient(180deg, transparent 40%, rgba(11,9,9,.92) 100%)'
            : fade === 'left' ? 'linear-gradient(270deg, transparent 40%, rgba(11,9,9,.95) 100%)'
            : 'linear-gradient(90deg, transparent 40%, rgba(11,9,9,.95) 100%)',
        }}
      />
    )}
  </div>
);

/* ---------- ImageReveal: kurtyna + oddalenie + parallax ---------- */
export const ImageReveal: React.FC<{ children: React.ReactNode; className?: string; parallax?: number; delay?: number; from?: 'bottom' | 'left' | 'right' }> = ({
  children,
  className = '',
  parallax = 50,
  delay = 0,
  from = 'bottom',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const state = useEnter(ref);
  useEffect(() => {
    const el = ref.current, i = inner.current;
    if (!el || !i || !parallax || prefersReducedMotion()) return;
    return onScrollFrame(({ vh }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const p = (r.top + r.height / 2) / vh - 0.5;
      i.style.translate = `0 ${(p * parallax).toFixed(1)}px`;
    });
  }, [parallax]);
  const clip = { bottom: 'inset(100% 0 0 0)', left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)' }[from];
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        clipPath: state === 'pending' ? clip : 'inset(0 0 0 0)',
        transition: state === 'rest' ? undefined : `clip-path 1.3s cubic-bezier(.77,0,.18,1) ${delay}ms`,
      }}
    >
      <div
        ref={inner}
        className="absolute -inset-y-[8%] inset-x-0"
        style={{
          scale: state === 'pending' ? '1.28' : '1',
          transition: state === 'rest' ? undefined : `scale 1.9s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ---------- LineReveal: tekst wjeżdżający słowami spod maski ---------- */
export const LineReveal: React.FC<{ text: string; as?: 'p' | 'h2' | 'h3' | 'span'; className?: string; delay?: number; step?: number }> = ({
  text,
  as = 'p',
  className = '',
  delay = 0,
  step = 22,
}) => {
  const ref = useRef<HTMLElement>(null);
  const state = useEnter(ref, '-8%');
  const Tag = as as 'p';
  const words = text.split(' ');
  return (
    <Tag ref={ref as React.RefObject<HTMLParagraphElement>} className={`lr ${state === 'pending' ? 'lr-pending' : ''} ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span aria-hidden className="lr-w">
            <span className="lr-i" style={{ transitionDelay: state === 'rest' ? undefined : `${delay + Math.min(i, 40) * step}ms` }}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </Tag>
  );
};

/* ---------- ScrollWords: manifest zapalany przewijaniem ---------- */
export const ScrollWords: React.FC<{ text: string; accent?: string[]; className?: string }> = ({ text, accent = [], className = '' }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>('[data-w]'));
    spans.forEach(s => (s.style.opacity = '.16'));
    return onScrollFrame(({ vh }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25));
      const lit = p * spans.length * 1.05;
      spans.forEach((s, i) => {
        const o = clamp(lit - i, 0, 1);
        s.style.opacity = String(0.16 + o * 0.84);
      });
    });
  }, [text]);
  const acc = new Set(accent.map(a => a.toLowerCase()));
  return (
    <p ref={ref} className={className}>
      {text.split(' ').map((w, i, a) => (
        <React.Fragment key={i}>
          <span data-w className={`transition-opacity duration-300 ${acc.has(w.toLowerCase().replace(/[.,]/g, '')) ? 'text-blood' : ''}`}>{w}</span>
          {i < a.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </p>
  );
};

/* ---------- HScroll: przewijanie w dół przesuwa panele w bok ---------- */
export const HScroll: React.FC<{ children: React.ReactNode; className?: string; label: string; header?: React.ReactNode }> = ({ children, className = '', label, header }) => {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  const reduced = prefersReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const measure = () => {
      const t = track.current;
      if (!t) return;
      const extra = Math.max(0, t.scrollWidth - window.innerWidth);
      setH(window.innerHeight + extra);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    return onScrollFrame(({ vh }) => {
      const el = root.current, t = track.current;
      if (!el || !t) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const range = r.height - vh;
      const p = range > 0 ? clamp(-r.top / range) : 0;
      const extra = Math.max(0, t.scrollWidth - window.innerWidth);
      t.style.transform = `translate3d(${(-p * extra).toFixed(1)}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    });
  }, [reduced]);

  if (reduced) {
    return (
      <section aria-label={label} className={`py-16 ${className}`}>
        {header}
        <div className="thin-scroll mt-8 overflow-x-auto"><div className="flex w-max gap-6 px-4">{children}</div></div>
      </section>
    );
  }
  return (
    <section ref={root} aria-label={label} className={`relative ${className}`} style={{ height: h ?? '100svh' }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        {header}
        <div ref={track} className="mt-8 flex w-max gap-5 will-change-transform sm:gap-7" style={{ paddingLeft: 'max(16px, 4vw)', paddingRight: 'max(16px, 4vw)' }}>
          {children}
        </div>
        <div aria-hidden className="wrap mt-8">
          <div className="h-[2px] w-full bg-white/10"><div ref={bar} className="h-full origin-left bg-blood" style={{ transform: 'scaleX(0)' }} /></div>
        </div>
      </div>
    </section>
  );
};

/* ---------- Cursor: kółko podążające za myszą z etykietą ---------- */
export const Cursor: React.FC = () => {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    setOn(true);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0, big = false, visible = false;
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) scale(${big ? 1 : 0.42})`;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!visible) { visible = true; if (ring.current) ring.current.style.opacity = '1'; if (dot.current) dot.current.style.opacity = '1'; }
      const t = (e.target as HTMLElement | null)?.closest?.('a,button,[data-cursor],summary,input,textarea,label') as HTMLElement | null;
      const l = t?.closest('[data-cursor]')?.getAttribute('data-cursor') ?? '';
      big = !!t && !t.matches('input,textarea');
      setLabel(l);
    };
    const leave = () => { visible = false; if (ring.current) ring.current.style.opacity = '0'; if (dot.current) dot.current.style.opacity = '0'; };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); };
  }, []);
  if (!on) return null;
  return (
    <>
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[500] grid h-[86px] w-[86px] place-items-center rounded-full border border-white/70 opacity-0 transition-[opacity,background-color,border-color] duration-300" style={{ mixBlendMode: label ? 'normal' : 'difference', background: label ? '#e3131c' : 'transparent', borderColor: label ? '#e3131c' : undefined, transitionProperty: 'opacity, background-color, border-color' }}>
        <span className="cond text-[11px] font-bold uppercase tracking-[.2em] text-white">{label}</span>
      </div>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[501] h-1.5 w-1.5 rounded-full bg-white opacity-0" style={{ mixBlendMode: 'difference' }} />
    </>
  );
};

/* ---------- PageCurtain: kurtyna między podstronami ---------- */
export const PageCurtain: React.FC<{ phase: 'idle' | 'in' | 'out'; label: string }> = ({ phase, label }) => (
  <div aria-hidden className={`curtain curtain-${phase} pointer-events-none fixed inset-0 z-[260]`} style={{ visibility: phase === 'idle' ? 'hidden' : 'visible' }}>
    <div className="curtain-red absolute inset-0 bg-blood" />
    <div className="curtain-ink absolute inset-0 grid place-items-center bg-[#0b0909]">
      <div className="curtain-label flex flex-col items-center gap-3">
        <span className="eyebrow">Bałagan Team</span>
        <span className="display chrome text-[clamp(56px,10vw,140px)] leading-none">{label}</span>
      </div>
    </div>
  </div>
);
