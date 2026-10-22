import React, { useEffect, useRef, useState } from 'react';
import { MagneticLink } from '../fx/Kinetic';
import { TiltCard } from '../fx/ScrollFx';
import { ORBIT, OCTAGON_SHOP_URL, PROMO } from '../../data/octagon';
import { prefersReducedMotion } from '../../lib/motion';

/*
 * Kupon rabatowy Bałagan Team w sklepie Octagon Sport NL.
 * - bilet z perforacją i błyskiem przesuwającym się po powierzchni,
 * - „−10%” nabijane od zera, gdy kupon pojawi się na ekranie,
 * - produkty Octagon unoszące się wokół kuponu,
 * - kopiowanie kodu jednym kliknięciem + wybuch iskier z przycisku.
 */

/** Iskry wystrzeliwane z przycisku po skopiowaniu kodu (DOM + Web Animations, bez canvas). */
const burst = (from: HTMLElement) => {
  if (prefersReducedMotion()) return;
  const r = from.getBoundingClientRect();
  const colors = ['#e3131c', '#ff4a3d', '#f2c14e', '#ffffff'];
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span');
    const size = 4 + Math.random() * 6;
    Object.assign(s.style, {
      position: 'fixed', left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px`, width: `${size}px`, height: `${size * (Math.random() < 0.5 ? 1 : 0.5)}px`,
      background: colors[i % colors.length], zIndex: '9999', pointerEvents: 'none', borderRadius: Math.random() < 0.3 ? '50%' : '1px',
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2;
    const d = 60 + Math.random() * 110;
    s.animate(
      [
        { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 40}px)) scale(.4) rotate(${Math.random() * 540}deg)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.2,1)' }
    ).onfinish = () => s.remove();
  }
};

/** „−10%” nabijane od 0, gdy element wjedzie na ekran. W spoczynku pokazuje pełną wartość. */
const Percent: React.FC<{ to: number }> = ({ to }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / 1300, 1);
        setV(Math.round(to * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      setV(0);
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref} className="tabular-nums">−{v}%</span>;
};

export const CodeChip: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [copied, setCopied] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO.code);
      setCopied(true);
      if (btn.current) burst(btn.current);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const el = btn.current?.querySelector('[data-code]');
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s?.removeAllRanges(); s?.addRange(r); }
    }
  };
  return (
    <button
      ref={btn}
      type="button"
      onClick={copy}
      aria-label={`Skopiuj kod ${PROMO.code}`}
      className={`group relative inline-flex items-center gap-4 border-2 border-dashed border-white/40 bg-black/40 px-5 py-3 transition-colors hover:border-blood ${className}`}
    >
      <span data-code className="mono select-all text-[clamp(22px,3vw,32px)] font-bold tracking-[.14em] text-white">{PROMO.code}</span>
      <span className={`cond px-2.5 py-1 text-[12px] font-bold uppercase tracking-[.16em] transition-colors ${copied ? 'bg-[#25d366] text-[#0b2a17]' : 'bg-blood text-white'}`}>{copied ? 'Skopiowano ✓' : 'Kopiuj'}</span>
    </button>
  );
};

export const PromoTicket: React.FC = () => {
  const floaters = [ORBIT[0], ORBIT[2], ORBIT[1], ORBIT[3]];
  return (
    <section aria-labelledby="promo-title" className="relative overflow-hidden py-16 sm:py-24">
      {/* unoszące się produkty wokół kuponu */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {floaters.map((p, i) => (
          <img
            key={p.slug}
            src={p.img}
            alt=""
            className="bt-float absolute w-[22vw] max-w-[190px] opacity-80 drop-shadow-[0_24px_24px_rgba(0,0,0,.7)]"
            style={{
              left: ['2%', '84%', '6%', '80%'][i],
              top: ['8%', '4%', '68%', '64%'][i],
              ['--dur' as string]: `${5 + i * 0.7}s`,
              ['--delay' as string]: `${-i * 1.3}s`,
              ['--r0' as string]: `${i % 2 ? 8 : -12}deg`,
              ['--r1' as string]: `${i % 2 ? -4 : -2}deg`,
              filter: 'blur(.3px)',
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="wrap relative z-10">
        <TiltCard max={5} className="mx-auto max-w-[1040px]">
          <div
            className="bt-ticket relative grid overflow-hidden md:grid-cols-[.9fr_1.1fr]"
            style={{ background: 'linear-gradient(120deg, #b30f17 0%, #e3131c 45%, #7a0a0f 100%)' }}
          >
            {/* błysk przesuwający się po kuponie */}
            <span aria-hidden className="bt-ticket-shine pointer-events-none absolute inset-0" />
            {/* lewa część: procent */}
            <div className="relative flex flex-col justify-center p-7 sm:p-10" style={{ transform: 'translateZ(40px)' }}>
              <p className="cond text-[13px] font-bold uppercase tracking-[.3em] text-white/80">Tylko dla klubowiczów</p>
              <p className="display mt-1 text-[clamp(96px,16vw,190px)] leading-[.85] text-white" style={{ textShadow: '0 10px 40px rgba(0,0,0,.35)' }}>
                <Percent to={PROMO.percent} />
              </p>
              <p className="cond mt-2 text-[18px] font-bold uppercase tracking-[.16em] text-white">w sklepie Octagon Sport NL</p>
            </div>
            {/* perforacja */}
            <div aria-hidden className="pointer-events-none absolute bottom-0 top-0 hidden w-0 border-l-2 border-dashed border-white/40 md:block" style={{ left: '45%' }} />
            <div aria-hidden className="pointer-events-none absolute hidden h-10 w-10 -translate-x-1/2 rounded-full bg-[#0b0909] md:block" style={{ left: '45%', top: -20 }} />
            <div aria-hidden className="pointer-events-none absolute hidden h-10 w-10 -translate-x-1/2 rounded-full bg-[#0b0909] md:block" style={{ left: '45%', bottom: -20 }} />
            <div aria-hidden className="mx-7 border-t-2 border-dashed border-white/40 md:hidden" />
            {/* prawa część: kod */}
            <div className="relative flex flex-col justify-center gap-5 bg-black/25 p-7 sm:p-10" style={{ transform: 'translateZ(30px)' }}>
              <h2 id="promo-title" className="display text-[clamp(36px,4.4vw,56px)] leading-[1] text-white">Twój kod Bałagan Team</h2>
              <p className="text-[16px] leading-relaxed text-white/85">Trenujesz u nas? Kupujesz taniej. Wpisz kod w koszyku sklepu Octagon Sport NL i odbierz {PROMO.percent}% zniżki na sprzęt i odzież Legion Octagon.</p>
              <CodeChip className="self-start" />
              <ol className="grid gap-2 sm:grid-cols-3">
                {['Wybierz sprzęt', 'W koszyku wpisz kod', `Płacisz ${PROMO.percent}% mniej`].map((t, i) => (
                  <li key={t} className="flex items-center gap-2.5 text-[14px] font-semibold text-white">
                    <span className="display grid h-7 w-7 shrink-0 place-items-center bg-white text-[16px] text-blood">{i + 1}</span>{t}
                  </li>
                ))}
              </ol>
              <MagneticLink href={OCTAGON_SHOP_URL} target="_blank" rel="noopener noreferrer" variant="ghost" className="self-start border-white/60 text-white">
                Idź do sklepu
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M7 17L17 7M9 7h8v8" /></svg>
              </MagneticLink>
            </div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
};

/** Wąski pasek z kodem – do wstawienia między sekcjami. */
export const PromoStrip: React.FC<{ onMore?: () => void }> = ({ onMore }) => (
  <div className="relative overflow-hidden border-y border-blood/40" style={{ background: 'linear-gradient(90deg,#7a0a0f,#e3131c 50%,#7a0a0f)' }}>
    <span aria-hidden className="bt-ticket-shine pointer-events-none absolute inset-0" />
    <div className="wrap relative flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-4 text-center sm:justify-between sm:text-left">
      <p className="cond text-[16px] font-bold uppercase tracking-[.12em] text-white sm:text-[18px]">
        −{PROMO.percent}% w Octagon Sport NL z kodem <span className="mono ml-1 bg-black/40 px-2 py-0.5 tracking-[.14em]">{PROMO.code}</span>
      </p>
      {onMore && (
        <button type="button" onClick={onMore} className="cond text-[14px] font-bold uppercase tracking-[.16em] text-white underline decoration-2 underline-offset-[6px] hover:text-black">Szczegóły →</button>
      )}
    </div>
  </div>
);
