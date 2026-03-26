import React, { useState, useEffect, useRef } from 'react'
import './Hero.css'



// Fallback bg slides when no media uploaded yet
const FALLBACK_SLIDES = [
  { url: 'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=1400&q=85', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1400&q=85', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1400&q=85', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=85', type: 'image' },
]

// Fallback mosaic photos (right panel) — 3 cells:
// Index 0 → cell--1 (left col, spans all 3 rows — tall)
// Index 1 → cell--2 (right col, row 1 — short top)
// Index 2 → cell--3 (right col, rows 2-3 — tall bottom)
const FALLBACK_MOSAIC = [
  { url: 'http://res.cloudinary.com/dy8me66pj/image/upload/v1774488639/tourism/tourist_sites/vtubwgj6b5oc9qt72czr.jpg', alt: 'Wli Waterfalls' },
  { url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&q=80', alt: 'Accra' },
  { url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80', alt: 'African sunset' },
]

const SLIDE_DURATION = 5000
const FADE_DURATION  = 900

export default function Hero({ media = [] }) {
  // Always use curated fallback images for bg slideshow and mosaic panel
  // (uploaded media will only be used once proper per-section uploads are configured)
  const slides = FALLBACK_SLIDES
  const mosaic  = FALLBACK_MOSAIC

  const [current,  setCurrent]  = useState(0)
  const [next,     setNext]     = useState(null)
  const [fading,   setFading]   = useState(false)
  const videoRefs  = useRef({})
  const timerRef   = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(advance, SLIDE_DURATION)
    return () => clearTimeout(timerRef.current)
  }, [current, slides.length])

  function advance() {
    const nextIdx = (current + 1) % slides.length
    setNext(nextIdx); setFading(true)
    setTimeout(() => { setCurrent(nextIdx); setNext(null); setFading(false) }, FADE_DURATION)
  }

  function goTo(i) {
    if (i === current) return
    clearTimeout(timerRef.current)
    setNext(i); setFading(true)
    setTimeout(() => { setCurrent(i); setNext(null); setFading(false) }, FADE_DURATION)
  }

  function renderSlide(slide, idx, role) {
    const cls = [
      'hero__slide',
      role === 'active' ? 'hero__slide--active' : '',
      role === 'next' && fading ? 'hero__slide--in' : '',
    ].filter(Boolean).join(' ')

    if (slide.type === 'video') {
      return (
        <video key={`${idx}-${role}`} className={cls}
          src={slide.url} autoPlay muted loop playsInline
          ref={el => { if (el) videoRefs.current[idx] = el }}
        />
      )
    }
    return (
      <img key={`${idx}-${role}`} className={cls}
        src={slide.url} alt={`Ghana slide ${idx + 1}`}
        loading={idx === 0 ? 'eager' : 'lazy'}
      />
    )
  }

  return (
    <section className="hero" id="home">

      {/* ── Full-bleed background slideshow ──────────────────────── */}
      <div className="hero__bg" aria-hidden="true">
        {renderSlide(slides[current], current, 'active')}
        {next !== null && renderSlide(slides[next], next, 'next')}
        <div className="hero__overlay hero__overlay--gradient" />
        <div className="hero__overlay hero__overlay--vignette" />
      </div>

      {/* ── Foreground content ────────────────────────────────────── */}
      <div className="container hero__inner">

        {/* Left: text */}
        <div className="hero__text fade-in">
          <p className="hero__eyebrow">🇬🇭 The Gateway to West Africa</p>
          <h1 className="hero__title">
            Discover the<br />
            <em className="hero__highlight">Beauty</em> of<br />
            Ghana
          </h1>
          <p className="hero__sub">
            From the golden sands of Labadi Beach to the ancient walls of
            Cape Coast Castle, Ghana's rich history, vibrant culture, and
            breathtaking landscapes await every curious traveller.
          </p>
          <div className="hero__cta">
            <a href="#destinations" className="btn-primary">Explore Destinations</a>
            <a href="#events" className="hero__cta-secondary">Upcoming Events →</a>
          </div>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-num">16</span>
              <span className="hero__stat-label">Regions</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">200+</span>
              <span className="hero__stat-label">Tourist Sites</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">1M+</span>
              <span className="hero__stat-label">Annual Visitors</span>
            </div>
          </div>
        </div>

        {/* Right: floating mosaic panel */}
        <div className="hero__mosaic fade-in" style={{ animationDelay: '.2s' }} aria-hidden="true">
          <div className="hero__mosaic-grid">
            {/* All 4 cells — static fixed images */}
            {mosaic.map((img, i) => (
              <div key={i} className={`hero__mosaic-cell hero__mosaic-cell--${i + 1}`}>
                <img src={img.url} alt={img.alt} loading={i === 0 ? 'eager' : 'lazy'} />
              </div>
            ))}
          </div>

          {/* Gold accent ring */}
          <div className="hero__mosaic-ring" aria-hidden="true" />

          {/* Floating badge */}
          <div className="hero__badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <span className="hero__badge-top">Best time to visit</span>
              <span className="hero__badge-bot">Nov – Apr (Dry Season)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Slide indicator dots ─────────────────────────────────── */}
      {slides.length > 1 && (
        <div className="hero__dots" aria-label="Slideshow navigation">
          {slides.map((_, i) => (
            <button key={i}
              className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {slides.length > 1 && (
        <div className="hero__counter">
          {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </div>
      )}

    </section>
  )
}
