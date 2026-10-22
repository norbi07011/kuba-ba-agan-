import React from 'react';
import { Parallax, Reveal, TiltCard } from '../fx/ScrollFx';
import { KineticText } from '../fx/Kinetic';
import { SITE } from '../../data/site';
import coachKid from '../../assets/media/coach-kid.jpg';
import teamRing from '../../assets/media/team-ring.jpg';
import teamMat from '../../assets/media/team-mat.jpg';
import poster from '../../assets/media/poster.jpg';

export const Coach: React.FC = () => (
  <section id="trener" aria-labelledby="trener-title" className="relative overflow-hidden py-20 sm:py-28">
    <div aria-hidden className="pointer-events-none absolute -right-[10%] top-0 h-[70%] w-[60%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(227,19,28,.18), transparent 65%)', filter: 'blur(40px)' }} />
    <div className="wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <Reveal className="relative">
        <div className="relative aspect-[4/5] max-w-full overflow-hidden border border-white/10">
          <Parallax speed={90} className="absolute -inset-y-[12%] inset-x-0">
            <img src={coachKid} alt="Trener Bałagan Team trzyma tarcze, młody zawodnik w gardzie" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: '62% 50%' }} />
          </Parallax>
          <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(11,9,9,.85))' }} />
          <p className="cond absolute bottom-5 left-5 right-5 text-[14px] font-semibold uppercase tracking-[.14em] text-steel">Trening na tarczach · praca 1vs1</p>
        </div>
        <div aria-hidden className="absolute -bottom-6 -right-3 hidden border border-blood bg-ink px-5 py-4 sm:block">
          <span className="display block text-[40px] leading-none text-blood">1vs1</span>
          <span className="display block text-[40px] leading-none text-white">2vs1</span>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p className="eyebrow">Trener</p>
        <h2 id="trener-title" className="display mt-3 text-[clamp(56px,9vw,128px)]">
          <span className="chrome block">Kuba</span>
          <span className="block text-blood text-[.42em] leading-tight tracking-[.04em]"><KineticText text="Bałagan Team Lelystad" stagger={22} /></span>
        </h2>
        <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-steel-dim">
          Na sali prowadzi Cię Kuba. Każdy zaczyna od techniki i bezpieczeństwa, a tempo dobiera się do człowieka – dzieci, dorośli, początkujący i zawodnicy trenują obok siebie. Dyscyplina, praca i wyniki to nie hasło z plakatu, tylko plan na każdy trening.
        </p>
        <blockquote className="mt-8 border-l-2 border-blood pl-5">
          <p className="display text-[clamp(28px,3.4vw,40px)] leading-[1.05] text-white">Discipline. Work. Results.</p>
          <footer className="cond mt-2 text-[13px] font-bold uppercase tracking-[.2em] text-steel-dim">Motto klubu</footer>
        </blockquote>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="cond text-[15px] font-bold uppercase tracking-[.14em] text-steel underline decoration-blood decoration-2 underline-offset-[6px] transition hover:text-white">Instagram {SITE.instagram.label}</a>
          <a href={SITE.facebook.url} target="_blank" rel="noopener noreferrer" className="cond text-[15px] font-bold uppercase tracking-[.14em] text-steel underline decoration-blood decoration-2 underline-offset-[6px] transition hover:text-white">Facebook {SITE.facebook.label}</a>
        </div>
      </Reveal>
    </div>
  </section>
);

/** Galeria z warstwami przesuwanymi w różnym tempie (parallax) i kartami 3D. */
export const Gallery: React.FC = () => (
  <section aria-labelledby="galeria-title" className="relative py-16 sm:py-24">
    <div className="wrap">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="galeria-title" className="display text-[clamp(48px,8vw,104px)]"><span className="chrome">To jest</span> <span className="text-blood">ekipa</span></h2>
        <p className="max-w-[36ch] text-steel-dim">Bez ego, z szacunkiem i dużą dawką potu. Tak wygląda Bałagan Team po treningu.</p>
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-12 md:gap-6">
        <Parallax speed={40} className="md:col-span-7">
          <Reveal>
            <TiltCard max={5} className="overflow-hidden border border-white/10">
              <img src={teamRing} alt="Zawodnicy Bałagan Team pozują przed ringiem w rękawicach" loading="lazy" className="aspect-[4/3] w-full max-w-full object-cover" />
            </TiltCard>
          </Reveal>
        </Parallax>
        <Parallax speed={140} className="md:col-span-5 md:mt-24">
          <Reveal delay={100}>
            <TiltCard max={5} className="overflow-hidden border border-white/10">
              <img src={poster} alt="Plakat Bałagan Team: treningi boks, kickboxing, crossfit, godziny otwarcia i kontakt" loading="lazy" className="aspect-[4/5] w-full max-w-full object-cover object-top" />
            </TiltCard>
          </Reveal>
        </Parallax>
        <Parallax speed={70} className="md:col-span-8 md:col-start-3 md:-mt-10">
          <Reveal delay={60}>
            <TiltCard max={5} className="overflow-hidden border border-white/10">
              <img src={teamMat} alt="Duża grupa treningowa Bałagan Team na czerwonej macie" loading="lazy" className="aspect-[16/9] w-full max-w-full object-cover" />
            </TiltCard>
          </Reveal>
        </Parallax>
      </div>
    </div>
  </section>
);
