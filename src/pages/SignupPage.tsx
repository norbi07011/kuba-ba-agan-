import React, { useMemo, useRef, useState } from 'react';
import { PageHeader, NextPage, SectionTitle } from '../components/sections/PageHeader';
import { Reveal } from '../components/fx/ScrollFx';
import { MagneticButton } from '../components/fx/Kinetic';
import { Duo, ImageReveal, LineReveal } from '../components/fx/Premium';
import { SITE, waLink } from '../data/site';
import { IMG } from '../data/content';
import type { PageProps } from './types';

/*
 * Zapisy na treningi – jeden formularz, dwa tryby:
 *  - „Dziecko”: rodzic zapisuje dziecko na trening grupowy,
 *  - „Siebie”: dorosły zapisuje się na trening grupowy albo personalny (1vs1 / 2vs1).
 * Formularz niczego nie zapisuje na serwerze: układa gotową wiadomość i otwiera WhatsApp klubu
 * (+31 6 47125929). Zgłoszenie dociera, gdy osoba naciśnie „Wyślij” w WhatsApp.
 */

export type SignupMode = 'child' | 'self';
let nextMode: SignupMode = 'self';
/** Ustaw tryb formularza przed przejściem na stronę zapisów (np. przycisk „Zapisz dziecko”). */
export const setSignupMode = (m: SignupMode) => { nextMode = m; };

const DAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
const DISC_CHILD = ['Boks', 'Kickboxing', 'Jeszcze nie wiem'];
const DISC_SELF = ['Boks', 'Kickboxing', 'CrossFit', 'Jeszcze nie wiem'];
const KIND = ['Trening grupowy', 'Personalny 1vs1', 'Personalny 2vs1'];

interface Form {
  name: string; age: string; kind: string; disc: string; exp: string; days: string[]; goal: string; notes: string;
  parent: string; phone: string; email: string; consent: boolean;
}
const EMPTY: Form = { name: '', age: '', kind: '', disc: '', exp: '', days: [], goal: '', notes: '', parent: '', phone: '', email: '', consent: false };
type Errors = Partial<Record<keyof Form, string>>;

const inputCls = 'w-full border border-white/15 bg-black/40 px-4 py-3.5 text-[16px] text-white outline-none transition placeholder:text-steel-dim/60 focus:border-blood aria-[invalid=true]:border-ember';

const Field: React.FC<{ id: string; label: string; hint?: string; error?: string; children: React.ReactNode; className?: string }> = ({ id, label, hint, error, children, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label htmlFor={id} className="eyebrow">{label}</label>
    {children}
    {error ? <p id={`${id}-err`} className="text-[13px] text-ember">{error}</p> : hint ? <p className="text-[13px] text-steel-dim">{hint}</p> : null}
  </div>
);

const Chip: React.FC<{ on: boolean; onClick: () => void; children: React.ReactNode; role?: 'checkbox' | 'radio' }> = ({ on, onClick, children, role = 'radio' }) => (
  <button
    type="button"
    role={role}
    aria-checked={on}
    onClick={onClick}
    className={`cond border px-4 py-2.5 text-[15px] font-bold uppercase tracking-[.1em] transition-all duration-300 ${on ? 'border-blood bg-blood text-white shadow-[0_8px_24px_-8px_rgba(227,19,28,.8)]' : 'border-white/15 text-steel hover:border-white/50'}`}
  >
    {children}
  </button>
);

const ChipGroup: React.FC<{ id: string; label: string; options: string[]; value: string; onPick: (v: string) => void; error?: string }> = ({ id, label, options, value, onPick, error }) => (
  <div className="flex flex-col gap-2">
    <span id={`${id}-label`} className="eyebrow">{label}</span>
    <div id={id} tabIndex={-1} role="radiogroup" aria-labelledby={`${id}-label`} className="flex flex-wrap gap-2 outline-none">
      {options.map(o => <Chip key={o} on={value === o} onClick={() => onPick(o)}>{o}</Chip>)}
    </div>
    {error && <p className="text-[13px] text-ember">{error}</p>}
  </div>
);

/** Przełącznik trybu z przesuwającym się podświetleniem. */
const ModeSwitch: React.FC<{ mode: SignupMode; onChange: (m: SignupMode) => void }> = ({ mode, onChange }) => (
  <div role="tablist" aria-label="Kogo zapisujesz?" className="relative grid w-full max-w-[560px] grid-cols-2 border border-white/15 bg-black/40 p-1.5">
    <span aria-hidden className="absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] bg-blood shadow-[0_10px_30px_-10px_rgba(227,19,28,.9)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]" style={{ left: 6, transform: mode === 'self' ? 'translateX(0)' : 'translateX(calc(100% + 0px))' }} />
    {([['self', 'Zapisuję siebie', 'Grupowy lub personalny'], ['child', 'Zapisuję dziecko', 'Trening grupowy']] as const).map(([m, t, s]) => (
      <button
        key={m}
        type="button"
        role="tab"
        aria-selected={mode === m}
        onClick={() => onChange(m)}
        className="relative z-10 flex flex-col items-center px-3 py-3 text-center"
      >
        <span className={`cond text-[16px] font-bold uppercase tracking-[.12em] transition-colors sm:text-[18px] ${mode === m ? 'text-white' : 'text-steel'}`}>{t}</span>
        <span className={`mono text-[11px] transition-colors ${mode === m ? 'text-white/80' : 'text-steel-dim'}`}>{s}</span>
      </button>
    ))}
  </div>
);

export const SignupPage: React.FC<PageProps> = ({ go }) => {
  const [mode, setModeState] = useState<SignupMode>(() => nextMode);
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const child = mode === 'child';
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF(s => ({ ...s, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };
  const setMode = (m: SignupMode) => { nextMode = m; setModeState(m); setErrors({}); setReady(false); set('disc', ''); };

  const personal = !child && f.kind.startsWith('Personalny');

  const message = useMemo(() => {
    const lines = child
      ? [
          'Cześć! Zgłoszenie dziecka na trening grupowy w Bałagan Team:',
          '',
          `👊 Dziecko: ${f.name.trim()}, ${f.age} lat`,
          `🥊 Dyscyplina: ${f.disc}`,
          `📈 Doświadczenie: ${f.exp}`,
          `📅 Pasujące dni: ${f.days.length ? f.days.join(', ') : 'dowolne'}`,
          f.notes.trim() ? `📝 Uwagi: ${f.notes.trim()}` : '',
          '',
          `Rodzic/opiekun: ${f.parent.trim()}`,
          `Telefon: ${f.phone.trim()}`,
          f.email.trim() ? `E-mail: ${f.email.trim()}` : '',
          '',
          'Potwierdzam, że jestem rodzicem/opiekunem i zgadzam się na udział dziecka w treningu.',
        ]
      : [
          `Cześć! Chcę zapisać się na: ${f.kind.toLowerCase()} w Bałagan Team.`,
          '',
          `👊 Imię i nazwisko: ${f.name.trim()}${f.age ? `, ${f.age} lat` : ''}`,
          `🥊 Dyscyplina: ${f.disc}`,
          `📈 Doświadczenie: ${f.exp}`,
          `📅 Pasujące dni: ${f.days.length ? f.days.join(', ') : 'dowolne'}`,
          f.goal.trim() ? `🎯 Cel: ${f.goal.trim()}` : '',
          f.notes.trim() ? `📝 Uwagi: ${f.notes.trim()}` : '',
          '',
          `Telefon: ${f.phone.trim()}`,
          f.email.trim() ? `E-mail: ${f.email.trim()}` : '',
        ];
    return lines.filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
  }, [f, child]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (f.name.trim().length < 2) e.name = child ? 'Wpisz imię dziecka.' : 'Wpisz imię i nazwisko.';
    const age = Number(f.age);
    if (child && (!f.age || !Number.isInteger(age) || age < 3 || age > 17)) e.age = 'Podaj wiek od 3 do 17 lat.';
    if (!child && f.age && (!Number.isInteger(age) || age < 12 || age > 99)) e.age = 'Podaj prawidłowy wiek albo zostaw puste.';
    if (!child && !f.kind) e.kind = 'Wybierz rodzaj treningu.';
    if (!f.disc) e.disc = 'Wybierz dyscyplinę albo „Jeszcze nie wiem”.';
    if (!f.exp) e.exp = 'Zaznacz swoje doświadczenie.';
    if (child && f.parent.trim().length < 3) e.parent = 'Wpisz imię i nazwisko rodzica lub opiekuna.';
    if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'Wpisz numer telefonu (min. 9 cyfr), żeby trener mógł oddzwonić.';
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Ten adres e-mail wygląda na niepełny.';
    if (child && !f.consent) e.consent = 'Zaznacz zgodę rodzica lub opiekuna.';
    return e;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) { document.getElementById(`bt-${first}`)?.focus(); return; }
    setReady(true);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch {
      const el = document.getElementById('bt-msg');
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s?.removeAllRanges(); s?.addRange(r); }
    }
  };
  const err = (k: keyof Form) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `bt-${k}-err` } : {});

  return (
    <>
      <PageHeader
        eyebrow="Zapisy"
        title="Zapisz się"
        accent="albo dziecko"
        bgWord="ZAPISY"
        img={IMG.personal}
        imgPos="55% 35%"
        imgAlt="Trener i zawodniczka w rękawicach podczas treningu"
        intro="Jeden formularz dla wszystkich: zapisz siebie na trening grupowy albo personalny 1vs1 lub 2vs1, albo zapisz dziecko na trening grupowy. Ułożymy z formularza wiadomość, a Ty wyślesz ją jednym kliknięciem na WhatsApp klubu."
        meta={[{ k: 'Czas', v: 'ok. 1 minuta' }, { k: 'Wysyłka', v: 'WhatsApp' }, { k: 'Odpowiedź', v: 'trener Kuba' }]}
      />

      <section aria-label="Formularz zgłoszeniowy" className="py-16 sm:py-24">
        <div ref={top} className="wrap" style={{ scrollMarginTop: 90 }}>
          <div className="mb-10 flex flex-col gap-4">
            <p className="eyebrow flex items-center gap-3"><span className="h-[2px] w-8 bg-blood" />Kogo zapisujesz?</p>
            <ModeSwitch mode={mode} onChange={setMode} />
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:gap-14">
            {!ready ? (
              <form key={mode} onSubmit={submit} noValidate className="bt-swap flex flex-col gap-10">
                <fieldset className="border border-white/10 bg-ink-2 p-6 sm:p-8">
                  <legend className="cond px-2 text-[14px] font-bold uppercase tracking-[.2em] text-blood">Krok 1 · {child ? 'Dziecko' : 'Trening'}</legend>
                  {!child && (
                    <div className="mb-6">
                      <ChipGroup id="bt-kind" label="Rodzaj treningu" options={KIND} value={f.kind} onPick={v => set('kind', v)} error={errors.kind} />
                      {personal && <p className="mt-3 text-[14px] text-steel-dim">{f.kind.endsWith('2vs1') ? 'Trenujecie we dwoje z jednym trenerem – wpisz w uwagach, z kim przyjdziesz.' : 'Trener tylko dla Ciebie. Termin ustalicie w wiadomości.'}</p>}
                    </div>
                  )}
                  <div className="grid gap-6 sm:grid-cols-[1fr_140px]">
                    <Field id="bt-name" label={child ? 'Imię dziecka' : 'Imię i nazwisko'} error={errors.name}>
                      <input id="bt-name" className={inputCls} autoComplete={child ? 'off' : 'name'} placeholder={child ? 'np. Antek' : 'np. Marta Nowak'} value={f.name} onChange={e => set('name', e.target.value)} {...err('name')} />
                    </Field>
                    <Field id="bt-age" label={child ? 'Wiek' : 'Wiek (opcjonalnie)'} error={errors.age}>
                      <input id="bt-age" className={`${inputCls} mono`} inputMode="numeric" placeholder={child ? 'np. 9' : 'np. 28'} value={f.age} onChange={e => set('age', e.target.value.replace(/\D/g, '').slice(0, 2))} {...err('age')} />
                    </Field>
                  </div>
                  <div className="mt-6"><ChipGroup id="bt-disc" label="Dyscyplina" options={child ? DISC_CHILD : DISC_SELF} value={f.disc} onPick={v => set('disc', v)} error={errors.disc} /></div>
                  <div className="mt-6"><ChipGroup id="bt-exp" label="Doświadczenie" options={child ? ['Pierwszy raz', 'Trenował(a) wcześniej'] : ['Zaczynam od zera', 'Trenowałem/am wcześniej', 'Zawodnik']} value={f.exp} onPick={v => set('exp', v)} error={errors.exp} /></div>
                  <div className="mt-6 flex flex-col gap-2">
                    <span id="bt-days-label" className="eyebrow">Pasujące dni (opcjonalnie)</span>
                    <div role="group" aria-labelledby="bt-days-label" className="flex flex-wrap gap-2">
                      {DAYS.map(d => (
                        <Chip key={d} role="checkbox" on={f.days.includes(d)} onClick={() => set('days', f.days.includes(d) ? f.days.filter(x => x !== d) : DAYS.filter(x => x === d || f.days.includes(x)))}>{d}</Chip>
                      ))}
                    </div>
                  </div>
                  {!child && (
                    <Field id="bt-goal" label="Twój cel (opcjonalnie)" hint="Np. kondycja, redukcja wagi, technika, przygotowanie do walki." className="mt-6">
                      <input id="bt-goal" className={inputCls} value={f.goal} onChange={e => set('goal', e.target.value)} />
                    </Field>
                  )}
                  <Field id="bt-notes" label="Uwagi (opcjonalnie)" hint={child ? 'Np. alergie, przeciwwskazania, o czym trener powinien wiedzieć.' : 'Np. kontuzje, przeciwwskazania, z kim przychodzisz na 2vs1.'} className="mt-6">
                    <textarea id="bt-notes" rows={3} className={`${inputCls} resize-none`} value={f.notes} onChange={e => set('notes', e.target.value)} />
                  </Field>
                </fieldset>

                <fieldset className="border border-white/10 bg-ink-2 p-6 sm:p-8">
                  <legend className="cond px-2 text-[14px] font-bold uppercase tracking-[.2em] text-blood">Krok 2 · {child ? 'Rodzic lub opiekun' : 'Kontakt'}</legend>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {child && (
                      <Field id="bt-parent" label="Imię i nazwisko" error={errors.parent} className="sm:col-span-2">
                        <input id="bt-parent" className={inputCls} autoComplete="name" placeholder="np. Anna Kowalska" value={f.parent} onChange={e => set('parent', e.target.value)} {...err('parent')} />
                      </Field>
                    )}
                    <Field id="bt-phone" label="Telefon" error={errors.phone}>
                      <input id="bt-phone" type="tel" className={`${inputCls} mono`} autoComplete="tel" placeholder="+31 6 …" value={f.phone} onChange={e => set('phone', e.target.value)} {...err('phone')} />
                    </Field>
                    <Field id="bt-email" label="E-mail (opcjonalnie)" error={errors.email}>
                      <input id="bt-email" type="email" className={inputCls} autoComplete="email" placeholder="adres@email.com" value={f.email} onChange={e => set('email', e.target.value)} {...err('email')} />
                    </Field>
                  </div>
                  {child && (
                    <>
                      <label htmlFor="bt-consent" className="mt-7 flex cursor-pointer items-start gap-3">
                        <input id="bt-consent" type="checkbox" checked={f.consent} onChange={e => set('consent', e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#e3131c]" {...err('consent')} />
                        <span className="text-[15px] text-steel">Jestem rodzicem lub opiekunem prawnym dziecka i zgadzam się na jego udział w treningu grupowym.</span>
                      </label>
                      {errors.consent && <p id="bt-consent-err" className="mt-2 text-[13px] text-ember">{errors.consent}</p>}
                    </>
                  )}
                </fieldset>

                <div className="flex flex-wrap items-center gap-4">
                  <MagneticButton type="submit" className="w-full sm:w-auto">
                    Przygotuj wiadomość
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </MagneticButton>
                  <p className="text-[13px] text-steel-dim">Dane nie są nigdzie zapisywane – trafiają tylko do wiadomości, którą sam wysyłasz.</p>
                </div>
              </form>
            ) : (
              <div className="bt-swap flex flex-col gap-6">
                <div className="border border-[#25d366]/40 bg-ink-2 p-6 sm:p-8" style={{ boxShadow: '0 40px 80px -50px rgba(37,211,102,.5)' }}>
                  <p className="eyebrow">Krok 3 · Wyślij</p>
                  <h2 className="display mt-2 text-[clamp(40px,5vw,64px)] leading-[1] text-white">Wiadomość gotowa</h2>
                  <p className="mt-3 text-steel-dim">Kliknij przycisk – otworzy się WhatsApp z wpisaną wiadomością do Bałagan Team ({SITE.phone}). Zgłoszenie dotrze, gdy naciśniesz w nim „Wyślij”.</p>
                  <pre id="bt-msg" className="thin-scroll mt-6 max-h-[340px] overflow-auto whitespace-pre-wrap border border-white/10 bg-black/50 p-5 font-[inherit] text-[15px] leading-relaxed text-white">{message}</pre>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className="cond group inline-flex items-center gap-3 bg-[#25d366] px-7 py-4 text-[15px] font-bold uppercase tracking-[.16em] text-[#0b2a17] transition-shadow hover:shadow-[0_14px_40px_-10px_rgba(37,211,102,.9)]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.4Z" /></svg>
                      Wyślij na WhatsApp
                    </a>
                    <button type="button" onClick={copy} className="cond border border-white/20 px-6 py-4 text-[14px] font-bold uppercase tracking-[.16em] text-steel transition hover:border-white/70 hover:text-white">{copied ? 'Skopiowano' : 'Kopiuj wiadomość'}</button>
                    <button type="button" onClick={() => setReady(false)} className="cond px-2 py-4 text-[14px] font-bold uppercase tracking-[.16em] text-steel-dim underline-offset-4 hover:text-white hover:underline">Popraw dane</button>
                  </div>
                </div>
                <p className="text-[14px] text-steel-dim">WhatsApp się nie otworzył? Skopiuj wiadomość i wyślij ją na numer <span className="mono select-all text-white">{SITE.phone}</span>.</p>
              </div>
            )}

            <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
              <Reveal className="border border-white/10 bg-ink-2 p-6">
                <p className="eyebrow">Jak to działa</p>
                <ol className="mt-4 flex flex-col gap-4">
                  {['Wypełniasz formularz – zajmie to minutę.', 'Wysyłasz gotową wiadomość na WhatsApp klubu.', child ? 'Trener odpisuje z propozycją grupy i godziny pierwszego treningu.' : 'Trener odpisuje z terminem pierwszego treningu.'].map((t, i) => (
                    <li key={i} className="flex gap-4">
                      <span className={`display grid h-10 w-10 shrink-0 place-items-center text-[22px] ${(ready ? i <= 1 : i === 0) ? 'bg-blood text-white' : 'border border-white/20 text-steel'}`}>{i + 1}</span>
                      <span className="pt-2 text-[15px] text-steel">{t}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
              <Reveal delay={100} className="border border-white/10 bg-ink-2 p-6">
                <p className="eyebrow">Na pierwszy trening</p>
                <ul className="mt-3 flex flex-col gap-2 text-[15px] text-steel">
                  {['Wygodny strój sportowy', 'Butelka wody', 'Ręcznik', 'Rękawice i owijki – zapytaj trenera, pomożemy dobrać'].map(t => (
                    <li key={t} className="flex gap-3"><span aria-hidden className="mt-2.5 h-[2px] w-3 shrink-0 bg-blood" />{t}</li>
                  ))}
                </ul>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>

      {child ? (
        <section aria-labelledby="dlaczego" className="border-t border-white/10 py-20 sm:py-28">
          <div className="wrap grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <ImageReveal className="aspect-[4/3] w-full max-w-full border border-white/10" from="left">
              <Duo src={IMG.coachKid} alt="Trener na kolanach trzyma tarcze dla młodego zawodnika" pos="60% 50%" className="h-full w-full" />
            </ImageReveal>
            <div>
              <SectionTitle id="dlaczego" eyebrow="Dla rodziców" a="Dlaczego" b="sporty walki?" />
              <LineReveal text="Dobrze prowadzony trening walki to dla dziecka dużo więcej niż sport. To ruch zamiast ekranu, zasady zamiast chaosu i pewność siebie, która zostaje na długo po wyjściu z sali." className="mt-6 max-w-[54ch] text-[17px] text-steel-dim" step={10} />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[['Pewność siebie', 'Dziecko uczy się, że potrafi więcej, niż myślało.'], ['Dyscyplina', 'Szacunek do trenera, partnera i zasad sali.'], ['Koordynacja', 'Praca nóg, rąk i oczu – sprawność na każdy sport.'], ['Energia w dobrą stronę', 'Ruch, zmęczenie i spokojniejszy wieczór w domu.']].map(([t, d]) => (
                  <li key={t} className="border border-white/10 bg-[#0b0909] p-5">
                    <span className="display block text-[26px] leading-none text-white">{t}</span>
                    <span className="mt-2 block text-[15px] text-steel-dim">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <section aria-labelledby="grupowy-czy" className="border-t border-white/10 py-20 sm:py-28">
          <div className="wrap">
            <SectionTitle id="grupowy-czy" eyebrow="Pomoc w wyborze" a="Grupowy" b="czy personalny?" text="Oba prowadzi ten sam trener. Różnica jest w tempie, uwadze i energii na sali." />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                { t: 'Trening grupowy', d: 'Energia ekipy, praca w parach i rywalizacja, która napędza. Najlepszy start dla większości osób.', img: IMG.teamMat, mono: true },
                { t: 'Personalny 1vs1', d: 'Pełna uwaga trenera i plan pod Twój cel – szybszy postęp techniki, kondycji albo przygotowanie do walki.', img: IMG.personal, mono: false },
                { t: 'Personalny 2vs1', d: 'Trenujecie we dwoje – z partnerem, przyjacielem albo dzieckiem. Indywidualnie, ale razem.', img: IMG.coachKid, mono: true },
              ].map((x, i) => (
                <Reveal key={x.t} delay={i * 100}>
                  <button type="button" onClick={() => { set('kind', x.t); top.current?.scrollIntoView({ behavior: 'smooth' }); }} data-cursor="Wybierz" className="group relative flex h-full min-h-[360px] w-full flex-col justify-end overflow-hidden border border-white/10 p-7 text-left">
                    <Duo src={x.img} alt="" mono={x.mono} className="absolute inset-0 transition-transform duration-[1.2s] group-hover:scale-105" />
                    <span className="relative display text-[clamp(36px,3.6vw,52px)] leading-[1] text-white">{x.t}</span>
                    <span className="relative mt-3 text-[15px] text-steel">{x.d}</span>
                    <span className="relative cond mt-4 text-[13px] font-bold uppercase tracking-[.16em] text-ember">Wybierz w formularzu →</span>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      <NextPage label="Następna strona" title="Grafik" onGo={() => go('grafik')} img={IMG.crossfit} />
    </>
  );
};
