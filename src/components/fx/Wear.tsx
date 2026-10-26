import React, { useEffect, useRef, useState } from 'react';
import { clamp, isFinePointer, prefersReducedMotion } from '../../lib/motion';

/*
 * Efekty dla odzieży Bałagan Team:
 *  - Garment3D: ubranie jako bryła 3D – przód i tył (backface), w środku kilka warstw sylwetki
 *    dających „grubość” materiału. Obrót sterowany z zewnątrz (kąt), przeciąganiem albo automatycznie.
 *  - Holo: holograficzny połysk przesuwający się po materiale (za kursorem lub w pętli).
 *  - Embers: iskry/żar unoszące się z dołu sceny (canvas 2D).
 *  - ScanReveal: ubranie „skanowane” czerwonym laserem przy wejściu na ekran.
 *  - Loupe: lupa powiększająca detal pod kursorem / palcem.
 */

export const Garment3D: React.FC<{
  front: string;
  back: string;
  alt: string;
  /** stały kąt w stopniach (gdy sterowany z zewnątrz); undefined = auto/drag */
  angle?: number;
  auto?: boolean;
  drag?: boolean;
  depth?: number;
  layers?: number;
  filter?: string;
  className?: string;
  holo?: boolean;
  onAngle?: (deg: number) => void;
}> = ({ front, back, alt, angle, auto = false, drag = false, depth = 18, layers = 6, filter, className = '', holo = true, onAngle }) => {
  const box = useRef<HTMLDivElement>(null);
  const spin = useRef<HTMLDivElement>(null);
  const st = useRef({ yaw: angle ?? -18, v: 0, drag: false, lastX: 0, idle: 0, t0: performance.now() });
  const cb = useRef(onAngle);
  cb.current = onAngle;

  useEffect(() => {
    if (angle === undefined) return;
    st.current.yaw = angle;
    if (spin.current) spin.current.style.transform = `rotateY(${angle}deg)`;
  }, [angle]);

  useEffect(() => {
    if (angle !== undefined) return;
    const el = box.current, s = spin.current;
    if (!el || !s) return;
    const reduced = prefersReducedMotion();
    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); });
    io.observe(el);
    function loop(now: number) {
      raf = 0;
      if (!visible) return;
      const k = st.current;
      if (!k.drag) {
        k.yaw += k.v; k.v *= 0.94;
        if (auto && !reduced && Math.abs(k.v) < 0.05) k.yaw += 0.35;
      }
      const t = (now - k.t0) / 1000;
      s!.style.transform = `rotateX(${reduced ? 0 : Math.sin(t * 1.1) * 3}deg) rotateY(${k.yaw}deg)`;
      cb.current?.(k.yaw);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    if (!drag) return () => { cancelAnimationFrame(raf); io.disconnect(); };
    const down = (e: PointerEvent) => { st.current.drag = true; st.current.lastX = e.clientX; st.current.v = 0; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { const k = st.current; if (!k.drag) return; const dx = e.clientX - k.lastX; k.lastX = e.clientX; k.yaw += dx * 0.55; k.v = dx * 0.55; };
    const up = () => { st.current.drag = false; };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    };
  }, [angle === undefined, auto, drag]); // eslint-disable-line react-hooks/exhaustive-deps

  const half = depth / 2;
  return (
    <div ref={box} className={`relative ${drag ? 'cursor-grab touch-pan-y active:cursor-grabbing' : ''} ${className}`} style={{ perspective: '1400px' }} role="img" aria-label={alt}>
      <div ref={spin} className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', transform: `rotateY(${angle ?? -18}deg)`, filter }}>
        {/* grubość: środkowe warstwy sylwetki */}
        {Array.from({ length: layers }, (_, i) => (
          <img key={i} src={front} alt="" aria-hidden draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain" style={{ transform: `translateZ(${half - ((i + 1) * depth) / (layers + 1)}px)`, filter: 'brightness(.12) saturate(.4)' }} />
        ))}
        {/* przód */}
        <div className="absolute inset-0" style={{ transform: `translateZ(${half}px)`, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <img src={front} alt="" draggable={false} className="h-full w-full select-none object-contain" />
          {holo && <Holo src={front} />}
        </div>
        {/* tył */}
        <div className="absolute inset-0" style={{ transform: `rotateY(180deg) translateZ(${half}px)`, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <img src={back} alt="" draggable={false} className="h-full w-full select-none object-contain" />
          {holo && <Holo src={back} />}
        </div>
      </div>
    </div>
  );
};

/** Połysk w kształcie ubrania (maska = to samo zdjęcie), przesuwa się w pętli. */
export const Holo: React.FC<{ src: string }> = ({ src }) => (
  <span
    aria-hidden
    className="holo pointer-events-none absolute inset-0"
    style={{ WebkitMaskImage: `url("${src}")`, maskImage: `url("${src}")`, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}
  />
);

/** Iskry unoszące się z dołu sceny. */
export const Embers: React.FC<{ color?: string; density?: number; className?: string }> = ({ color = '255,74,61', density = 1, className = '' }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || prefersReducedMotion()) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let W = 0, H = 0, raf = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const size = () => { W = c.offsetWidth; H = c.offsetHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const n = Math.round((W < 640 ? 34 : 70) * density);
    const mk = () => ({ x: Math.random() * W, y: H + Math.random() * H * 0.5, r: 0.6 + Math.random() * 2, v: 0.4 + Math.random() * 1.2, a: Math.random() * 6.28, life: 0.5 + Math.random() * 0.5 });
    const ps = Array.from({ length: n }, () => { const p = mk(); p.y = Math.random() * H; return p; });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); });
    io.observe(c);
    function tick() {
      raf = 0;
      if (!visible) return;
      ctx!.clearRect(0, 0, W, H);
      ctx!.globalCompositeOperation = 'lighter';
      for (const p of ps) {
        p.y -= p.v; p.a += 0.03; p.x += Math.sin(p.a) * 0.6;
        if (p.y < -10) Object.assign(p, mk());
        const fade = clamp(p.y / H) * p.life;
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(255,220,180,${fade})`);
        g.addColorStop(0.3, `rgba(${color},${fade * 0.8})`);
        g.addColorStop(1, `rgba(${color},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r * 4, 0, 6.28); ctx!.fill();
      }
      ctx!.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', size);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', size); };
  }, [color, density]);
  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
};

/** Skan laserem: ubranie pojawia się od góry do dołu za czerwoną linią, gdy wjedzie na ekran. */
export const ScanReveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'rest' | 'pending' | 'in'>('rest');
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    setState('pending');
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState('in'); io.disconnect(); } }, { rootMargin: '99999px 0px -15% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`scan ${state === 'pending' ? 'scan-pending' : ''} ${state === 'in' ? 'scan-in' : ''} ${/\babsolute\b/.test(className) ? '' : 'relative'} ${className}`} style={{ ['--sd' as string]: `${delay}ms` }}>
      <div className="scan-body h-full w-full">{children}</div>
      <span aria-hidden className="scan-line" />
    </div>
  );
};

/** Lupa: powiększenie detalu pod kursorem / palcem. */
export const Loupe: React.FC<{ src: string; alt: string; zoom?: number; className?: string }> = ({ src, alt, zoom = 2.4, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current, l = lens.current;
    if (!el || !l) return;
    const r = el.getBoundingClientRect();
    const x = clamp((e.clientX - r.left) / r.width), y = clamp((e.clientY - r.top) / r.height);
    l.style.opacity = '1';
    l.style.left = `${x * 100}%`;
    l.style.top = `${y * 100}%`;
    l.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
  };
  const leave = () => { if (lens.current) lens.current.style.opacity = '0'; };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} onPointerDown={move} onPointerUp={isFinePointer() ? undefined : leave} className={`group relative cursor-zoom-in touch-none overflow-hidden ${className}`} data-cursor="Zoom">
      <img src={src} alt={alt} loading="lazy" draggable={false} className="h-full w-full select-none object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      <div
        ref={lens}
        aria-hidden
        className="pointer-events-none absolute h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 opacity-0 shadow-[0_10px_40px_rgba(0,0,0,.7),0_0_0_4px_rgba(227,19,28,.6)] transition-opacity duration-200 sm:h-40 sm:w-40"
        style={{ backgroundImage: `url("${src}")`, backgroundSize: `${zoom * 100}%`, backgroundRepeat: 'no-repeat' }}
      />
    </div>
  );
};
