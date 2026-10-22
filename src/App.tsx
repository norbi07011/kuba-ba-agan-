import { useCallback, useEffect, useRef, useState } from 'react';
import { initSmoothScroll } from './lib/smoothScroll';
import { prefersReducedMotion } from './lib/motion';
import { Cursor, PageCurtain } from './components/fx/Premium';
import { IntroOverlay, shouldShowIntro } from './components/fx/IntroOverlay';
import { ScrollProgress } from './components/fx/ScrollFx';
import { Header } from './components/sections/Header';
import { Footer } from './components/sections/Contact';
import { HomePage } from './pages/HomePage';
import { TrainingPage } from './pages/TrainingPage';
import { PartnersPage } from './pages/PartnersPage';
import { SignupPage } from './pages/SignupPage';
import { SchedulePage, CoachPage, GearPage, ContactPage } from './pages/OtherPages';
import { PAGE_TITLE, isPage, type PageId } from './pages/types';

const LABEL: Record<PageId, string> = { start: 'Start', treningi: 'Treningi', zapisy: 'Zapisy', grafik: 'Grafik', trener: 'Trener', sprzet: 'Sprzęt', partnerzy: 'Partnerzy', kontakt: 'Kontakt' };

/*
 * Osobne podstrony: #treningi, #grafik, #trener, #sprzet, #partnerzy, #kontakt (start = bez kotwicy).
 * Zmiana strony idzie przez View Transitions API (stara strona rozmywa się, nowa wjeżdża),
 * działa przycisk „wstecz” przeglądarki, a każdą podstronę można podlinkować.
 */
const fromHash = (): PageId => {
  const h = location.hash.replace('#', '');
  return isPage(h) ? h : 'start';
};

export default function App() {
  const [intro, setIntro] = useState(shouldShowIntro);
  const [page, setPage] = useState<PageId>(fromHash);

  useEffect(() => initSmoothScroll(), []);
  useEffect(() => { document.title = PAGE_TITLE[page]; }, [page]);

  // kurtyna: zasłania stronę, podmienia podstronę pod spodem, odsłania nową
  const [curtain, setCurtain] = useState<{ phase: 'idle' | 'in' | 'out'; label: string }>({ phase: 'idle', label: '' });
  const busy = useRef(false);
  const swap = useCallback((id: PageId) => {
    window.dispatchEvent(new Event('bt:scroll-stop'));
    if (prefersReducedMotion()) { setPage(id); window.scrollTo(0, 0); return; }
    if (busy.current) return;
    busy.current = true;
    setCurtain({ phase: 'in', label: LABEL[id] });
    window.setTimeout(() => {
      setPage(id);
      window.scrollTo(0, 0);
      setCurtain({ phase: 'out', label: LABEL[id] });
      window.setTimeout(() => { setCurtain(c => ({ ...c, phase: 'idle' })); busy.current = false; }, 820);
    }, 680);
  }, []);

  // przycisk „wstecz/dalej” w przeglądarce
  useEffect(() => {
    const on = () => swap(fromHash());
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, [swap]);

  const go = useCallback((id: PageId) => {
    if (id === page) { window.dispatchEvent(new Event('bt:scroll-stop')); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    try { history.pushState(null, '', id === 'start' ? location.pathname + location.search : `#${id}`); } catch { /* sandbox */ }
    swap(id);
  }, [page, swap]);

  const onNav = useCallback((id: string) => go(isPage(id) ? id : 'start'), [go]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:bg-blood focus:px-4 focus:py-2 focus:text-white">Przejdź do treści</a>
      <div id="app-shell">
        <ScrollProgress />
        <Header onNav={onNav} onHome={() => go('start')} active={page} />
        <main id="main" key={page}>
          {page === 'start' && <HomePage go={go} introPending={intro} />}
          {page === 'treningi' && <TrainingPage go={go} />}
          {page === 'zapisy' && <SignupPage go={go} />}
          {page === 'grafik' && <SchedulePage go={go} />}
          {page === 'trener' && <CoachPage go={go} />}
          {page === 'sprzet' && <GearPage go={go} />}
          {page === 'partnerzy' && <PartnersPage go={go} />}
          {page === 'kontakt' && <ContactPage go={go} />}
        </main>
        <Footer onNav={onNav} />
      </div>
      <PageCurtain phase={curtain.phase} label={curtain.label} />
      <Cursor />
      {intro && <IntroOverlay onDone={() => setIntro(false)} />}
    </>
  );
}
