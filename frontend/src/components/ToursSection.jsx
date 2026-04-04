import React from 'react'
import { Link } from 'react-router-dom'
import './ToursSection.css'
import PaintStrokes from './PaintStrokes'
import { useScrollReveal } from '../hooks/useScrollReveal'

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconCompass = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
)
const IconRoute = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
    <circle cx="18" cy="5" r="3"/>
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80'

/* ── Rough organic blob clip path (used to mask images) ────────────── */
function RoughCircleClip({ id }) {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <path d="M0.5 0.02 C0.62 0.0,0.78 0.04,0.88 0.14 C0.96 0.22,0.99 0.36,0.98 0.48 C0.97 0.62,0.96 0.76,0.88 0.86 C0.78 0.96,0.64 0.99,0.5 0.98 C0.36 0.97,0.22 0.96,0.13 0.87 C0.04 0.78,0.01 0.64,0.02 0.5 C0.03 0.36,0.06 0.22,0.14 0.13 C0.24 0.04,0.38 0.01,0.5 0.02Z" />
        </clipPath>
      </defs>
    </svg>
  )
}

/* ── Gold paint spatter SVG scattered in the bg ────────────────────── */
function GoldSpatters() {
  return (
    <svg className="ts__spatters" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      {/* Top-left cluster */}
      <circle cx="80" cy="60" r="4" fill="#D4AF37" opacity="0.25"/>
      <circle cx="95" cy="45" r="2.5" fill="#C5A028" opacity="0.3"/>
      <circle cx="110" cy="70" r="3" fill="#E5B83C" opacity="0.2"/>
      <circle cx="60" cy="85" r="2" fill="#D4AF37" opacity="0.35"/>
      {/* Mid-right speckles */}
      <circle cx="1050" cy="300" r="5" fill="#D4AF37" opacity="0.18"/>
      <circle cx="1080" cy="280" r="3" fill="#C5A028" opacity="0.22"/>
      <circle cx="1100" cy="320" r="2.5" fill="#E5B83C" opacity="0.15"/>
      <circle cx="1120" cy="290" r="1.5" fill="#D4AF37" opacity="0.28"/>
      {/* Bottom-left splash */}
      <circle cx="150" cy="650" r="4" fill="#C5A028" opacity="0.2"/>
      <circle cx="130" cy="670" r="3" fill="#D4AF37" opacity="0.15"/>
      <circle cx="170" cy="680" r="2" fill="#E5B83C" opacity="0.25"/>
      {/* Centre dust */}
      <circle cx="600" cy="400" r="3" fill="#D4AF37" opacity="0.1"/>
      <circle cx="620" cy="390" r="2" fill="#C5A028" opacity="0.12"/>
      <circle cx="580" cy="420" r="1.5" fill="#E5B83C" opacity="0.14"/>
      {/* Top-right drips */}
      <ellipse cx="1000" cy="80" rx="3" ry="8" fill="#D4AF37" opacity="0.12" transform="rotate(-15 1000 80)"/>
      <ellipse cx="980" cy="100" rx="2" ry="6" fill="#C5A028" opacity="0.1" transform="rotate(10 980 100)"/>
      {/* Bottom-right mist */}
      <circle cx="1050" cy="700" r="6" fill="#D4AF37" opacity="0.08"/>
      <circle cx="1080" cy="720" r="4" fill="#C5A028" opacity="0.1"/>
      <circle cx="1030" cy="730" r="3" fill="#E5B83C" opacity="0.12"/>
    </svg>
  )
}

/* ── Gold brush stroke SVG ring around circle images ───────────────── */
function BrushRing() {
  return (
    <svg className="ts__ring-brush" viewBox="0 0 200 200" fill="none">
      {/* Thick rough outer stroke */}
      <circle cx="100" cy="100" r="94" stroke="#D4AF37" strokeWidth="5"
        strokeDasharray="12 4 20 6 8 10 14 5" strokeLinecap="round" opacity="0.4" />
      {/* Thinner inner accent */}
      <circle cx="100" cy="100" r="88" stroke="#E5B83C" strokeWidth="2.5"
        strokeDasharray="6 8 16 4" strokeLinecap="round" opacity="0.25" />
      {/* Paint drip accents */}
      <ellipse cx="100" cy="6" rx="3" ry="8" fill="#D4AF37" opacity="0.3" />
      <ellipse cx="194" cy="100" rx="3" ry="7" fill="#C5A028" opacity="0.25" transform="rotate(90 194 100)" />
      <ellipse cx="100" cy="194" rx="2.5" ry="6" fill="#E5B83C" opacity="0.2" />
      <ellipse cx="6" cy="100" rx="2" ry="5" fill="#D4AF37" opacity="0.22" transform="rotate(90 6 100)" />
      {/* Spatter dots */}
      <circle cx="30" cy="25" r="2" fill="#D4AF37" opacity="0.3"/>
      <circle cx="170" cy="30" r="1.5" fill="#C5A028" opacity="0.25"/>
      <circle cx="175" cy="170" r="2.5" fill="#E5B83C" opacity="0.2"/>
      <circle cx="25" cy="175" r="1.8" fill="#D4AF37" opacity="0.28"/>
    </svg>
  )
}

export default function ToursSection({ tours = [], loading }) {
  const headerRef = useScrollReveal({ threshold: 0.1 })

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

  return (
    <section className="tours-section" id="tours">
      {/* Textured background layers */}
      <div className="ts__bg-wash" />
      <div className="ts__bg-noise" />
      <GoldSpatters />

      {/* Corner paint strokes */}
      <PaintStrokes items={[
        { variant: 'a', position: 'tr', width: 340, opacity: 0.5 },
        { variant: 'b', position: 'bl', width: 280, opacity: 0.4 },
        { variant: 'splash', position: 'tl', width: 220, opacity: 0.25 },
      ]} />

      {/* Mid-section decorative strokes */}
      <img src="/assets/brush-stroke-2.svg" alt="" aria-hidden="true" className="ts__mid-stroke ts__mid-stroke--1" />
      <img src="/assets/brush-stroke.svg"   alt="" aria-hidden="true" className="ts__mid-stroke ts__mid-stroke--2" />
      <img src="/assets/paint-splash.svg"   alt="" aria-hidden="true" className="ts__mid-stroke ts__mid-stroke--3" />

      <div className="container">
        <div className="ts__header sr" ref={headerRef}>
          <div>
            <p className="ts__eyebrow">Curated Experiences</p>
            <h2 className="ts__title">Our Tour Packages</h2>
            <p className="ts__subtitle">
              Handcrafted itineraries that bring Ghana to life, from heritage trails
              and coastal adventures to cultural immersions.
            </p>
          </div>
          <div className="ts__header-actions">
            <Link to="/tours" className="ts__view-all">
              View all tours <IconArrow />
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="container">
          <div className="ts__zigzag">
            {[1, 2, 3].map(i => (
              <div key={i} className={`ts__item ${i % 2 === 0 ? 'ts__item--right' : ''}`}>
                <div className="ts__circle-wrap">
                  <div className="ts__circle ts__skeleton-circle" style={{ clipPath: 'none', borderRadius: '50%' }} />
                </div>
                <div className="ts__info">
                  <div className="ts__skeleton-line ts__skeleton-line--sm" />
                  <div className="ts__skeleton-line ts__skeleton-line--lg" />
                  <div className="ts__skeleton-line ts__skeleton-line--md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : displayTours.length === 0 ? (
        <div className="ts__empty">
          <div className="ts__empty-icon"><IconCompass /></div>
          <h3>Tours Coming Soon</h3>
          <p>We are crafting incredible Ghana experiences. Check back soon!</p>
        </div>
      ) : (
        <div className="container">
          <div className="ts__zigzag">
            {displayTours.map((tour, i) => {
              const isRight = i % 2 !== 0
              const clipId = `rough-circle-${tour.id}`
              return (
                <div
                  key={tour.id}
                  className={`ts__item ${isRight ? 'ts__item--right' : ''}`}
                >
                  <div className="ts__circle-wrap">
                    <RoughCircleClip id={clipId} />
                    {/* Outer rough gold ring (painted feel) */}
                    <svg className="ts__ring-outer" viewBox="0 0 200 200" fill="none">
                      <path d="M100 4 C124 2,156 10,176 28 C192 44,198 68,196 92 C194 118,190 144,174 164 C156 184,132 196,100 194 C68 192,44 186,26 168 C10 150,4 126,6 100 C8 74,14 48,30 30 C48 12,76 4,100 4Z"
                        stroke="#D4AF37" strokeWidth="3" fill="none" opacity="0.35"
                        strokeDasharray="8 4 12 6" strokeLinecap="round" />
                    </svg>
                    <BrushRing />
                    <div className="ts__circle" style={{ clipPath: `url(#${clipId})` }}>
                      <img
                        src={tour.image}
                        alt={tour.title}
                        className="ts__circle-img"
                        onError={e => { e.target.src = FALLBACK_IMG }}
                      />
                    </div>
                    {tour.isFeatured && (
                      <span className="ts__badge">&#9733; Featured</span>
                    )}
                  </div>

                  <div className="ts__info">
                    <h3 className="ts__info-title">{tour.title}</h3>

                    <div className="ts__info-meta">
                      {tour.location && (
                        <span className="ts__meta-item">
                          <IconMapPin /> {tour.location}
                        </span>
                      )}
                      {tour.duration && (
                        <span className="ts__meta-item">
                          <IconClock /> {tour.duration}
                        </span>
                      )}
                      {tour.maxGroup && (
                        <span className="ts__meta-item">
                          <IconUsers /> Up to {tour.maxGroup}
                        </span>
                      )}
                    </div>

                    {tour.description && (
                      <p className="ts__info-desc">{tour.description}</p>
                    )}

                    {tour.highlights.length > 0 && (
                      <div className="ts__info-highlights">
                        {tour.highlights.slice(0, 3).map((h, idx) => (
                          <span key={idx} className="ts__pill">{h}</span>
                        ))}
                      </div>
                    )}

                    <div className="ts__info-actions">
                      <Link to={`/tours/${tour.slug}`} className="ts__btn ts__btn--primary">
                        View Tour <IconArrow />
                      </Link>
                      <Link to="/plan-tour" className="ts__btn ts__btn--outline">
                        <IconRoute /> Plan Your Own
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
