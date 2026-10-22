import React from 'react';
import { PageHeader, NextPage, SectionTitle } from '../components/sections/PageHeader';
import { Story } from '../components/sections/Story';
import { Reveal } from '../components/fx/ScrollFx';
import { MagneticLink, MagneticButton } from '../components/fx/Kinetic';
import { Duo, ImageReveal, LineReveal } from '../components/fx/Premium';
import { DISCIPLINES, IMG, SESSION } from '../data/content';
import { waLink } from '../data/site';
import type { PageProps } from './types';
import { setSignupMode } from './SignupPage';

const FIRST = [
  { t: 'Napisz albo zadzwoń', d: 'Daj znać na WhatsApp, kiedy chcesz przyjść i czy masz już doświadczenie. Dobierzemy godzinę i grupę.' },
  { t: 'Przyjdź na salę', d: 'Brugplein 2 w Lelystad. Weź strój sportowy, wodę i ręcznik. Rękawice i owijki – zapytaj wcześniej, pomożemy.' },
  { t: 'Trenuj z nami', d: 'Rozgrzewka, technika, praca w parach. Trener pokaże wszystko od podstaw i dopasuje tempo do Ciebie.' },
];

const FAQ = [
  { q: 'Czy muszę mieć kondycję, żeby zacząć?', a: 'Nie. Kondycję budujesz na treningach. Na początku pracujesz we własnym tempie, a trener dopasowuje intensywność do Ciebie.' },
  { q: 'Czy będę od razu sparować?', a: 'Nie. Sparingi przychodzą dopiero wtedy, gdy technika i obrona są gotowe – zawsze kontrolowane, w kasku i z trenerem przy linach.' },
  { q: 'Co zabrać na pierwszy trening?', a: 'Wygodny strój sportowy, wodę i ręcznik. Jeśli nie masz rękawic ani owijek, napisz wcześniej – podpowiemy, co wybrać.' },
  { q: 'Boks czy kickboxing – co wybrać na start?', a: 'Jeśli chcesz skupić się na rękach, pracy nóg i obronie – boks. Jeśli chcesz pracować całym ciałem i dołożyć kopnięcia – kickboxing. Nie wiesz? Przyjdź na oba i zdecyduj po treningu.' },
  { q: 'Czy treningi są dla kobiet?', a: 'Tak. Na sali trenują kobiety i mężczyźni, a trener dopasowuje dobór par i intensywność do każdej osoby.' },
  { q: 'Od jakiego wieku dziecko może trenować?', a: 'Zapytaj trenera o grupę dla konkretnego wieku. Najprościej wypełnić formularz „Zapisy” – trener odpisze z propozycją.' },
  { q: 'Czym różni się trening personalny 1vs1 od 2vs1?', a: '1vs1 to trener tylko dla Ciebie. 2vs1 to trening we dwoje – z partnerem, przyjacielem albo dzieckiem – z tym samym indywidualnym podejściem.' },
  { q: 'Czy mogę trenować tylko CrossFit, bez walki?', a: 'Oczywiście. CrossFit to osobny trening siły i kondycji – nie musisz boksować, żeby z niego korzystać.' },
];

/** Rozdział jednej dyscypliny: duże zdjęcie trenującego + opis, lista umiejętności, dla kogo. */
const Chapter: React.FC<{ i: number; go: PageProps['go'] }> = ({ i, go }) => {
  const d = DISCIPLINES[i];
  const flip = i % 2 === 1;
  return (
    <article id={`d-${d.id}`} aria-labelledby={`t-${d.id}`} className="relative overflow-x-clip border-t border-white/10 py-20 sm:py-28">
      <span aria-hidden className={`display outline-text pointer-events-none absolute top-6 whitespace-nowrap text-[22vw] leading-none opacity-40 ${flip ? 'left-[-2vw]' : 'right-[-2vw]'}`}>{d.name}</span>
      <div className={`wrap relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className="relative">
          <ImageReveal className="aspect-[4/5] w-full max-w-full border border-white/10" from={flip ? 'right' : 'left'} parallax={60}>
            <Duo src={d.img} alt={`${d.name} – trening w Bałagan Team`} pos={d.imgPos} mono={false} className="h-full w-full" />
          </ImageReveal>
          <ImageReveal className={`absolute -bottom-10 hidden aspect-[4/3] w-[46%] border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] sm:block ${flip ? '-left-6' : '-right-6'}`} from="bottom" delay={250} parallax={20}>
            <Duo src={d.photo} alt="" pos={d.photoPos} className="h-full w-full" fade="none" />
          </ImageReveal>
          <span className="stroke-num display absolute -top-8 left-4 text-[120px] leading-none">{String(i + 1).padStart(2, '0')}</span>
        </div>
        <div className="min-w-0">
          <p className="mono text-[12px] uppercase text-ember">{d.tag}</p>
          <h2 id={`t-${d.id}`} className="display mt-3 text-[clamp(64px,9vw,140px)] leading-[.88] text-white">{d.name}</h2>
          <LineReveal as="p" text={d.lead} className="cond mt-5 text-[clamp(22px,2.2vw,28px)] font-semibold leading-snug text-steel" step={14} />
          {d.body.map(p => <p key={p.slice(0, 20)} className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-steel-dim">{p}</p>)}
          <div className="mt-8 grid gap-6 sm:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="eyebrow">Czego się nauczysz</p>
              <ul className="mt-3 flex flex-col gap-2">
                {d.learn.map(l => (
                  <li key={l} className="cond flex items-center gap-3 text-[16px] font-semibold uppercase tracking-[.06em] text-white">
                    <span aria-hidden className="h-[2px] w-4 bg-blood" />{l}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-l-2 border-blood pl-5">
              <p className="eyebrow">Dla kogo</p>
              <p className="mt-3 text-[15px] leading-relaxed text-steel">{d.forWho}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticLink href={waLink(`Cześć! Chcę umówić trening: ${d.name}.`)} target="_blank" rel="noopener noreferrer">Umów: {d.name}</MagneticLink>
            {i < 2 && <MagneticButton variant="ghost" onClick={() => { setSignupMode('child'); go('zapisy'); }}>Zapisz dziecko</MagneticButton>}
          </div>
        </div>
      </div>
    </article>
  );
};

export const TrainingPage: React.FC<PageProps> = ({ go }) => (
  <>
    <PageHeader
      eyebrow="Treningi"
      title="Boks, kickboxing"
      accent="i crossfit"
      bgWord="TRENINGI"
      img={IMG.kick}
      imgPos="45% 40%"
      imgAlt="Zawodnik wykonuje wysokie kopnięcie"
      intro="Trzy dyscypliny pod jednym dachem i treningi personalne 1vs1 oraz 2vs1. Zaczynasz od podstaw, a każdy kolejny krok – od owijek do sparingu – robisz z trenerem obok. Bez ego, z szacunkiem, na pełnych obrotach."
      meta={[{ k: 'Dyscypliny', v: 'Boks · Kick · CrossFit' }, { k: 'Personalne', v: '1vs1 · 2vs1' }, { k: 'Dla', v: 'dzieci i dorosłych' }]}
    />

    {/* spis dyscyplin */}
    <nav aria-label="Dyscypliny" className="sticky z-30 border-b border-white/10 bg-[#0b0909]/85 backdrop-blur-md" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="wrap thin-scroll flex gap-1 overflow-x-auto py-3">
        {DISCIPLINES.map(d => (
          <a key={d.id} href={`#d-${d.id}`} onClick={e => { e.preventDefault(); document.getElementById(`d-${d.id}`)?.scrollIntoView({ behavior: 'smooth' }); }} className="cond shrink-0 border border-white/10 px-4 py-2 text-[14px] font-bold uppercase tracking-[.14em] text-steel transition hover:border-blood hover:text-white">
            {d.name}
          </a>
        ))}
      </div>
    </nav>

    {DISCIPLINES.map((_, i) => <Chapter key={i} i={i} go={go} />)}

    {/* przebieg treningu */}
    <section aria-labelledby="przebieg" className="relative overflow-hidden border-t border-white/10 py-24 sm:py-32" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(227,19,28,.14), transparent 60%)' }}>
      <div className="wrap">
        <SectionTitle id="przebieg" eyebrow="Anatomia treningu" a="Tak zwykle" b="wygląda trening" text="Każdy trening ma swój rytm. Temat i intensywność zmieniają się z tygodnia na tydzień, ale szkielet zostaje – żebyś wiedział, czego się spodziewać." />
        <ol className="relative mt-16 grid gap-3 md:grid-cols-5">
          {SESSION.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 90} className="group relative border border-white/10 bg-[#0b0909] p-6 transition-colors duration-500 hover:bg-[#160f0f]">
              <span className="display block text-[64px] leading-none text-blood/90 transition-transform duration-500 group-hover:-translate-y-1">{i + 1}</span>
              <h3 className="display mt-6 text-[30px] leading-[1.05] text-white">{s.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-steel-dim">{s.d}</p>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-blood transition-transform duration-500 group-hover:scale-x-100" />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>

    <Story />

    {/* pierwszy trening */}
    <section aria-labelledby="pierwszy" className="py-24 sm:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <ImageReveal className="aspect-[4/3] w-full max-w-full border border-white/10" from="left">
          <Duo src={IMG.teamRing} alt="Ekipa Bałagan Team w rękawicach przy ringu" pos="50% 40%" className="h-full w-full" />
        </ImageReveal>
        <div>
          <SectionTitle id="pierwszy" eyebrow="Jak zacząć" a="Pierwszy trening" b="w 3 krokach" />
          <ol className="mt-10 flex flex-col">
            {FIRST.map((f, i) => (
              <Reveal as="li" key={f.t} delay={i * 110} className="flex gap-6 border-t border-white/10 py-6">
                <span className="display w-12 shrink-0 text-[56px] leading-none text-blood">{i + 1}</span>
                <span>
                  <span className="display block text-[30px] leading-[1.05] text-white">{f.t}</span>
                  <span className="mt-2 block text-steel-dim">{f.d}</span>
                </span>
              </Reveal>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <MagneticLink href={waLink('Cześć! Chcę umówić pierwszy trening w Bałagan Team.')} target="_blank" rel="noopener noreferrer">Umów pierwszy trening</MagneticLink>
            <MagneticButton variant="ghost" onClick={() => { setSignupMode('self'); go('zapisy'); }}>Zapisz się online</MagneticButton>
          </div>
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section aria-labelledby="faq" className="pb-24 sm:pb-32">
      <div className="wrap grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
        <div>
          <SectionTitle id="faq" eyebrow="Pytania" a="Zanim" b="przyjdziesz" />
          <p className="mt-6 max-w-[38ch] text-steel-dim">Nie ma tu Twojego pytania? Napisz na WhatsApp – odpowiadamy po polsku.</p>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQ.map(f => (
            <details key={f.q} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden">
                <span className="cond text-[19px] font-bold uppercase tracking-[.03em] text-white transition-colors group-hover:text-ember">{f.q}</span>
                <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 text-white transition-transform duration-500 group-open:rotate-[135deg] group-open:border-blood group-open:bg-blood">+</span>
              </summary>
              <p className="bt-swap max-w-[62ch] pb-5 text-[16px] leading-relaxed text-steel-dim">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
    <NextPage label="Następna strona" title="Zapisy" onGo={() => { setSignupMode('self'); go('zapisy'); }} img={IMG.personal} />
  </>
);
