import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

/*
 * Intro przy pierwszej wizycie (raz na sesję): napis BAŁAGAN TEAM składa się z rozżarzonych cząsteczek
 * (stalowe litery + czerwone TEAM), rozbłyskuje i rozpryskuje się, a strona odsłania się kołem.
 * ~2,5 s, kliknięcie = pominięcie. Przy „ograniczonym ruchu” nie pokazuje się wcale.
 */

const KEY = 'bt_intro_seen';

export const shouldShowIntro = () => {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false;
  try { return !sessionStorage.getItem(KEY); } catch { return false; }
};

interface P { x: number; y: number; tx: number; ty: number; d: number; s: number; red: boolean }

export const IntroOverlay: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'build' | 'reveal'>('build');
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* tryb prywatny */ }
    setPhase('reveal');
    window.dispatchEvent(new Event('bt:intro-reveal'));
    window.setTimeout(onDone, 900);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) { finish(); return; }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let parts: P[] = [];
    let start = performance.now();
    const portrait = H > W;
    const boxW = Math.min(W * 0.86, 900);

    const build = () => {
      // próbkujemy piksele napisu narysowanego fontem marki → punkty docelowe cząsteczek
      const off = document.createElement('canvas');
      const S = 420, SH = portrait ? 300 : 220;
      off.width = S; off.height = SH;
      const o = off.getContext('2d')!;
      o.textAlign = 'center';
      o.textBaseline = 'alphabetic';
      if (portrait) {
        o.font = '118px Anton, Impact, sans-serif';
        o.fillStyle = '#fff'; o.fillText('BAŁAGAN', S / 2, 128);
        o.font = '96px Anton, Impact, sans-serif';
        o.fillStyle = '#f00'; o.fillText('TEAM', S / 2, 236);
      } else {
        o.font = '112px Anton, Impact, sans-serif';
        o.fillStyle = '#fff'; o.fillText('BAŁAGAN', S / 2, 118);
        o.font = '64px Anton, Impact, sans-serif';
        o.fillStyle = '#f00'; o.fillText('TEAM', S / 2, 192);
      }
      const data = o.getImageData(0, 0, S, SH).data;
      const step = W < 700 ? 3 : 2;
      const scale = boxW / S;
      const pts: P[] = [];
      for (let y = 0; y < SH; y += step) for (let x = 0; x < S; x += step) {
        const i = (y * S + x) * 4;
        if (data[i + 3] < 130) continue;
        const a = Math.random() * Math.PI * 2;
        const rr = Math.max(W, H) * (0.55 + Math.random() * 0.6);
        pts.push({
          x: W / 2 + Math.cos(a) * rr,
          y: H / 2 + Math.sin(a) * rr,
          tx: W / 2 + (x - S / 2) * scale,
          ty: H / 2 + (y - SH / 2) * scale,
          d: Math.random() * 0.35,
          s: (0.9 + Math.random() * 1.5) * Math.max(1, scale * 0.9),
          red: data[i + 1] < 100,
        });
      }
      parts = pts;
      start = performance.now();
    };

    const fontReady = (document as Document & { fonts?: FontFaceSet }).fonts?.load('112px Anton') ?? Promise.resolve();
    Promise.race([fontReady, new Promise(r => setTimeout(r, 900))]).then(build, build);

    const ease = (t: number) => 1 - Math.pow(1 - t, 4);
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(11,9,9,0.34)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const flash = Math.max(0, 1 - Math.abs(t - 1.75) * 4);
      for (const p of parts) {
        const k = ease(Math.min(Math.max((t - p.d) / 1.3, 0), 1));
        let x = p.x + (p.tx - p.x) * k;
        let y = p.y + (p.ty - p.y) * k;
        if (t > 1.95) {
          const e = (t - 1.95) * 1.6;
          x += (p.tx - W / 2) * e * e * 2.4;
          y += (p.ty - H / 2) * e * e * 2.4;
        }
        if (p.red) ctx.fillStyle = `rgba(${227 + flash * 28},${19 + flash * 120},${28 + flash * 90},${0.5 + k * 0.5})`;
        else ctx.fillStyle = k > 0.98 ? `rgba(${200 + flash * 55},${204 + flash * 51},${210 + flash * 45},1)` : `rgba(227,19,28,${0.45 + k * 0.4})`;
        ctx.fillRect(x, y, p.s, p.s);
      }
      if (flash > 0) {
        const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, boxW * 0.6);
        g.addColorStop(0, `rgba(227,19,28,${0.38 * flash})`);
        g.addColorStop(1, 'rgba(227,19,28,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      if (parts.length && t > 2.2) { finish(); return; }
      raf = requestAnimationFrame(loop);
    };
    ctx.fillStyle = '#0b0909';
    ctx.fillRect(0, 0, W, H);
    raf = requestAnimationFrame(loop);
    const safety = window.setTimeout(finish, 4200);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(safety); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="presentation"
      onClick={finish}
      className="fixed inset-0 z-[300] cursor-pointer"
      style={{
        background: '#0b0909',
        clipPath: phase === 'reveal' ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
        transition: 'clip-path 900ms cubic-bezier(.7,0,.2,1)',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <span className="eyebrow absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        Lelystad · Boks · Kickboxing · CrossFit
      </span>
    </div>
  );
};
