import React, { useEffect, useRef, useState } from 'react';
import { ShaderStage, type ShaderStageHandle } from '../fx/ShaderStage';
import { KineticText, MagneticButton, MagneticLink } from '../fx/Kinetic';
import { clamp, isFinePointer, lerp, usePrefersReducedMotion, useViewportWidth } from '../../lib/motion';
import { openStatus, waLink } from '../../data/site';
import { ORBIT, eur, octagonProductUrl, PROMO } from '../../data/octagon';
import logo from '../../assets/media/logo.jpg';

/*
 * HERO „ARENA” – przeniesione z ArenaHero sklepu Octagon Sport NL, z jedną zmianą:
 * w środku zamiast klatki oktagonu stoi godło Bałagan Team, a wokół niego po orbicie 3D
 * krążą te same produkty Octagon. Klik w produkt = jego karta w sklepie Octagon (nowa karta).
 *  - ciemna hala: dym WebGL, reflektory kołyszące się po scenie, kurz w świetle,
 *  - najechanie zwalnia orbitę i pokazuje nazwę + cenę, przewijanie przyspiesza ją i „wjeżdża kamerą”,
 *  - start po intrze (zdarzenie 'bt:intro-reveal') albo od razu przy kolejnej wizycie.
 */

const INTRO_KEY = 'bt_intro_seen';

/** Kurz w snopach światła (canvas 2D, lekki) – z ArenaHero. */
const Dust: React.FC<{ run: boolean }> = ({ run }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || !run) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let W = 0, H = 0, raf = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const size = () => { W = c.offsetWidth; H = c.offsetHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const n = W < 640 ? 40 : 80;
    const ps = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.8, v: 0.15 + Math.random() * 0.45, a: Math.random() * Math.PI * 2 }));
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); });
    io.observe(c);
    function tick() {
      raf = 0;
      if (!visible) return;
      ctx!.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.y -= p.v; p.a += 0.01; p.x += Math.sin(p.a) * 0.25;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        const lit = 1 - Math.min(Math.abs(p.x - W / 2) / (W * 0.45), 1);
        ctx!.globalAlpha = 0.12 + lit * 0.55;
        ctx!.fillStyle = lit > 0.5 ? '#ffd9b0' : '#ff8a8a';
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx!.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', size);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', size); };
  }, [run]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
};

export const Hero: React.FC<{ onNav: (id: string) => void; introPending: boolean }> = ({ onNav, introPending }) => {
  const reduced = usePrefersReducedMotion();
  const vw = useViewportWidth();
  const mobile = vw < 640;
  const tablet = vw < 1024;
  const [status] = useState(openStatus);

  const [play, setPlay] = useState(() => {
    if (reduced || !introPending) return true;
    try { return !!sessionStorage.getItem(INTRO_KEY); } catch { return true; }
  });
  useEffect(() => {
    if (play) return;
    const go = () => setPlay(true);
    window.addEventListener('bt:intro-reveal', go);
    const safety = window.setTimeout(go, 4800);
    return () => { window.removeEventListener('bt:intro-reveal', go); window.clearTimeout(safety); };
  }, [play]);

  const section = useRef<HTMLElement>(null);
  const emblem = useRef<HTMLDivElement>(null);
  const orbitEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const content = useRef<HTMLDivElement>(null);
  const bigWord = useRef<HTMLDivElement>(null);
  const stage = useRef<ShaderStageHandle>(null);
  const [hover, setHover] = useState(-1);
  const hoverRef = useRef(-1);
  hoverRef.current = hover;

  const items = mobile ? ORBIT.slice(0, 6) : ORBIT;
  const logoW = mobile ? Math.min(vw * 0.56, 230) : tablet ? 300 : 340; // godło w środku
  const R = mobile ? Math.min(vw * 0.42, 180) : tablet ? 320 : 420;   // promień orbity
  const ry = mobile ? 44 : 64;                                        // spłaszczenie orbity (perspektywa)
  const itemW = mobile ? 74 : tablet ? 108 : 126;
  const stageH = mobile ? 330 : tablet ? 420 : 440;

  // pętla: orbita produktów, pochylenie za myszą, „wjazd kamery” przy przewijaniu
  useEffect(() => {
    if (reduced) return;
    let raf = 0, running = true, visible = true;
    let mx = 0, my = 0, cx = 0, cy = 0, ang = 0, last = 0, speed = 1, intro = 0;
    const fine = isFinePointer();
    const onMove = (e: PointerEvent) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
    if (fine) window.addEventListener('pointermove', onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && running) raf = requestAnimationFrame(loop); });
    if (section.current) io.observe(section.current);
    const startAt = performance.now();
    function loop(now: number) {
      raf = 0;
      if (!running || !visible) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      const h = section.current?.offsetHeight || 1;
      const p = clamp(window.scrollY / h);
      cx += (mx - cx) * 0.05; cy += (my - cy) * 0.05;
      speed += ((hoverRef.current >= 0 ? 0.08 : 1 + p * 4) - speed) * 0.08;
      ang += dt * 0.22 * speed;
      intro = clamp((now - startAt - 700) / 1100); // produkty wlatują na orbitę
      const ease = 1 - Math.pow(1 - intro, 3);

      if (emblem.current) {
        emblem.current.style.transform = `translate(-50%, -50%) translate3d(${cx * 18}px, ${cy * 10 + p * h * 0.12}px, 0) rotateY(${cx * 10}deg) rotateX(${-cy * 6}deg) scale(${lerp(0.82, 1, ease) * (1 + p * 0.35)})`;
        emblem.current.style.opacity = String(Math.min(1, ease * 1.6));
      }
      const n = orbitEls.current.length;
      orbitEls.current.forEach((el, i) => {
        if (!el) return;
        const th = ang + (i / n) * Math.PI * 2;
        const rr = R * lerp(2.2, 1, ease);
        const x = Math.cos(th) * rr + cx * 30;
        const z = Math.sin(th); // -1 tył … 1 przód
        const y = z * ry + (mobile ? 40 : 56) + Math.sin(now / 900 + i) * 8 - p * 140;
        const s = lerp(0.62, 1.12, (z + 1) / 2) * (hoverRef.current === i ? 1.12 : 1);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${s}) rotate(${Math.sin(now / 1300 + i * 2) * 6}deg)`;
        el.style.zIndex = String(z > -0.05 ? 30 : 5);
        el.style.opacity = String(ease * (1 - p * 1.2));
        el.style.filter = z < -0.05 ? `blur(${(-z * 2.2).toFixed(1)}px) brightness(${(0.55 + (z + 1) * 0.3).toFixed(2)})` : 'none';
      });
      if (content.current) {
        content.current.style.transform = `translate3d(${cx * 14}px, ${-p * 160}px, 0)`;
        content.current.style.opacity = String(1 - p * 1.6);
      }
      if (bigWord.current) bigWord.current.style.transform = `translate3d(${-50 + cx * -4 - p * 30}%, -50%, 0)`;
      stage.current?.set({ focusX: 0.5 + cx * 0.2, focusY: 0.5, intensity: 0.75 + p * 0.6 });
      raf = requestAnimationFrame(loop);
    }
    if (play) raf = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('pointermove', onMove); };
  }, [play, reduced, R, ry, mobile]);

  const hovered = hover >= 0 ? items[hover] : null;
  const waiting = !play;

  return (
    <section
      ref={section}
      id="start"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden border-b border-white/10"
      style={{ paddingTop: 'calc(92px + env(safe-area-inset-top, 0px))', background: '#070505' }}
    >
      {/* dym WebGL + reflektory wolumetryczne */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <ShaderStage ref={stage} color="#e3131c" mode="hero" pulseKey={play ? 1 : 0} className="absolute inset-0" />
      </div>
      <div aria-hidden className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${play ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bt-spot-l absolute left-1/2 top-[-12%] h-[115%] w-[34%] origin-top bg-gradient-to-b from-white/[.12] via-white/[.04] to-transparent blur-2xl" style={{ clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)' }} />
        <div className="bt-spot-r absolute left-1/2 top-[-12%] h-[115%] w-[34%] origin-top bg-gradient-to-b from-[#ff3b45]/[.15] via-[#ff3b45]/[.05] to-transparent blur-2xl" style={{ clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)' }} />
      </div>
      <Dust run={play && !reduced} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 70% at 50% 58%, transparent 40%, rgba(0,0,0,.85) 100%)' }} />

      {/* ogromny napis w tle */}
      <div
        ref={bigWord}
        aria-hidden
        className={`display outline-text pointer-events-none absolute left-1/2 top-[60%] whitespace-nowrap leading-none transition-opacity duration-700 ${play ? 'opacity-100' : 'opacity-0'}`}
        style={{ fontSize: mobile ? '40vw' : 'min(26vw, 380px)', transform: 'translate3d(-50%,-50%,0)', willChange: 'transform' }}
      >
        LELYSTAD
      </div>

      <div className="wrap relative z-10 flex flex-col items-center">
        {/* nagłówek */}
        <div ref={content} className="relative z-40 flex flex-col items-center text-center" style={{ willChange: 'transform, opacity' }}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="eyebrow">Lelystad · Brugplein 2</span>
            <span className="cond inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-3 py-1 text-[13px] font-semibold uppercase tracking-[.12em] backdrop-blur">
              <span className={`relative h-2 w-2 rounded-full ${status.open ? 'bg-[#3ddc84]' : 'bg-blood'}`}>
                <span className={`absolute inset-0 rounded-full ${status.open ? 'bt-ping bg-[#3ddc84]' : ''}`} />
              </span>
              {status.text}
            </span>
          </div>
          <h1 id="hero-title" className="display mt-4 text-[clamp(64px,13vw,150px)] leading-[.86]" style={{ textShadow: '0 6px 40px rgba(0,0,0,.9)' }}>
            {waiting ? (
              <span className="opacity-0">Bałagan Team</span>
            ) : (
              <>
                <KineticText text="Bałagan" stagger={45} delay={120} charClassName={() => 'chrome'} />{' '}
                <span className="inline-block text-blood" style={{ transform: 'skewX(-9deg)', textShadow: '0 0 40px rgba(227,19,28,.45)' }}>
                  <KineticText text="Team" stagger={60} delay={480} />
                </span>
              </>
            )}
          </h1>
          <p className="cond mt-3 text-[clamp(15px,1.8vw,20px)] font-bold uppercase tracking-[.3em] text-steel">
            {waiting ? <span className="opacity-0">Discipline · Work · Results</span> : <KineticText text="Discipline · Work · Results" delay={760} stagger={16} />}
          </p>
        </div>

        {/* SCENA: godło Bałagan Team + orbita produktów Octagon */}
        <div className="relative w-full" style={{ height: stageH }}>
          <div className="absolute left-1/2 top-[50%] h-0 w-0" style={{ isolation: 'isolate' }}>
            {/* cień i poświata pod godłem */}
            <div aria-hidden className="absolute rounded-[50%] bg-black/80 blur-2xl" style={{ width: logoW * 1.5, height: logoW * 0.35, left: -logoW * 0.75, top: logoW * 0.42 }} />
            <div aria-hidden className="absolute rounded-full" style={{ width: logoW * 1.3, height: logoW * 1.3, left: -logoW * 0.65, top: -logoW * 0.65, background: 'radial-gradient(circle, rgba(227,19,28,.42), transparent 64%)', filter: 'blur(24px)' }} />
            {/* godło */}
            <div
              ref={emblem}
              className="absolute left-0 top-0"
              style={{ width: logoW, zIndex: 10, transform: 'translate(-50%, -50%)', opacity: reduced ? 1 : 0, willChange: 'transform, opacity' }}
            >
              <img
                src={logo}
                alt="Godło Bałagan Team Lelystad"
                width={900}
                height={898}
                draggable={false}
                className="block aspect-square w-full select-none object-cover"
                style={{ WebkitMaskImage: 'radial-gradient(circle at 50% 48%, #000 52%, transparent 70.5%)', maskImage: 'radial-gradient(circle at 50% 48%, #000 52%, transparent 70.5%)' }}
              />
            </div>
            {/* orbita produktów Octagon – link do karty produktu */}
            {items.map((it, i) => (
              <a
                key={it.slug}
                ref={el => { orbitEls.current[i] = el; }}
                href={octagonProductUrl(it.slug)}
                target="_blank"
                rel="noopener noreferrer"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(-1)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(-1)}
                aria-label={`${it.name}, ${eur(it.price)} – otwórz w sklepie Octagon Sport NL`}
                className="absolute left-0 top-0 cursor-pointer outline-none"
                style={{
                  width: itemW * it.w,
                  opacity: reduced ? 1 : 0,
                  transform: reduced
                    ? `translate3d(${Math.cos((i / items.length) * Math.PI * 2) * R}px, ${Math.sin((i / items.length) * Math.PI * 2) * ry + (mobile ? 40 : 56)}px, 0) translate(-50%,-50%)`
                    : undefined,
                  zIndex: reduced ? (Math.sin((i / items.length) * Math.PI * 2) > -0.05 ? 30 : 5) : undefined,
                  willChange: 'transform, opacity, filter',
                }}
              >
                <img
                  src={it.img}
                  alt=""
                  draggable={false}
                  className="block w-full select-none"
                  style={{ filter: `drop-shadow(0 18px 18px rgba(0,0,0,.7)) drop-shadow(0 0 ${hover === i ? 28 : 14}px rgba(227,19,28,${hover === i ? 0.75 : 0.35}))` }}
                />
              </a>
            ))}
          </div>

          {/* etykieta najechanego produktu */}
          <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            {hovered && (
              <div className="border border-white/15 bg-black/70 px-4 py-2 text-center backdrop-blur-md">
                <p className="cond text-[14px] font-bold uppercase tracking-wider text-white">{hovered.name}</p>
                <p className="mono text-[12px] text-ember">{eur(hovered.price)} · −{PROMO.percent}% z kodem {PROMO.code} →</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="relative z-40 mt-6 flex w-full flex-col items-center gap-3 pb-10 sm:w-auto sm:flex-row sm:pb-14">
          <MagneticLink href={waLink('Cześć! Chcę umówić trening w Bałagan Team.')} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            Umów trening
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </MagneticLink>
          <MagneticButton variant="ghost" onClick={() => onNav('grafik')} className="w-full sm:w-auto">Zobacz grafik</MagneticButton>
          <button type="button" onClick={() => onNav('sprzet')} className="mono flex items-center gap-1.5 text-[12px] uppercase tracking-widest text-steel-dim transition-colors hover:text-white sm:ml-3">
            Sprzęt Octagon <span className="text-blood">›</span>
          </button>
        </div>
      </div>
    </section>
  );
};
