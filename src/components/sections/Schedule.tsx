import React, { useEffect, useState } from 'react';
import { CountUp, Reveal } from '../fx/ScrollFx';
import { HOURS, hm, nowInLelystad, openStatus } from '../../data/site';

const AXIS_FROM = 9, AXIS_TO = 21;
const pct = (h: number) => ((h - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * 100;
const weeklyHours = HOURS.reduce((n, h) => n + (h.open ? h.open[1] - h.open[0] : 0), 0);

export const Schedule: React.FC = () => {
  const [now, setNow] = useState(nowInLelystad);
  const [status, setStatus] = useState(openStatus);
  useEffect(() => {
    const t = window.setInterval(() => { setNow(nowInLelystad()); setStatus(openStatus()); }, 30_000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section id="grafik" aria-labelledby="grafik-title" className="relative py-20 sm:py-28">
      <div className="wrap">
        {/* liczby */}
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-4">
            {[
              { n: 6, s: '', label: 'dni treningowych w tygodniu' },
              { n: Math.floor(weeklyHours), s: '+ h', label: 'otwartej sali co tydzień' },
              { n: 3, s: '', label: 'dyscypliny: boks, kickboxing, crossfit' },
              { n: 2, s: '', label: 'formaty personalne: 1vs1 i 2vs1' },
            ].map(x => (
              <div key={x.label} className="flex flex-col-reverse bg-ink px-5 py-7 sm:px-7 sm:py-9">
                <dt className="cond mt-3 text-[14px] font-semibold uppercase tracking-[.12em] text-steel-dim">{x.label}</dt>
                <dd className="display text-[clamp(56px,8vw,96px)] leading-none text-white"><CountUp to={x.n} suffix={x.s} /></dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="mt-20 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow">Grafik</p>
            <h2 id="grafik-title" className="display mt-3 text-[clamp(48px,7vw,96px)]"><span className="chrome">Kiedy</span> <span className="text-blood">trenujemy</span></h2>
            <p className="mt-5 max-w-[42ch] text-steel-dim">Sala jest otwarta od poniedziałku do soboty. Treningi personalne umawiasz w tych godzinach bezpośrednio z trenerem.</p>
            <p className={`cond mt-6 inline-flex items-center gap-2.5 border px-4 py-2 text-[15px] font-bold uppercase tracking-[.14em] ${status.open ? 'border-[#3ddc84]/40 text-[#7df0b0]' : 'border-blood/50 text-ember'}`}>
              <span className={`h-2 w-2 rounded-full ${status.open ? 'bt-pulse bg-[#3ddc84]' : 'bg-blood'}`} />
              {status.text}
            </p>
            <p className="mono mt-3 text-[12px] text-steel-dim">Czas w Lelystad · {String(Math.floor(now.hour)).padStart(2, '0')}:{String(Math.floor((now.hour % 1) * 60)).padStart(2, '0')}</p>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse">
                <caption className="sr-only">Godziny otwarcia sali Bałagan Team</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-[30%] pb-3 text-left"><span className="eyebrow">Dzień</span></th>
                    <th scope="col" className="pb-3 text-left">
                      <span className="sr-only">Godziny</span>
                      <div aria-hidden className="mono relative h-4 text-[11px] text-steel-dim">
                        {[9, 12, 15, 18, 21].map(h => (
                          <span key={h} className="absolute -translate-x-1/2" style={{ left: `${pct(h)}%` }}>{h}</span>
                        ))}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map(d => {
                    const today = d.day === now.day;
                    return (
                      <tr key={d.day} className={`border-t border-white/10 ${today ? 'bg-blood/[.08]' : ''}`}>
                        <th scope="row" className="py-4 pr-3 text-left align-middle">
                          <span className={`cond block text-[17px] font-bold uppercase tracking-[.08em] ${today ? 'text-white' : 'text-steel'}`}>
                            <span className="hidden sm:inline">{d.label}</span><span className="sm:hidden">{d.short}</span>
                          </span>
                          <span className="mono text-[12px] text-steel-dim">{d.open ? `${hm(d.open[0])}–${hm(d.open[1])}${d.last ? ` · ostatni start ${hm(d.last)}` : ''}` : 'zamknięte'}{today ? ' · dziś' : ''}</span>
                        </th>
                        <td className="py-4 align-middle">
                          <div className="relative h-9 bg-white/[.03]">
                            {[12, 15, 18].map(h => <span key={h} aria-hidden className="absolute inset-y-0 w-px bg-white/[.06]" style={{ left: `${pct(h)}%` }} />)}
                            {d.open && (
                              <div
                                className="absolute inset-y-1"
                                style={{
                                  left: `${pct(d.open[0])}%`,
                                  width: `${pct(d.open[1]) - pct(d.open[0])}%`,
                                  background: today ? 'linear-gradient(90deg,#b30f17,#ff4a3d)' : 'linear-gradient(90deg,#3a1517,#5a1a1d)',
                                  boxShadow: today ? '0 0 22px rgba(227,19,28,.5)' : undefined,
                                }}
                              />
                            )}
                            {today && now.hour >= AXIS_FROM && now.hour <= AXIS_TO && (
                              <span aria-hidden className="absolute -inset-y-1 w-[2px] bg-white" style={{ left: `${pct(now.hour)}%`, boxShadow: '0 0 10px #fff' }} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
