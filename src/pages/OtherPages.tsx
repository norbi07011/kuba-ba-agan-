import React from 'react';
import { PageHeader, NextPage, SectionTitle } from '../components/sections/PageHeader';
import { Schedule } from '../components/sections/Schedule';
import { Coach } from '../components/sections/Coach';
import { Shop } from '../components/sections/Shop';
import { Contact } from '../components/sections/Contact';
import { PromoTicket } from '../components/sections/Promo';
import { Reveal, TiltCard } from '../components/fx/ScrollFx';
import { MagneticLink } from '../components/fx/Kinetic';
import { Duo, HScroll, ImageReveal, LineReveal } from '../components/fx/Premium';
import { IMG, VALUES } from '../data/content';
import { SITE, openStatus, waLink } from '../data/site';
import { MODELS, OCTAGON_SHOP_URL, PROMO, octagonProductUrl, eur } from '../data/octagon';
import type { PageProps } from './types';

/* =================== GRAFIK =================== */
export const SchedulePage: React.FC<PageProps> = ({ go }) => {
  const st = openStatus();
  return (
    <>
      <PageHeader
        eyebrow="Grafik"
        title="Godziny"
        accent="otwarcia"
        bgWord="GRAFIK"
        img={IMG.crossfit}
        imgPos="55% 40%"
        imgAlt="Zawodnik przy sztandze na treningu siłowym"
        intro="Sala działa od poniedziałku do soboty. Na wykresie od razu widzisz dzisiejszy dzień i aktualną godzinę w Lelystad – wiesz, czy jeszcze zdążysz na trening, zanim wyjdziesz z domu."
        meta={[{ k: 'Pon–Pt', v: '11:00–20:30' }, { k: 'Ostatni trening', v: 'start 19:00' }, { k: 'Sobota', v: '11:00–14:00' }, { k: 'Teraz', v: st.open ? 'Otwarte' : 'Zamknięte' }]}
      />
      <Schedule />
      <section aria-labelledby="planuj" className="pb-24 sm:pb-32">
        <div className="wrap">
          <SectionTitle id="planuj" eyebrow="Zaplanuj tydzień" a="Trenuj" b="regularnie" text="Postęp robi się powtarzalnością, nie jednym mocnym treningiem. Wybierz stałe dni i trzymaj się ich – ciało szybko załapie rytm." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { t: '2× w tygodniu', d: 'Dobry start. Uczysz się techniki, budujesz kondycję i masz czas na regenerację między treningami.', img: IMG.boks },
              { t: '3–4× w tygodniu', d: 'Dla tych, którzy złapali bakcyla. Łączysz walkę z CrossFitem i widzisz postęp z tygodnia na tydzień.', img: IMG.kick },
              { t: 'Personalnie', d: 'Trening 1vs1 lub 2vs1 umawiasz bezpośrednio z trenerem w godzinach otwarcia sali – pod Twój cel.', img: IMG.personal },
            ].map((x, i) => (
              <Reveal key={x.t} delay={i * 100}>
                <TiltCard max={5} className="group h-full overflow-hidden border border-white/10 bg-ink-2">
                  <div className="relative aspect-[16/10] max-w-full overflow-hidden">
                    <Duo src={x.img} alt="" mono={false} className="h-full w-full transition-transform duration-[1.2s] group-hover:scale-105" />
                  </div>
                  <div className="p-7">
                    <h3 className="display text-[40px] leading-none text-white">{x.t}</h3>
                    <p className="mt-3 text-steel-dim">{x.d}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Reveal className="border border-white/10 bg-ink-2 p-7 sm:p-10">
              <p className="eyebrow">Wskazówka</p>
              <h3 className="display mt-3 text-[clamp(36px,4vw,56px)] leading-[1] text-white">Przyjdź 10 minut wcześniej</h3>
              <p className="mt-4 text-steel-dim">Spokojnie się przebierzesz, owiniesz dłonie i zrobisz rozgrzewkę razem z grupą. W niedziele sala jest zamknięta – to dzień na regenerację, sen i dobre jedzenie.</p>
            </Reveal>
            <Reveal delay={120} className="relative overflow-hidden border border-blood/40 p-7 sm:p-10" >
              <span aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(227,19,28,.3), transparent 60%)' }} />
              <p className="relative eyebrow">Trening personalny</p>
              <h3 className="relative display mt-3 text-[clamp(36px,4vw,56px)] leading-[1] text-white">1vs1 i 2vs1 w Twoim terminie</h3>
              <p className="relative mt-4 text-steel-dim">Napisz, jaki masz cel i kiedy możesz – dopasujemy termin w godzinach otwarcia sali.</p>
              <MagneticLink className="relative mt-7" href={waLink('Cześć! Chcę umówić trening personalny w Bałagan Team.')} target="_blank" rel="noopener noreferrer">Umów trening personalny</MagneticLink>
            </Reveal>
          </div>
        </div>
      </section>
      <NextPage label="Następna strona" title="Trener" onGo={() => go('trener')} img={IMG.coachKid} />
    </>
  );
};

/* =================== TRENER =================== */
const APPROACH = [
  { t: 'Technika przed siłą', d: 'Najpierw czysty ruch, potem tempo i moc. Dobre nawyki z pierwszych treningów zostają na lata.' },
  { t: 'Bezpieczeństwo', d: 'Kontrolowane sparingi, dobór par do wagi i poziomu, ochraniacze i kask. Trenujemy mocno, ale z głową.' },
  { t: 'Indywidualne podejście', d: 'Każdy ma inny start i inny cel. Trener dopasowuje ćwiczenia, intensywność i tempo do konkretnej osoby.' },
  { t: 'Charakter', d: 'Ring uczy pokory, cierpliwości i pewności siebie. To przydaje się w szkole, w pracy i w życiu.' },
];

export const CoachPage: React.FC<PageProps> = ({ go }) => (
  <>
    <PageHeader
      eyebrow="Trener"
      title="Ludzie"
      accent="Bałagan Team"
      bgWord="TRENER"
      img={IMG.logo}
      imgPos="50% 30%"
      imgAlt="Trener Kuba z założonymi rękami na tle godła Bałagan Team"
      intro="Za każdym treningiem stoi człowiek, który zna Twoje imię, Twoje słabe strony i Twój cel. Poznaj trenera i ekipę, z którą będziesz pocić się na macie – od pierwszej rozgrzewki po ostatnią rundę."
      meta={[{ k: 'Trener', v: 'Kuba' }, { k: 'Prowadzi', v: 'Grupy · 1vs1 · 2vs1' }, { k: 'Instagram', v: SITE.instagram.label }]}
    />
    <Coach />
    <section aria-labelledby="podejscie" className="border-t border-white/10 py-24 sm:py-32">
      <div className="wrap">
        <SectionTitle id="podejscie" eyebrow="Jak pracujemy" a="Podejście" b="trenera" text="Cztery zasady, które widać na każdym treningu – niezależnie od tego, czy przychodzisz pierwszy raz, czy szykujesz się do walki." />
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {APPROACH.map((a, i) => (
            <Reveal key={a.t} delay={i * 90} className="group relative border border-white/10 bg-[#0b0909] p-7 transition-colors duration-500 hover:bg-[#160f0f]">
              <span className="mono text-[13px] text-ember">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="display mt-6 text-[34px] leading-[1.02] text-white">{a.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-steel-dim">{a.d}</p>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-blood transition-transform duration-500 group-hover:scale-x-100" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
    <HScroll
      label="Galeria"
      header={
        <div className="wrap">
          <p className="eyebrow flex items-center gap-3"><span className="h-[2px] w-8 bg-blood" />Galeria</p>
          <h2 className="display mt-3 text-[clamp(40px,6vw,88px)] leading-[.95]"><span className="chrome">To jest</span> <span className="text-blood">ekipa</span></h2>
        </div>
      }
    >
      {[
        { src: IMG.teamRing, alt: 'Zawodnicy Bałagan Team pozują przed ringiem w rękawicach', pos: '50% 40%', w: 'w-[86vw] sm:w-[60vw] lg:w-[46vw]', mono: true, cap: 'Przed ringiem' },
        { src: IMG.boxer, alt: 'Bokser w rękawicach Bałagan Team', pos: '40% 30%', w: 'w-[70vw] sm:w-[34vw] lg:w-[26vw]', mono: false, cap: 'Garda' },
        { src: IMG.teamMat, alt: 'Duża grupa treningowa Bałagan Team na czerwonej macie', pos: '50% 45%', w: 'w-[86vw] sm:w-[60vw] lg:w-[46vw]', mono: true, cap: 'Jedna mata' },
        { src: IMG.coachKid, alt: 'Trener trzyma tarcze, młody zawodnik w gardzie', pos: '60% 50%', w: 'w-[70vw] sm:w-[40vw] lg:w-[30vw]', mono: true, cap: 'Młodzi zawodnicy' },
        { src: IMG.kick, alt: 'Wysokie kopnięcie na treningu kickboxingu', pos: '45% 40%', w: 'w-[86vw] sm:w-[56vw] lg:w-[42vw]', mono: false, cap: 'Kickboxing' },
      ].map(p => (
        <figure key={p.cap} className={`group relative h-[58svh] shrink-0 overflow-hidden border border-white/10 ${p.w}`}>
          <Duo src={p.src} alt={p.alt} pos={p.pos} mono={p.mono} className="h-full w-full transition-transform duration-[1.4s] group-hover:scale-105" />
          <figcaption className="display absolute bottom-5 left-6 text-[clamp(36px,4vw,60px)] leading-none text-white">{p.cap}</figcaption>
        </figure>
      ))}
    </HScroll>
    <section aria-labelledby="motto" className="py-24 sm:py-32">
      <div className="wrap grid gap-6 md:grid-cols-3">
        {VALUES.map((v, i) => (
          <Reveal key={v.en} delay={i * 100} className="border-t-2 border-blood pt-6">
            <h3 id={i === 0 ? 'motto' : undefined} className="display text-[56px] leading-none text-white">{v.en}</h3>
            <p className="mt-4 text-steel-dim">{v.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
    <NextPage label="Następna strona" title="Sprzęt" onGo={() => go('sprzet')} img={IMG.boks} />
  </>
);

/* =================== SPRZĘT =================== */
const CARE = [
  { t: 'Wietrz rękawice', d: 'Po treningu otwórz rzep i wyjmij je z torby. Wilgoć zamknięta w środku to wróg skóry i pianki.' },
  { t: 'Pierz owijki', d: 'Owijki chłoną pot z każdego treningu – najlepiej prać je po każdym użyciu i suszyć rozwinięte.' },
  { t: 'Własny sprzęt', d: 'Własne rękawice i ochraniacze to higiena i wygoda. Dopasowują się do dłoni i nóg z każdym treningiem.' },
];

export const GearPage: React.FC<PageProps> = ({ go }) => (
  <>
    <PageHeader
      eyebrow="Sprzęt"
      title="Sprzęt"
      accent="Legion Octagon"
      bgWord="OCTAGON"
      img={IMG.boks}
      imgPos="40% 40%"
      imgAlt="Bokser w rękawicach Bałagan Team"
      intro={`Trenujemy w sprzęcie Legion Octagon. Obróć karuzelę, wybierz kolor i kliknij produkt – otworzy się jego karta w sklepie Octagon Sport NL. Z kodem ${PROMO.code} zapłacisz ${PROMO.percent}% mniej.`}
      meta={[{ k: 'Kod', v: PROMO.code }, { k: 'Rabat', v: `−${PROMO.percent}%` }, { k: 'Sklep', v: 'octagonsport.nl' }]}
    />
    <PromoTicket />
    <Shop />
    <section aria-labelledby="na-start" className="pb-24 sm:pb-32">
      <div className="wrap">
        <SectionTitle id="na-start" eyebrow="Zestaw startowy" a="Co kupić" b="na początek?" text="Nie musisz kupować wszystkiego od razu. Te trzy rzeczy wystarczą na pierwsze miesiące – kask dokładasz, gdy zaczynasz sparingi." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { m: MODELS[3], why: 'Pierwsza rzecz do torby. Chronią nadgarstki i kostki dłoni na każdym treningu.' },
            { m: MODELS[0], why: 'Do worka, tarcz i sparingu. Na start najczęściej 12–14 oz – zapytaj trenera o dobór.' },
            { m: MODELS[1], why: 'Na kickboxing – piszczel i stopa bezpieczne przy kopnięciach i blokach.' },
          ].map(({ m, why }, i) => {
            const v = m.variants[0];
            return (
              <Reveal key={m.id} delay={i * 100}>
                <TiltCard max={6} className="group h-full">
                  <a href={octagonProductUrl(v.slug)} target="_blank" rel="noopener noreferrer" data-cursor="Kup" className="relative flex h-full flex-col overflow-hidden border border-white/10 bg-ink-2">
                    <div className="relative grid aspect-[4/3] max-w-full place-items-center overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 60%, rgba(227,19,28,.35), transparent 65%), #120d0d' }}>
                      <img src={v.img} alt={`${m.type} ${m.name}`} loading="lazy" className="bt-float h-[78%] w-[78%] object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,.7)]" style={{ ['--dur' as string]: `${4.4 + i * 0.6}s` }} />
                      <span className="cond absolute left-4 top-4 bg-blood px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.16em] text-white">−{PROMO.percent}% z kodem</span>
                    </div>
                    <div className="flex flex-1 flex-col p-7">
                      <p className="eyebrow">{m.type}</p>
                      <h3 className="display mt-2 text-[34px] leading-[1.02] text-white">{m.name}</h3>
                      <p className="mt-3 flex-1 text-[15px] text-steel-dim">{why}</p>
                      <p className="mt-5 flex items-baseline gap-3">
                        <span className="mono text-[22px] font-bold text-white">{eur(m.price)}</span>
                        <span className="mono text-[14px] text-ember">{eur(m.price * (1 - PROMO.percent / 100))} z kodem</span>
                      </p>
                      <span className="cond mt-4 inline-flex items-center gap-2 text-[14px] font-bold uppercase tracking-[.16em] text-white">Zobacz w sklepie <span aria-hidden className="transition-transform group-hover:translate-x-1.5">→</span></span>
                    </div>
                  </a>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-16 grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <SectionTitle eyebrow="Dbaj o sprzęt" a="Posłuży" b="dłużej" />
          <ol className="grid gap-3 sm:grid-cols-3">
            {CARE.map((c, i) => (
              <Reveal as="li" key={c.t} delay={i * 80} className="border border-white/10 bg-[#0b0909] p-6">
                <span className="mono text-[13px] text-ember">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display mt-4 text-[28px] leading-[1.05] text-white">{c.t}</h3>
                <p className="mt-2 text-[15px] text-steel-dim">{c.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
        <div className="mt-12">
          <MagneticLink variant="ghost" href={OCTAGON_SHOP_URL} target="_blank" rel="noopener noreferrer">Cała oferta Octagon Sport NL ↗</MagneticLink>
        </div>
      </div>
    </section>
    <NextPage label="Następna strona" title="Partnerzy" onGo={() => go('partnerzy')} img={IMG.teamMat} />
  </>
);

/* =================== KONTAKT =================== */
const ChatPreview: React.FC = () => (
  <div className="relative overflow-hidden border border-white/10 bg-[#0e1512] p-6" aria-hidden>
    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-blood display text-[16px] text-white">BT</span>
      <span>
        <span className="cond block text-[16px] font-bold uppercase tracking-[.08em] text-white">Bałagan Team</span>
        <span className="mono block text-[11px] text-[#7df0b0]">{SITE.phone}</span>
      </span>
    </div>
    <div className="flex flex-col gap-3 pt-5">
      {['Cześć! 👋', 'Chcę umówić pierwszy trening. Kiedy mogę przyjść?', 'Jestem początkujący, interesuje mnie boks.'].map((m, i) => (
        <span key={m} className="chat-bubble ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#1f5c3a] px-4 py-2.5 text-[15px] text-white" style={{ animationDelay: `${0.4 + i * 0.9}s` }}>{m}</span>
      ))}
      <span className="chat-typing mr-auto flex gap-1 rounded-lg rounded-tl-none bg-white/10 px-4 py-3" style={{ animationDelay: '3.2s' }}>
        <i className="h-2 w-2 rounded-full bg-white/70" /><i className="h-2 w-2 rounded-full bg-white/70" /><i className="h-2 w-2 rounded-full bg-white/70" />
      </span>
    </div>
  </div>
);

export const ContactPage: React.FC<PageProps> = ({ go }) => (
  <>
    <PageHeader
      eyebrow="Kontakt"
      title="Wpadnij"
      accent="na trening"
      bgWord="KONTAKT"
      img={IMG.teamMat}
      imgPos="50% 45%"
      imgAlt="Grupa treningowa Bałagan Team na macie"
      mono
      intro="Najszybciej odpowiadamy na WhatsApp. Możesz też zadzwonić albo po prostu przyjść na salę w godzinach otwarcia – Brugplein 2, Lelystad. Pierwszy trening umówisz w kilka minut."
      meta={[{ k: 'WhatsApp', v: SITE.phone }, { k: 'Adres', v: 'Brugplein 2' }, { k: 'Miasto', v: '8223 AJ Lelystad' }]}
    />
    <section aria-labelledby="napisz" className="py-20 sm:py-28">
      <div className="wrap grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionTitle id="napisz" eyebrow="Najszybciej" a="Napisz" b="na WhatsApp" />
          <LineReveal text="Jedna wiadomość wystarczy. Napisz, kim jesteś, co Cię interesuje i kiedy możesz przyjść – resztę ustalimy w rozmowie." className="mt-6 max-w-[48ch] text-[17px] text-steel-dim" step={12} />
          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticLink href={waLink('Cześć! Chcę umówić pierwszy trening w Bałagan Team.')} target="_blank" rel="noopener noreferrer">Otwórz WhatsApp</MagneticLink>
            <MagneticLink variant="ghost" href={`tel:${SITE.phoneHref}`}>Zadzwoń</MagneticLink>
          </div>
        </div>
        <Reveal><ChatPreview /></Reveal>
      </div>
    </section>
    <Contact />
    <section aria-label="Zdjęcie sali" className="pb-10">
      <div className="wrap">
        <ImageReveal className="aspect-[21/9] w-full max-w-full border border-white/10" parallax={70}>
          <Duo src={IMG.teamRing} alt="Ekipa Bałagan Team przy ringu" pos="50% 40%" className="h-full w-full" />
        </ImageReveal>
      </div>
    </section>
    <NextPage label="Wróć na początek" title="Treningi" onGo={() => go('treningi')} img={IMG.kick} />
  </>
);
