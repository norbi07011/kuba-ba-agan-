import React, { useEffect, useState } from 'react';
import { Hero } from '../components/sections/Hero';
import { Marquees } from '../components/sections/Disciplines';
import { PromoStrip, CodeChip } from '../components/sections/Promo';
import { Embers, Garment3D } from '../components/fx/Wear';
import { GARMENTS } from '../data/apparel';
import { SectionTitle } from '../components/sections/PageHeader';
import { PartnersShowcase } from '../components/sections/PartnersShowcase';
import { Reveal, TiltCard, CountUp } from '../components/fx/ScrollFx';
import { MagneticLink, MagneticButton } from '../components/fx/Kinetic';
import { Duo, HScroll, ImageReveal, LineReveal, ScrollWords } from '../components/fx/Premium';
import { DISCIPLINES, IMG, MANIFEST, VALUES } from '../data/content';
import { MODELS, PROMO } from '../data/octagon';
import { HOURS, SITE, nowInLelystad, openStatus, waLink } from '../data/site';
import type { PageId, PageProps } from './types';
import { setSignupMode } from './SignupPage';

/* ---------- manifest ---------- */
const Manifest: React.FC = () => (
  <section aria-labelledby="manifest" className="relative py-24 sm:py-36">
    <div className="wrap grid gap-12 lg:grid-cols-[.55fr_1.45fr] lg:gap-16">
      <div className="flex flex-col gap-6">
        <p id="manifest" className="eyebrow flex items-center gap-3"><span className="h-[2px] w-8 bg-blood" />Manifest klubu</p>
        <ImageReveal className="aspect-[3/4] w-full max-w-[360px] border border-white/10" parallax={60}>
          <Duo src={IMG.portrait} alt="Trener Kuba trzyma tarcze podczas treningu boksu" pos="50% 30%" mono={false} className="h-full w-full" />
        </ImageReveal>
        <p className="mono text-[12px] uppercase text-steel-dim">Brugplein 2 · Lelystad</p>
      </div>
      <ScrollWords
        text={MANIFEST}
        accent={['Dyscyplina', 'Praca', 'Wyniki']}
        className="display text-[clamp(34px,5.2vw,76px)] leading-[1.06] text-white"
      />
    </div>
  </section>
);

/* ---------- dyscypliny w poziomym pasku ---------- */
const DisciplineRail: React.FC<PageProps> = ({ go }) => (
  <HScroll
    label="Dyscypliny"
    header={
      <div className="wrap">
        <p className="eyebrow flex items-center gap-3"><span className="h-[2px] w-8 bg-blood" />Trzy dyscypliny · jedna ekipa</p>
        <h2 className="display mt-3 text-[clamp(40px,6vw,88px)] leading-[.95]"><span className="chrome">Wybierz</span> <span className="text-blood">swoją walkę</span></h2>
      </div>
    }
  >
    {DISCIPLINES.map((d, i) => (
      <article key={d.id} className="group relative h-[58svh] w-[78vw] shrink-0 overflow-hidden border border-white/10 sm:w-[46vw] lg:w-[34vw]" data-cursor="Zobacz">
        <button type="button" onClick={() => go('treningi')} className="absolute inset-0 text-left" aria-label={`${d.name} – zobacz treningi`}>
          <Duo src={d.img} alt="" pos={d.imgPos} mono={false} className="absolute inset-0 transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]" />
          <span className="stroke-num display absolute right-5 top-3 text-[clamp(70px,9vw,130px)] leading-none">{String(i + 1).padStart(2, '0')}</span>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="mono text-[12px] uppercase text-ember">{d.tag}</p>
            <h3 className="display mt-2 text-[clamp(52px,6vw,88px)] leading-none text-white">{d.name}</h3>
            <p className="mt-3 max-w-[38ch] text-[15px] text-steel">{d.lead}</p>
            <span className="cond mt-5 inline-flex items-center gap-2 text-[14px] font-bold uppercase tracking-[.16em] text-white">
              Poznaj trening <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </span>
          </div>
        </button>
      </article>
    ))}
    <article className="relative flex h-[58svh] w-[78vw] shrink-0 flex-col justify-between border border-blood/50 p-8 sm:w-[40vw] lg:w-[30vw]" style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(227,19,28,.45), transparent 60%), #141010' }}>
      <span className="display text-[clamp(70px,9vw,130px)] leading-none text-blood">GO.</span>
      <div>
        <h3 className="display text-[clamp(40px,4vw,64px)] leading-[1] text-white">Pierwszy krok jest najtrudniejszy</h3>
        <p className="mt-3 text-steel-dim">Resztę zrobimy razem. Zapisz się online na trening grupowy albo personalny – albo zapisz dziecko.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <MagneticLink href={waLink('Cześć! Chcę umówić pierwszy trening w Bałagan Team.')} target="_blank" rel="noopener noreferrer">Umów trening</MagneticLink>
          <MagneticButton variant="ghost" onClick={() => { setSignupMode('self'); go('zapisy'); }}>Zapisz się</MagneticButton>
        </div>
      </div>
    </article>
  </HScroll>
);


/* ---------- zapowiedź kolekcji odzieży ---------- */
const WearTeaser: React.FC<PageProps> = ({ go }) => {
  const pick = ['hoodie', 'jersey', 'rashguard'].map(id => GARMENTS.find(g => g.id === id)!);
  return (
    <section aria-labelledby="wear-teaser" className="relative isolate overflow-hidden border-y border-white/10 py-24 sm:py-32" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 60%, #2a0b0d, #0b0909 70%)' }}>
      <Embers className="-z-10" density={0.8} />
      <div className="wrap">
        <SectionTitle id="wear-teaser" eyebrow="Nowość · Kolekcja klubowa" a="Wear" b="the Team" text="Koszulki, rashguard, bluzy, komplety i dres Bałagan Team. Obracaj, oglądaj tył i detale. Komplet koszulka + spodenki 45 €, dres 70 € – zamów przez WhatsApp i odbierz na sali." />
        <div className="mt-12 grid grid-cols-3 items-end gap-2 sm:gap-6">
          {pick.map((g, i) => (
            <button key={g.id} type="button" onClick={() => go('kolekcja')} data-cursor="Kolekcja" className={`group relative block ${i === 1 ? 'z-10 -mb-4 scale-110' : 'opacity-90'}`} aria-label={`${g.name} – zobacz kolekcję`}>
              <div className="bt-float aspect-square w-full" style={{ ['--dur' as string]: `${5 + i * 0.6}s`, ['--delay' as string]: `${-i * 1.3}s`, ['--r0' as string]: '-2deg', ['--r1' as string]: '2deg' }}>
                <Garment3D front={g.front} back={g.back} alt={g.name} auto depth={14} layers={4} className="h-full w-full" />
              </div>
              <div aria-hidden className="mx-auto mt-1 h-4 w-1/2 rounded-[50%]" style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,.8), transparent)' }} />
              <span className="cond mt-3 block text-center text-[12px] font-bold uppercase tracking-[.14em] text-steel transition-colors group-hover:text-white sm:text-[15px]">{g.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <MagneticButton onClick={() => go('kolekcja')}>Zobacz kolekcję</MagneticButton>
        </div>
      </div>
    </section>
  );
};

/* ---------- wartości ---------- */
const Values: React.FC = () => (
  <section aria-labelledby="wartosci" className="relative py-24 sm:py-32">
    <div className="wrap">
      <SectionTitle id="wartosci" eyebrow="Na czym stoimy" a="Trzy słowa" b="z plakatu" text="Discipline, Work, Results – to nie hasło do druku. To sposób, w jaki prowadzimy każdy trening, od rozgrzewki po ostatnią rundę." />
      <ol className="mt-14 border-t border-white/10">
        {VALUES.map((v, i) => (
          <li key={v.en} className="group relative grid gap-4 border-b border-white/10 py-8 transition-colors duration-500 hover:bg-white/[.02] md:grid-cols-[90px_1fr_1.1fr] md:items-center md:gap-10 md:py-10">
            <span className="mono text-[14px] text-ember">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="display text-[clamp(56px,9vw,132px)] leading-[.9]">
              <span className="block text-white transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-4">{v.en}</span>
              <span className="cond block text-[clamp(16px,1.6vw,20px)] font-bold uppercase tracking-[.3em] text-blood">{v.pl}</span>
            </h3>
            <LineReveal text={v.text} className="max-w-[52ch] text-[17px] leading-relaxed text-steel-dim" step={10} />
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* ---------- bento ---------- */
const Today: React.FC = () => {
  const [now, setNow] = useState(nowInLelystad);
  const [st, setSt] = useState(openStatus);
  useEffect(() => { const t = setInterval(() => { setNow(nowInLelystad()); setSt(openStatus()); }, 30_000); return () => clearInterval(t); }, []);
  const today = HOURS.find(h => h.day === now.day)!;
  const pct = (h: number) => ((h - 8) / 13) * 100;
  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div>
        <p className="eyebrow">Dziś na sali · {today.label}</p>
        <p className={`display mt-3 text-[clamp(40px,4.4vw,64px)] leading-[1] ${st.open ? 'text-[#7df0b0]' : 'text-white'}`}>{st.open ? 'Otwarte' : 'Zamknięte'}</p>
        <p className="cond mt-2 text-[16px] font-semibold uppercase tracking-[.1em] text-steel-dim">{st.text}</p>
      </div>
      <div>
        <div className="relative h-10 bg-white/[.04]">
          {today.open && <div className="absolute inset-y-1.5" style={{ left: `${pct(today.open[0])}%`, width: `${pct(today.open[1]) - pct(today.open[0])}%`, background: 'linear-gradient(90deg,#b30f17,#ff4a3d)', boxShadow: '0 0 24px rgba(227,19,28,.5)' }} />}
          {now.hour >= 8 && now.hour <= 21 && <span className="absolute -inset-y-1 w-[2px] bg-white shadow-[0_0_10px_#fff]" style={{ left: `${pct(now.hour)}%` }} />}
        </div>
        <div className="mono mt-2 flex justify-between text-[11px] text-steel-dim"><span>8:00</span><span>14:00</span><span>21:00</span></div>
      </div>
    </div>
  );
};

const Bento: React.FC<PageProps> = ({ go }) => (
  <section aria-labelledby="bento" className="pb-24 pt-16 sm:pb-32">
    <div className="wrap">
      <SectionTitle id="bento" eyebrow="Wszystko w jednym miejscu" a="Klub" b="w pigułce" />
      <div className="mt-12 grid auto-rows-[minmax(260px,auto)] gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-3">
          <TiltCard max={4} className="h-full border border-white/10 bg-ink-2 p-7"><Today /></TiltCard>
        </Reveal>
        <Reveal delay={80} className="md:col-span-3">
          <TiltCard max={4} className="group h-full">
            <button type="button" onClick={() => { setSignupMode('self'); go('zapisy'); }} data-cursor="Zapisz" className="relative flex h-full min-h-[260px] w-full flex-col justify-end overflow-hidden border border-white/10 p-7 text-left">
              <Duo src={IMG.kidsMitts} alt="" pos="50% 35%" mono={false} className="absolute inset-0 transition-transform duration-[1.4s] group-hover:scale-105" />
              <span className="relative mono text-[12px] uppercase text-ember">Grupowe · personalne · dzieci</span>
              <span className="relative display mt-2 text-[clamp(40px,4.4vw,64px)] leading-[1] text-white">Zapisz się online →</span>
              <span className="relative mt-2 max-w-[40ch] text-[15px] text-steel">Siebie na trening grupowy lub personalny, albo dziecko na grupę. Formularz w minutę, wysyłka na WhatsApp.</span>
            </button>
          </TiltCard>
        </Reveal>
        <Reveal delay={60} className="md:col-span-2">
          <TiltCard max={5} className="group h-full">
            <button type="button" onClick={() => go('sprzet')} data-cursor="Sprzęt" className="relative flex h-full min-h-[260px] w-full flex-col justify-between overflow-hidden border border-blood/40 p-7 text-left" style={{ background: 'linear-gradient(140deg,#b30f17,#e3131c 50%,#7a0a0f)' }}>
              <span aria-hidden className="bt-ticket-shine absolute inset-0" />
              <img src={MODELS[0].variants[0].img} alt="" className="bt-float absolute -right-6 -top-4 w-[55%] max-w-[200px] drop-shadow-[0_20px_20px_rgba(0,0,0,.5)]" />
              <span className="relative display text-[clamp(64px,7vw,104px)] leading-none text-white">−{PROMO.percent}%</span>
              <span className="relative">
                <span className="cond block text-[15px] font-bold uppercase tracking-[.14em] text-white">Sprzęt Octagon z kodem</span>
                <span className="mono mt-1 inline-block bg-black/35 px-2 py-1 text-[18px] font-bold tracking-[.14em] text-white">{PROMO.code}</span>
              </span>
            </button>
          </TiltCard>
        </Reveal>
        <Reveal delay={120} className="md:col-span-2">
          <TiltCard max={5} className="group h-full">
            <button type="button" onClick={() => go('trener')} data-cursor="Poznaj" className="relative flex h-full min-h-[260px] w-full flex-col justify-end overflow-hidden border border-white/10 p-7 text-left">
              <Duo src={IMG.portrait} alt="" pos="50% 25%" mono={false} className="absolute inset-0 transition-transform duration-[1.4s] group-hover:scale-105" />
              <span className="relative mono text-[12px] uppercase text-ember">Trener</span>
              <span className="relative display mt-1 text-[clamp(40px,4vw,60px)] leading-none text-white">Kuba</span>
              <span className="relative mt-1 text-[14px] text-steel">Grupy i treningi 1vs1 · 2vs1</span>
            </button>
          </TiltCard>
        </Reveal>
        <Reveal delay={180} className="md:col-span-2">
          <a href={SITE.maps} target="_blank" rel="noopener noreferrer" data-cursor="Mapa" className="group relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden border border-white/10 bg-ink-2 p-7">
            <svg aria-hidden viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-60">
              <g stroke="#2a2222" strokeWidth="6" fill="none" strokeLinecap="round"><path d="M-10 100C40 90 80 95 120 75S180 40 210 45" /><path d="M60 -10L85 150" /><path d="M-10 35L210 65" /></g>
              <circle cx="140" cy="40" r="6" fill="#e3131c" /><circle cx="140" cy="40" r="6" fill="#e3131c" className="bt-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
            </svg>
            <span className="relative eyebrow">Lokalizacja</span>
            <span className="relative">
              <span className="display block text-[clamp(34px,3.4vw,48px)] leading-[1] text-white">{SITE.address.street}</span>
              <span className="cond block text-[16px] font-bold uppercase tracking-[.12em] text-steel">{SITE.address.zip} {SITE.address.city}</span>
              <span className="cond mt-3 inline-block text-[13px] font-bold uppercase tracking-[.16em] text-ember">Prowadź do sali →</span>
            </span>
          </a>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ---------- galeria w ruchu ---------- */
const PhotoStrip: React.FC = () => {
  const photos = [
    { src: IMG.kickPads, alt: 'Kopnięcie na tarcze trenera', pos: '50% 40%', mono: false },
    { src: IMG.kidsMitts, alt: 'Trener prowadzi trening boksu z dziećmi', pos: '45% 40%', mono: false },
    { src: IMG.teamRing, alt: 'Ekipa Bałagan Team przy ringu', pos: '50% 40%', mono: true },
    { src: IMG.tire, alt: 'Przewracanie opony na treningu siłowym', pos: '40% 40%', mono: false },
    { src: IMG.mitts, alt: 'Praca na tarczach z trenerem', pos: '45% 30%', mono: false },
    { src: IMG.ropes, alt: 'Liny treningowe – kondycja', pos: '35% 40%', mono: false },
    { src: IMG.kidsTalk, alt: 'Trener rozmawia z grupą dzieci', pos: '50% 40%', mono: false },
    { src: IMG.wraps, alt: 'Owijanie dłoni przed treningiem', pos: '50% 35%', mono: false },
  ];
  const row = (k: string) => photos.map((p, i) => (
    <figure key={k + i} className="relative h-[34vh] min-h-[220px] w-[60vw] shrink-0 overflow-hidden border border-white/10 sm:w-[34vw] lg:w-[24vw]">
      <Duo src={p.src} alt={k === 'b' ? '' : p.alt} pos={p.pos} mono={p.mono} className="h-full w-full" fade="none" />
    </figure>
  ));
  return (
    <section aria-label="Zdjęcia z sali" className="overflow-hidden py-6">
      <div className="bt-slide flex w-max gap-4">{row('a')}{row('b')}</div>
    </section>
  );
};

/* ---------- CTA ---------- */
const FinalCta: React.FC<PageProps> = ({ go }) => (
  <section aria-labelledby="start-cta" className="py-24 sm:py-32">
    <div className="wrap">
      <Reveal>
        <div className="relative grid overflow-hidden border border-blood/40 lg:grid-cols-[1.2fr_.8fr]" style={{ background: 'radial-gradient(ellipse at 0% 100%, rgba(227,19,28,.32), transparent 55%), #141010' }}>
          <div className="relative p-8 sm:p-14">
            <h2 id="start-cta" className="display text-[clamp(52px,8vw,124px)] leading-[.92]"><span className="chrome">Pierwszy trening?</span><br /><span className="text-blood">Zaczynamy.</span></h2>
            <LineReveal text="Napisz na WhatsApp, kiedy chcesz przyjść. Odpowiemy, co zabrać i o której będzie najlepiej. Bez zobowiązań, bez presji – po prostu przyjdź i spróbuj." className="mt-6 max-w-[52ch] text-[17px] text-steel-dim" step={10} />
            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticLink href={waLink('Cześć! Chcę umówić pierwszy trening w Bałagan Team.')} target="_blank" rel="noopener noreferrer">Umów trening</MagneticLink>
              <MagneticButton variant="ghost" onClick={() => go('kontakt')}>Kontakt</MagneticButton>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-px border border-white/10 bg-white/10">
              {[{ n: 6, l: 'dni w tygodniu' }, { n: 3, l: 'dyscypliny' }, { n: 2, l: 'formaty 1vs1 · 2vs1' }].map(x => (
                <div key={x.l} className="flex flex-col-reverse bg-[#141010] p-4">
                  <dt className="cond mt-1 text-[12px] font-semibold uppercase tracking-[.1em] text-steel-dim">{x.l}</dt>
                  <dd className="display text-[48px] leading-none text-white"><CountUp to={x.n} /></dd>
                </div>
              ))}
            </dl>
          </div>
          <ImageReveal className="relative min-h-[320px]" from="right" parallax={40}>
            <Duo src={IMG.coachTalk} alt="Trener tłumaczy technikę zawodnikom przy ringu" pos="50% 40%" mono={false} fade="left" className="h-full w-full" />
          </ImageReveal>
        </div>
      </Reveal>
    </div>
  </section>
);

export const HomePage: React.FC<PageProps & { introPending: boolean }> = ({ go, introPending }) => (
  <>
    <Hero onNav={id => go(id as PageId)} introPending={introPending} />
    <PromoStrip onMore={() => go('sprzet')} />
    <Manifest />
    <DisciplineRail go={go} />
    <Marquees />
    <WearTeaser go={go} />
    <Values />
    <PhotoStrip />
    <Bento go={go} />
    <PartnersShowcase onOpen={() => go('partnerzy')} />
    <section aria-label="Kod rabatowy" className="pb-4">
      <div className="wrap flex flex-col items-start gap-4 border-y border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="cond text-[18px] font-bold uppercase tracking-[.1em] text-white">Trenujesz u nas? Sprzęt Octagon taniej o {PROMO.percent}%:</p>
        <CodeChip />
      </div>
    </section>
    <FinalCta go={go} />
  </>
);
