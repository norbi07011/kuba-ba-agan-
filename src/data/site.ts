/** Dane sali – z plakatu Bałagan Team. Zmieniaj tutaj, a strona zaktualizuje się wszędzie. */
export const SITE = {
  name: 'Bałagan Team',
  city: 'Lelystad',
  disciplines: ['Boks', 'Kickboxing', 'CrossFit'],
  motto: ['Discipline', 'Work', 'Results'],
  address: { street: 'Brugplein 2', zip: '8223 AJ', city: 'Lelystad' },
  phone: '+31 6 47125929',
  phoneHref: '+31647125929',
  whatsapp: '31647125929',
  facebook: { label: 'Bałagan Kuba', url: 'https://www.facebook.com/share/1KC79T2CLf/' },
  instagram: { label: '@balagankuba', url: 'https://www.instagram.com/balagankuba/' },
  maps: 'https://www.google.com/maps/search/?api=1&query=Brugplein+2%2C+8223+AJ+Lelystad',
};

/** Godziny otwarcia (0 = niedziela). `null` = zamknięte. */
export const HOURS: { day: number; label: string; short: string; open: [number, number] | null }[] = [
  { day: 1, label: 'Poniedziałek', short: 'Pon', open: [11, 19] },
  { day: 2, label: 'Wtorek', short: 'Wt', open: [11, 19] },
  { day: 3, label: 'Środa', short: 'Śr', open: [11, 19] },
  { day: 4, label: 'Czwartek', short: 'Czw', open: [11, 19] },
  { day: 5, label: 'Piątek', short: 'Pt', open: [11, 19] },
  { day: 6, label: 'Sobota', short: 'Sob', open: [11, 14] },
  { day: 0, label: 'Niedziela', short: 'Ndz', open: null },
];

/** Aktualny czas w Lelystad (Europe/Amsterdam), niezależnie od strefy odwiedzającego. */
export const nowInLelystad = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const wd = parts.find(p => p.type === 'weekday')?.value ?? 'Mon';
  const h = Number(parts.find(p => p.type === 'hour')?.value ?? 12) % 24;
  const m = Number(parts.find(p => p.type === 'minute')?.value ?? 0);
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
  return { day, hour: h + m / 60 };
};

export const openStatus = () => {
  const { day, hour } = nowInLelystad();
  const today = HOURS.find(h => h.day === day)!;
  if (today.open && hour >= today.open[0] && hour < today.open[1]) {
    return { open: true, text: `Otwarte teraz · do ${today.open[1]}:00` };
  }
  // najbliższe otwarcie
  for (let k = 0; k < 8; k++) {
    const d = (day + k) % 7;
    const h = HOURS.find(x => x.day === d)!;
    if (!h.open) continue;
    if (k === 0 && hour >= h.open[0]) continue;
    const when = k === 0 ? 'dziś' : k === 1 ? 'jutro' : h.label.toLowerCase();
    return { open: false, text: `Zamknięte · otwieramy ${when} o ${h.open[0]}:00` };
  }
  return { open: false, text: 'Zamknięte' };
};

export const waLink = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
