import { flushSync } from 'react-dom';
import { prefersReducedMotion } from './motion';

/** Zmiana „strony” z View Transitions API (Chrome/Edge/Safari 18+); w innych przeglądarkach – zwykła zmiana. */
export const withViewTransition = (update: () => void) => {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  if (!doc.startViewTransition || prefersReducedMotion()) { update(); return; }
  doc.startViewTransition(() => flushSync(update));
};
