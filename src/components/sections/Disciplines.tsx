import React from 'react';
import { Reveal, TiltCard, VelocityMarquee } from '../fx/ScrollFx';
import teamRing from '../../assets/media/team-ring.jpg';
import teamMat from '../../assets/media/team-mat.jpg';
import coachKid from '../../assets/media/coach-kid.jpg';
import crossfit from '../../assets/media/crossfit.jpg';

interface Card { title: string; tag: string; text: string; points: string[]; img?: string; alt?: string; art?: React.ReactNode; pos?: string }

const CARDS: Card[] = [
  {
    title: 'Boks', tag: 'Ręce · praca nóg · obrona',
    text: 'Postawa, garda, proste i haki, praca na tarczach i worku. Gdy jesteś gotowy – sparingi w ringu.',
    points: ['Technika od podstaw', 'Tarcze i worki', 'Sparingi kontrolowane'],
    img: teamRing, alt: 'Zawodnicy Bałagan Team w rękawicach przed ringiem', pos: '50% 40%',
  },
  {
    title: 'Kickboxing', tag: 'Ręce + nogi',
    text: 'Łączenie ciosów z kopnięciami, praca na ochraniaczach, kondycja walki. Dla początkujących i zaawansowanych.',
    points: ['Kopnięcia i kombinacje', 'Kondycja walki', 'Grupy mieszane'],
    img: teamMat, alt: 'Grupa treningowa Bałagan Team na macie', pos: '50% 45%',
  },
  {
    title: 'CrossFit', tag: 'Siła · wytrzymałość',
    text: 'Obwody z kettlebell, sztangą i ciężarem ciała. Budujesz siłę i kondycję, które przydadzą się też w ringu.',
    points: ['Treningi obwodowe', 'Kettlebell i sztanga', 'Skalowane do poziomu'],
    img: crossfit, alt: 'Trening CrossFit z plakatu Bałagan Team – martwy ciąg ze sztangą', pos: '50% 35%',
  },
  {
    title: 'Personalne', tag: '1vs1 · 2vs1',
    text: 'Trener tylko dla Ciebie albo dla Was dwojga. Plan pod Twój cel – technika, waga, przygotowanie do walki.',
    points: ['Indywidualny plan', 'Termin ustalasz z trenerem', 'Szybszy postęp'],
    img: coachKid, alt: 'Trener prowadzi trening na tarczach z młodym zawodnikiem', pos: '60% 50%',
  },
];

export const Disciplines: React.FC = () => (
  <section id="treningi" aria-labelledby="treningi-title" className="relative py-20 sm:py-28">
    <div className="wrap">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Treningi</p>
          <h2 id="treningi-title" className="display mt-3 text-[clamp(48px,8vw,104px)]">
            <span className="chrome">Wybierz</span> <span className="text-blood">swoją walkę</span>
          </h2>
        </div>
        <p className="max-w-[40ch] text-steel-dim">Trzy dyscypliny pod jednym dachem i treningi personalne. Pierwszy krok jest najtrudniejszy – resztę robimy razem.</p>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} delay={i * 90}>
            <TiltCard className="group h-full overflow-hidden border border-white/10 bg-ink-2">
              <div className="relative aspect-[4/3.4] max-w-full overflow-hidden">
                {c.img ? (
                  <img src={c.img} alt={c.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.07]" style={{ objectPosition: c.pos, filter: 'saturate(.85) contrast(1.05)' }} />
                ) : c.art}
                <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 45%, #141010 100%)' }} />
                <span className="cond absolute left-4 top-4 bg-blood px-2.5 py-1 text-[12px] font-bold uppercase tracking-[.16em] text-white">{c.tag}</span>
              </div>
              <div className="relative p-6" style={{ transform: 'translateZ(30px)' }}>
                <h3 className="display text-[44px] text-white">{c.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-steel-dim">{c.text}</p>
                <ul className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4">
                  {c.points.map(p => (
                    <li key={p} className="cond flex items-center gap-2.5 text-[15px] font-semibold uppercase tracking-[.08em] text-steel">
                      <span aria-hidden className="h-[2px] w-3 bg-blood" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const Marquees: React.FC = () => (
  <div className="relative overflow-hidden border-y border-white/10 bg-ink py-5 sm:py-7" style={{ boxShadow: 'inset 0 0 80px rgba(227,19,28,.08)' }}>
    <VelocityMarquee items={['Boks', 'Kickboxing', 'CrossFit', 'Treningi personalne', 'Lelystad']} className="text-[clamp(44px,8vw,96px)]" />
    <VelocityMarquee items={['Discipline', 'Work', 'Results', '1vs1', '2vs1']} direction={-1} outline className="mt-1 text-[clamp(44px,8vw,96px)]" />
  </div>
);
