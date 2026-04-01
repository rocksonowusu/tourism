import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import './ToursSection.css'
import { useScrollReveal } from '../hooks/useScrollReveal'

// ── Icons ────────────────────────────────────────────────────────────────
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconChevLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconCompass = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
)
const IconRoute = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
    <circle cx="18" cy="5" r="3"/>
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'
const AUTO_PLAY_INTERVAL = 6000

// ── Component ────────────────────────────────────────────────────────────
export default function ToursSection({ tours = [], loading }) {
  const headerRef = useScrollReveal({ threshold: 0.1 })

  const [active, setActive]     = useState(0)
  const [paused, setPaused]     = useState(false)
  const timerRef                = useRef(null)

  // Map API data
  const displayTours = tours.map(t => ({
    id:          t.id,
    slug:        t.slug,
    title:       t.title ?? t.name,
    location:    t.location ?? '',
    description: t.description ?? '',
    duration:    t.duration ?? '',
    maxGroup:    t.max_group_size,
    isFeatured:  t.is_featured,
    highlights:  t.highlights ?? [],
    image:       t.media?.[0]?.file_url ?? FALLBACK_IMG,
  }))

  const count = displayTours.length

  // Auto-play
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    if (count <= 1) return
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % count)
    }, AUTO_PLAY_INTERVAL)
  }, [count])

  useEffect(() => {
    if (!paused && count > 1) startTimer()
    return () => clearInterval(timerRef.current)
  }, [paused, startTimer, count])

  const goTo = (idx) => {
    setActive(idx)
    startTimer()
  }
  const goPrev = () => goTo((active - 1 + count) % count)
  const goNext = () => goTo((active + 1) % count)

  const current = displayTours[active]

  return (
    <section className="tours-section" id="tours">
      <div className="container">
        {/* Section header */}
        <div className="ts__header sr" ref={headerRef}>
          <div>
            <p className="ts__eyebrow">Curated Experiences</p>
            <h2 className="ts__title">Our Tour Packages</h2>
            <p className="ts__subtitle">
              Handcrafted itineraries that bring Ghana to life — from heritage trails and coastal
              adventures to cultural immersions.
            </p>
          </div>
          <div className="ts__header-actions">
            <Link to="/tours" className="ts__view-all">
              View all tours <IconArrow />
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel */}
      {loading ? (
        <div className="ts__carousel-skeleton">
          <div className="ts__skeleton-shimmer" />
        </div>
      ) : count === 0 ? (
        <div className="ts__empty">
          <div className="ts__empty-icon"><IconCompass /></div>
          <h3>Tours Coming Soon</h3>
          <p>We're crafting incredible Ghana experiences. Check back soon!</p>
        </div>
      ) : (
        <div
          className="ts__carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Background images */}
          {displayTours.map((tour, i) => (
            <div
              key={tour.id ?? i}
              className={`ts__slide ${i === active ? 'ts__slide--active' : ''}`}
            >
              <img
                src={tour.image}
                alt={tour.title}
                className="ts__slide-img"
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={e => { e.target.src = FALLBACK_IMG }}
              />
              <div className="ts__slide-overlay" />
            </div>
          ))}

          {/* Content overlay */}
          {current && (
            <div className="ts__carousel-content" key={active}>
              <div className="container ts__carousel-inner">
                <div className="ts__carousel-text">
                  {current.isFeatured && (
                    <span className="ts__carousel-badge">★ Featured Tour</span>
                  )}
                  <h3 className="ts__carousel-title">{current.title}</h3>

                  <div className="ts__carousel-meta">
                    {current.location && (
                      <span className="ts__carousel-meta-item">
                        <IconMapPin /> {current.location}
                      </span>
                    )}
                    {current.duration && (
                      <span className="ts__carousel-meta-item">
                        <IconClock /> {current.duration}
                      </span>
                    )}
                  </div>

                  {current.description && (
                    <p className="ts__carousel-desc">{current.description}</p>
                  )}

                  <div className="ts__carousel-actions">
                    <Link
                      to={`/tours/${current.slug}`}
                      className="ts__carousel-btn ts__carousel-btn--primary"
                    >
                      View Tour <IconArrow />
                    </Link>
                    <Link
                      to="/plan-tour"
                      className="ts__carousel-btn ts__carousel-btn--outline"
                    >
                      <IconRoute /> Plan Your Own
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nav arrows */}
          {count > 1 && (
            <>
              <button className="ts__arrow ts__arrow--left" onClick={goPrev} aria-label="Previous tour">
                <IconChevLeft />
              </button>
              <button className="ts__arrow ts__arrow--right" onClick={goNext} aria-label="Next tour">
                <IconChevRight />
              </button>
            </>
          )}

          {/* Dots */}
          {count > 1 && (
            <div className="ts__dots">
              {displayTours.map((_, i) => (
                <button
                  key={i}
                  className={`ts__dot ${i === active ? 'ts__dot--active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to tour ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Progress bar */}
          {count > 1 && !paused && (
            <div className="ts__progress">
              <div
                className="ts__progress-bar"
                key={`progress-${active}`}
                style={{ animationDuration: `${AUTO_PLAY_INTERVAL}ms` }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
