import './PaintStrokes.css'

/**
 * Decorative gold paint brush-stroke images.
 * Drop inside any section with `position:relative; overflow:hidden`.
 *
 * variant = "a" | "b" | "splash"  (splash used sparingly, once on the page)
 * positions: which corners to place strokes at.
 *   "tr"  = top-right       "tl"  = top-left
 *   "br"  = bottom-right    "bl"  = bottom-left
 */
const ASSETS = {
  a: '/assets/brush-stroke.svg',
  b: '/assets/brush-stroke-2.svg',
  splash: '/assets/paint-splash.svg',
}

const STYLES = {
  tr: { top: '-30px', right: '-40px', transform: 'rotate(-15deg)' },
  tl: { top: '-30px', left: '-40px', transform: 'rotate(15deg) scaleX(-1)' },
  br: { bottom: '-30px', right: '-40px', transform: 'rotate(12deg) scaleX(-1)' },
  bl: { bottom: '-30px', left: '-40px', transform: 'rotate(-12deg)' },
}

export default function PaintStrokes({ items = [] }) {
  return items.map(({ variant = 'a', position = 'tr', width = 340, opacity = 0.55 }, i) => (
    <img
      key={i}
      src={ASSETS[variant] || ASSETS.a}
      alt=""
      aria-hidden="true"
      className="paint-stroke"
      style={{
        ...STYLES[position],
        width: `${width}px`,
        opacity,
      }}
    />
  ))
}
