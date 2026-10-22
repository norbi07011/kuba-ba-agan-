import { setSignupMode } from '../../pages/SignupPage';
import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

export const NAV = [
  { id: 'treningi', label: 'Treningi' },
  { id: 'zapisy', label: 'Zapisy' },
  { id: 'grafik', label: 'Grafik' },
  { id: 'trener', label: 'Trener' },
  { id: 'sprzet', label: 'Sprzęt' },
  { id: 'partnerzy', label: 'Partnerzy' },
  { id: 'kontakt', label: 'Kontakt' },
]

export const Wordmark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`flex items-center gap-2.5 ${className}`}>
    <svg viewBox="0 0 40 44" className="h-9 w-8 shrink-0" aria-hidden>
      <path d="M20 1L38 7V24C38 34 30 40 20 43C10 40 2 34 2 24V7Z" fill="#141010" stroke="#e3131c" strokeWidth="2" />
      <text x="20" y="29" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="17" fill="#d6d8dc">BT</text>
    </svg>
    <span className="flex flex-col leading-none">
      <span className="display chrome text-[22px] tracking-[.02em]">Bałagan</span>
      <span className="cond text-[11px] font-800 font-extrabold uppercase italic tracking-[.32em] text-blood">Team · Lelystad</span>
    </span>
  </span>
);

export const Header: React.FC<{ onNav: (id: string) => void; onHome: () => void; active: string }> = ({ onNav, onHome, active }) => {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const last = useRef(0);

  // chowanie przy przewijaniu w dół, pokazywanie przy przewijaniu w górę
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const dy = y - last.current;
        if (Math.abs(dy) > 6) { setHidden(dy > 0 && y > 140); last.current = y; }
        setSolid(y > 30);
      });
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    if (!menu) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [menu]);

  const go = (id: string) => { setMenu(false); if (id === 'zapisy') setSignupMode('self'); onNav(id); };

  return (
    <>
      <header
        className="fixed inset-x-0 z-[70] transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          transform: hidden && !menu ? 'translateY(-110%)' : 'none',
          background: solid || menu ? 'rgba(11,9,9,.78)' : 'transparent',
          backdropFilter: solid ? 'blur(14px) saturate(1.3)' : undefined,
          WebkitBackdropFilter: solid ? 'blur(14px) saturate(1.3)' : undefined,
          borderBottom: `1px solid ${solid ? 'rgba(255,255,255,.07)' : 'transparent'}`,
        }}
      >
        <div className="wrap flex h-[68px] items-center justify-between gap-4">
          <button type="button" onClick={() => { setMenu(false); onHome(); }} aria-label="Bałagan Team – strona główna" className="text-left">
            <Wordmark />
          </button>
          <nav aria-label="Główna nawigacja" className="hidden items-center gap-1 lg:flex">
            {NAV.filter(n => n.id !== 'zapisy').map(n => (
              <button key={n.id} type="button" onClick={() => go(n.id)} aria-current={active === n.id ? 'page' : undefined} className={`group relative cond px-3.5 py-2 text-[15px] font-bold uppercase tracking-[.16em] transition-colors hover:text-white ${active === n.id ? 'text-white' : 'text-steel-dim'}`}>
                <span className="roll"><span>{n.label}</span><span aria-hidden>{n.label}</span></span>
                <span aria-hidden className={`absolute inset-x-3.5 bottom-1 h-[2px] origin-left bg-blood transition-transform duration-300 group-hover:scale-x-100 ${active === n.id ? 'scale-x-100' : 'scale-x-0'}`} />
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setSignupMode('self'); go('zapisy'); }}
              aria-current={active === 'zapisy' ? 'page' : undefined}
              className="cond inline-flex items-center gap-2 bg-blood px-4 py-2.5 text-[13px] font-bold uppercase tracking-[.14em] text-white transition hover:bg-ember hover:shadow-[0_10px_30px_-8px_rgba(227,19,28,.9)]"
            >
              <span className="hidden sm:inline">Zapisz się</span><span className="sm:hidden">Zapisy</span>
            </button>
            <button
              type="button"
              onClick={() => setMenu(m => !m)}
              aria-expanded={menu}
              aria-controls="bt-mobile-menu"
              aria-label={menu ? 'Zamknij menu' : 'Otwórz menu'}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 lg:hidden"
            >
              <span aria-hidden className="relative block h-3 w-5">
                <span className="absolute left-0 top-0 h-[2px] w-5 bg-steel transition-transform duration-300" style={{ transform: menu ? 'translateY(5px) rotate(45deg)' : 'none' }} />
                <span className="absolute bottom-0 left-0 h-[2px] w-5 bg-steel transition-transform duration-300" style={{ transform: menu ? 'translateY(-5px) rotate(-45deg)' : 'none' }} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="bt-mobile-menu"
        hidden={!menu}
        className="fixed inset-0 z-[65] lg:hidden"
        style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(227,19,28,.25), transparent 60%), #0b0909', paddingTop: 'calc(96px + env(safe-area-inset-top, 0px))', paddingLeft: 'var(--gutter-l)', paddingRight: 'var(--gutter-r)' }}
      >
        <nav aria-label="Menu mobilne" className="flex flex-col">
          {NAV.map((n, i) => (
            <button
              key={n.id + String(menu)}
              type="button"
              onClick={() => go(n.id)}
              className={`display border-b border-white/10 py-3.5 text-left text-[11.5vw] leading-none ${active === n.id ? 'text-blood' : 'text-steel'}`}
              style={prefersReducedMotion() ? undefined : { animation: `bt-swap .6s ${i * 60}ms cubic-bezier(.16,1,.3,1) both` }}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};
