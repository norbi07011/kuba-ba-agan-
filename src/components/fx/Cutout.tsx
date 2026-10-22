import React from 'react';

/**
 * Zdjęcie produktu wycięte z tła (przezroczysty webp) z „grubością” 3D:
 * ta sama sylwetka powtórzona kilka razy w głąb (translateZ) i przyciemniona,
 * więc przy obrocie w osi Y produkt ma bryłę zamiast płaskiej kartki.
 */
export const Cutout3D: React.FC<{ src: string; alt: string; depth?: number; layers?: number; className?: string; style?: React.CSSProperties }> = ({
  src,
  alt,
  depth = 22,
  layers = 7,
  className = '',
  style,
}) => (
  <div className={`relative ${className}`} style={{ transformStyle: 'preserve-3d', ...style }}>
    {Array.from({ length: layers }, (_, i) => (
      <img
        key={i}
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        style={{ transform: `translateZ(${-(i + 1) * (depth / layers)}px)`, filter: 'brightness(.22) saturate(.6)' }}
      />
    ))}
    <img
      src={src}
      alt={alt}
      draggable={false}
      className="relative h-full w-full select-none object-contain"
      style={{ transform: 'translateZ(0.5px)', filter: 'drop-shadow(0 0 22px rgba(227,19,28,.35))' }}
    />
  </div>
);
