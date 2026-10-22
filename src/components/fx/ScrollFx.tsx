import React, { useEffect, useRef, useState } from 'react';
import { clamp, isFinePointer, prefersReducedMotion } from '../../lib/motion';
import { onScrollFrame, passProgress } from '../../lib/scrollLoop';

/*
 * Efekty sterowane przewijaniem (bez bibliotek), przeniesione z OctagonSport i dopasowane:
 * - Reveal: element wjeżdża w 3D z rozmycia. Treść jest widoczna „w spoczynku” –
 *   ukrywamy tylko to, co startuje poniżej ekranu, więc nic nie zostaje niewidoczne bez JS.
 * - TiltCard: pochylenie za kursorem z odblaskiem (komputer) / pochylenie od przewijania (telefon)
 * - Parallax: przesunięcie warstwy zależne od pozycji na ekranie
 * - VelocityMarquee: pasek tekstu przyspieszający i wyginający się z tempem scrolla
 * - ScrollProgress, CountUp, FillText (wielki napis w stopce wypełniany przewijaniem)
 */

export const Reveal: React.FC<{ delay?: number; className?: string; children: React.ReactNode; as?: 'div' | 'li' | 'section' | 'article' }> = ({
  delay = 0,
  className = '',
  children,
  as = 'div',
}) => {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    // tylko elementy poniżej ekranu dostają stan „czeka” – to, co widać od razu, zostaje widoczne
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add('is-pending');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.remove('is-pending'); io.disconnect(); }
    }, { rootMargin: '99999px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as as 'div';
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={`bt-reveal ${className}`} style={{ ['--d' as string]: `${delay}ms` }}>
      {children}
    </Tag>
  );
};

export const TiltCard: React.FC<{ className?: string; children: React.ReactNode; max?: number; style?: React.CSSProperties }> = ({
  className = '',
  children,
  max = 8,
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const shine = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!isFinePointer()) {
      // telefon: karta delikatnie „przechyla się” w trakcie przewijania – efekt zostaje, tylko inaczej sterowany
      return onScrollFrame(({ vh }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2) / vh - 0.5; // -0.5..0.5
        el.style.transform = `perspective(900px) rotateX(${clamp(p * 14, -7, 7)}deg)`;
        if (shine.current) {
          shine.current.style.opacity = '1';
          shine.current.style.background = `linear-gradient(${160 + p * 40}deg, transparent 30%, rgba(255,255,255,.12) ${50 + p * 30}%, transparent 70%)`;
        }
      });
    }
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0, hovering = false;
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.transform = `perspective(1100px) rotateX(${-cy * max}deg) rotateY(${cx * max}deg)`;
      if (shine.current) {
        shine.current.style.background = `radial-gradient(520px circle at ${50 + cx * 50}% ${50 + cy * 50}%, rgba(255,255,255,.2), transparent 45%)`;
        shine.current.style.opacity = hovering ? '1' : '0';
      }
      if (hovering || Math.abs(cx) > 0.002 || Math.abs(cy) > 0.002) raf = requestAnimationFrame(loop);
      else { el.style.transform = ''; raf = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
      hovering = true;
      kick();
    };
    const leave = () => { tx = 0; ty = 0; hovering = false; kick(); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [max]);
  return (
    <div ref={ref} className={`relative will-change-transform ${className}`} style={{ transformStyle: 'preserve-3d', ...style }}>
      {children}
      <span ref={shine} aria-hidden className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500" style={{ mixBlendMode: 'screen' }} />
    </div>
  );
};

/** Warstwa przesuwana w pionie wraz z przewijaniem (speed: px na pełne przejście przez ekran). */
export const Parallax: React.FC<{ speed?: number; className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  speed = 120,
  className = '',
  children,
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    return onScrollFrame(({ vh }) => {
      const parent = el.parentElement || el;
      const r = parent.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const p = passProgress(parent, vh) - 0.5;
      el.style.transform = `translate3d(0, ${(-p * speed).toFixed(1)}px, 0)`;
    });
  }, [speed]);
  return <div ref={ref} className={`will-change-transform ${className}`} style={style}>{children}</div>;
};

export const VelocityMarquee: React.FC<{ items: string[]; direction?: 1 | -1; className?: string; outline?: boolean }> = ({
  items,
  direction = 1,
  className = '',
  outline = false,
}) => {
  const track = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    const box = wrap.current;
    if (!el || !box || prefersReducedMotion()) return;
    let x = 0, skew = 0;
    return onScrollFrame(({ vel, vh }) => {
      const r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const speed = 0.7 + Math.min(Math.abs(vel) * 0.35, 16);
      x -= speed * direction * (vel < -0.5 ? -1 : 1);
      const half = el.scrollWidth / 2;
      if (half > 0) { if (x <= -half) x += half; if (x > 0) x -= half; }
      skew += (clamp(-vel * 0.35, -12, 12) - skew) * 0.15;
      el.style.transform = `translate3d(${x}px,0,0) skewX(${skew}deg)`;
    });
  }, [direction]);

  const row = items.map((t, i) => (
    <span key={i} className="flex items-center">
      <span className={`display px-5 sm:px-9 ${outline ? 'outline-text' : 'chrome'}`}>{t}</span>
      <svg aria-hidden viewBox="0 0 20 20" className="h-[.32em] w-[.32em] shrink-0" fill="#e3131c">
        <path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" />
      </svg>
    </span>
  ));
  return (
    <div ref={wrap} className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden>
      <div ref={track} className="inline-flex will-change-transform">{row}{row}</div>
    </div>
  );
};

export const ScrollProgress: React.FC = () => {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    update();
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 z-[80] h-[3px]" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div ref={bar} className="h-full origin-left" style={{ background: 'linear-gradient(90deg,#8a0a10,#e3131c,#ff4a3d)', transform: 'scaleX(0)', boxShadow: '0 0 14px #e3131c' }} />
    </div>
  );
};

/** Licznik nabijany do wartości, gdy pojawi się na ekranie. W spoczynku (bez JS/ruchu) pokazuje wynik. */
export const CountUp: React.FC<{ to: number; suffix?: string; duration?: number; className?: string }> = ({ to, suffix = '', duration = 1600, className = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // już widoczny – zostaw wynik
    setV(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setV(Math.round(to * (1 - Math.pow(1 - t, 4))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { rootMargin: '99999px 0px -15% 0px' });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{v}{suffix}</span>;
};

/** Wielki napis, który wypełnia się kolorem w miarę przewijania (stopka). */
export const FillText: React.FC<{ lines: string[]; className?: string }> = ({ lines, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    return onScrollFrame(({ vh }) => {
      const r = el.getBoundingClientRect();
      // 0 gdy góra napisu wchodzi na dół ekranu, 1 gdy napis dochodzi do ~1/3 wysokości ekranu; linie po kolei
      const p = clamp((vh - r.top) / (r.height + vh * 0.55), 0, 1);
      lines.forEach((_, i) => el.style.setProperty(`--f${i}`, `${(clamp(p * lines.length - i, 0, 1) * 100).toFixed(2)}%`));
    });
  }, [lines.length]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={ref} className={`relative select-none ${className}`} aria-label={lines.join(' ')} role="img">
      {lines.map((l, i) => (
        <div key={i} className="relative leading-[.82]">
          <span aria-hidden className="display block outline-text" style={{ WebkitTextStroke: '1.5px rgba(214,216,220,.18)' }}>{l}</span>
          <span
            aria-hidden
            className="display absolute inset-0 block"
            style={{
              color: 'transparent',
              backgroundImage: 'linear-gradient(180deg,#ff4a3d 0%,#e3131c 45%,#7a0a0f 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              clipPath: `inset(0 calc(100% - var(--f${i}, 100%)) 0 0)`,
            }}
          >
            {l}
          </span>
        </div>
      ))}
    </div>
  );
};
