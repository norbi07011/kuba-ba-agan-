import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion, isFinePointer } from '../../lib/motion';

/** Tekst wjeżdżający litera po literze (obrót 3D + rozmycie). Zmień `key`, aby odtworzyć animację. */
export const KineticText: React.FC<{
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  stagger?: number;
  charClassName?: (i: number, ch: string) => string | undefined;
}> = ({ text, className = '', style, delay = 0, stagger = 34, charClassName }) => {
  let n = 0;
  return (
    <span className={`bt-kinetic ${className}`} style={style} aria-label={text} role="text">
      {text.split(' ').map((word, wi, arr) => (
        <React.Fragment key={wi}>
          <span aria-hidden className="inline-block whitespace-nowrap">
            {Array.from(word).map(ch => {
              const i = n++;
              return (
                <span key={i} className={`bt-char ${charClassName?.(i, ch) ?? ''}`} style={{ animationDelay: `${delay + i * stagger}ms` }}>
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < arr.length - 1 ? ((n++), ' ') : null}
        </React.Fragment>
      ))}
    </span>
  );
};

/** Hook „magnetyczny”: element lekko podąża za kursorem (tylko komputer). */
const useMagnet = <T extends HTMLElement>(strength = 0.25) => {
  const ref = useRef<T>(null);
  const inner = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate3d(${x * strength}px, ${y * strength * 1.3}px, 0)`;
      if (inner.current) inner.current.style.transform = `translate3d(${x * 0.1}px, ${y * 0.14}px, 0)`;
    };
    const leave = () => {
      el.style.transform = '';
      if (inner.current) inner.current.style.transform = '';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return [ref, inner] as const;
};

type Variant = 'solid' | 'ghost';
const base =
  'group relative isolate inline-flex items-center justify-center overflow-hidden px-7 py-4 cond text-[15px] font-bold uppercase tracking-[.18em] no-underline transition-[transform,border-color,box-shadow,color] duration-500 ease-out select-none';
const look = (v: Variant) =>
  v === 'solid'
    ? 'bg-blood text-white hover:shadow-[0_14px_44px_-10px_rgba(227,19,28,.85)]'
    : 'border border-white/20 text-steel hover:border-white/70 hover:text-white backdrop-blur-sm';

const Fill: React.FC<{ variant: Variant }> = ({ variant }) => (
  <span
    aria-hidden
    className="absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-x-100"
    style={{ background: variant === 'solid' ? '#ff3a2e' : 'rgba(227,19,28,.22)' }}
  />
);

export const MagneticButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }> = ({
  variant = 'solid',
  className = '',
  children,
  ...rest
}) => {
  const [ref, inner] = useMagnet<HTMLButtonElement>();
  return (
    <button ref={ref} type="button" className={`${base} ${look(variant)} ${className}`} {...rest}>
      <Fill variant={variant} />
      <span ref={inner} className="relative flex items-center gap-2.5 transition-transform duration-300 ease-out">{children}</span>
    </button>
  );
};

export const MagneticLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }> = ({
  variant = 'solid',
  className = '',
  children,
  ...rest
}) => {
  const [ref, inner] = useMagnet<HTMLAnchorElement>();
  return (
    <a ref={ref} className={`${base} ${look(variant)} ${className}`} {...rest}>
      <Fill variant={variant} />
      <span ref={inner} className="relative flex items-center gap-2.5 transition-transform duration-300 ease-out">{children}</span>
    </a>
  );
};

/** Liczba, która płynnie „dojeżdża” do nowej wartości (suma i licznik w koszyku). */
export const RollingNumber: React.FC<{ value: number; format?: (n: number) => string; duration?: number; className?: string }> = ({
  value,
  format = n => n.toFixed(2),
  duration = 700,
  className,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  const fmt = useRef(format);
  fmt.current = format;
  useEffect(() => {
    const el = ref.current;
    const from = shown.current;
    const to = value;
    if (!el) return;
    if (from === to || prefersReducedMotion()) {
      shown.current = to;
      el.textContent = fmt.current(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - t, 4);
      shown.current = from + (to - from) * e;
      el.textContent = fmt.current(shown.current);
      if (t < 1) raf = requestAnimationFrame(tick);
      else shown.current = to;
    };
    raf = requestAnimationFrame(tick);
    el.animate([{ transform: 'translateY(-4px)', filter: 'brightness(1.8)' }, { transform: 'none', filter: 'none' }], { duration: 500, easing: 'ease-out' });
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span ref={ref} className={`inline-block tabular-nums ${className || ''}`}>{format(shown.current)}</span>;
};
