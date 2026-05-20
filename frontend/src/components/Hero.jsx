import React, { useState, useEffect, useRef } from 'react'
import './Hero.css'



// Fallback bg slides when no media uploaded yet
const FALLBACK_SLIDES = [
  { url: 'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=1400&q=85', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1400&q=85', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1400&q=85', type: 'image' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=85', type: 'image' },
]


const SLIDE_DURATION = 5000
const FADE_DURATION  = 900

export default function Hero({ heroSlides = [] }) {
  // Use API-provided images with fallbacks
  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : FALLBACK_SLIDES

  const [current,  setCurrent]  = useState(0)
  const videoRefs  = useRef({})
  const timerRef   = useRef(null)

  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, SLIDE_DURATION)
    return () => clearInterval(timerRef.current)
  }, [slides.length])

  function goTo(i) {
    if (i === current) return
    clearInterval(timerRef.current)
    setCurrent(i)
    // Restart timer after manual navigation
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, SLIDE_DURATION)
  }

  function renderSlide(slide, idx) {
    const isActive = idx === current
    const cls = `hero__slide ${isActive ? 'hero__slide--active' : ''}`

    if (slide.type === 'video') {
      return (
        <video key={idx} className={cls}
          src={slide.url} autoPlay muted loop playsInline
          ref={el => { if (el) videoRefs.current[idx] = el }}
        />
      )
    }
    return (
      <img key={idx} className={cls}
        src={slide.url} alt={`Ghana slide ${idx + 1}`}
        loading={idx === 0 ? 'eager' : 'lazy'}
      />
    )
  }

  return (
    <section className="hero" id="home">

      {/* ── Full-bleed background slideshow ──────────────────────── */}
      <div className="hero__bg" aria-hidden="true">
        {slides.map((slide, idx) => renderSlide(slide, idx))}
        <div className="hero__overlay hero__overlay--gradient" />
        <div className="hero__overlay hero__overlay--vignette" />
      </div>

      {/* ── Foreground content ────────────────────────────────────── */}
      <div className="container hero__inner">

        {/* Left: text */}
        <div className="hero__text fade-in">
          <p className="hero__eyebrow">🇬🇭 1957 The Ghana Experience</p>
          <h1 className="hero__title">
            Your Journey<br />
            Through <em className="hero__highlight">Ghana</em><br />
            Starts Here
          </h1>
          <p className="hero__sub">
            We craft unforgettable tours, cultural immersions, and heritage
            experiences across Ghana, from the bustling streets of Accra to
            the ancient castles of the coast and the wildlife of the northern
            savannahs. Let us show you the real Ghana.
          </p>
          <div className="hero__cta">
            <a href="#destinations" className="btn-primary">Explore Our Experiences</a>
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
              <span className="hero__stat-label">Experiences</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">Since</span>
              <span className="hero__stat-label">2019</span>
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
