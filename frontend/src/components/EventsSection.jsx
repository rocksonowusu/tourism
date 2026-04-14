import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './EventsSection.css'
import PaintStrokes from './PaintStrokes'
import { useScrollReveal } from '../hooks/useScrollReveal'

// ── Small utility icons ──────────────────────────────────────────────────
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

// ── Experience type showcase icons (28 px) ───────────────────────────────
const IconBriefcase = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="2" y1="13" x2="22" y2="13"/>
  </svg>
)
const IconHeart = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconSun = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IconActivity = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const IconMusic = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
)
const IconStar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

// ── Experience types data ────────────────────────────────────────────────
const EXPERIENCE_TYPES = [
  {
    key: 'corporate',
    Icon: IconBriefcase,
    title: 'Corporate Events',
    description: 'Team-building retreats, conferences, and company offsites designed to inspire your team in breathtaking Ghanaian settings.',
    examples: ['Team Building Retreats', 'Conferences & Workshops'],
  },
  {
    key: 'family_friends',
    Icon: IconHeart,
    title: 'Family & Friends',
    description: 'Reunions, birthday celebrations, and group getaways. Create unforgettable memories with the people who matter most.',
    examples: ['Family Reunions', 'Birthday Celebrations'],
  },
  {
    key: 'retreat',
    Icon: IconSun,
    title: 'Retreats',
    description: 'Wellness, spiritual, and creative retreats. Disconnect from the noise and reconnect with yourself in serene Ghanaian landscapes.',
    examples: ['Wellness Retreats', 'Creative Getaways'],
  },
  {
    key: 'recreational',
    Icon: IconActivity,
    title: 'Recreational',
    description: 'Adventure, sports, and outdoor activities, from beach volleyball on Ada Foah to hiking in the Volta Region\'s misty mountains.',
    examples: ['Adventure Outings', 'Beach & Water Sports'],
  },
  {
    key: 'cultural',
    Icon: IconMusic,
    title: 'Cultural Experiences',
    description: 'Festivals, traditional ceremonies, and heritage immersions. Live the vibrant culture of Ghana through authentic local experiences.',
    examples: ['Festival Experiences', 'Heritage Immersions'],
  },
  {
    key: 'custom',
    Icon: IconStar,
    title: 'Custom Events',
    description: 'Have something unique in mind? Tell us your vision and we\'ll bring it to life, from intimate dinners to grand celebrations.',
    examples: ['Bespoke Celebrations', 'Themed Gatherings'],
  },
]

const FALLBACK_BG = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=75'
const CYCLE_INTERVAL = 6000 // 6 seconds per image

export default function EventsSection({ eventBgImages = [] }) {
  const headerRef      = useScrollReveal({ threshold: 0.1 })
  const showcaseRef    = useScrollReveal({ threshold: 0.06, stagger: true })

  // ── Use API-provided images with fallback ─────────────────────────────
  const bgImages = eventBgImages && eventBgImages.length > 0 ? eventBgImages : [FALLBACK_BG]

  // ── Cycle through images ─────────────────────────────────────────────
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (bgImages.length <= 1) return
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % bgImages.length)
    }, CYCLE_INTERVAL)
    return () => clearInterval(timer)
  }, [bgImages.length])

  return (
    <section className="ev-section" id="events">
      {/* Cycling background images */}
      <div className="ev__bg-slideshow" aria-hidden="true">
        {bgImages.map((url, i) => (
          <img
            key={url}
            src={url}
            alt=""
            className={`ev__bg-slide ${i === activeIdx ? 'ev__bg-slide--active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      {/* Warm overlay so text is readable */}
      <div className="ev__bg-overlay" />

      <PaintStrokes items={[
        { variant: 'b', position: 'tl', width: 340, opacity: 0.5 },
        { variant: 'a', position: 'br', width: 380, opacity: 0.5 },
      ]} />
      <div className="container">

        {/* ═══════════════════════════════════════════════════════════
            PART 1: Experience Types Showcase
            ═══════════════════════════════════════════════════════════ */}
        <div className="ev__header sr" ref={headerRef}>
          <div>
            <p className="ev__eyebrow">Events &amp; Experiences</p>
            <h2 className="ev__title">What We Organise</h2>
            <p className="ev__showcase-subtitle">
              From corporate retreats to cultural immersions, we craft every kind
              of experience to make your time in Ghana unforgettable.
            </p>
          </div>
          <Link to="/events" className="ev__view-all">
            View all events <IconArrow />
          </Link>
        </div>

        {/* 3x2 showcase grid */}
        <div className="ev__showcase-grid sr" ref={showcaseRef}>
          {EXPERIENCE_TYPES.map((type, i) => (
            <Link
              key={type.key}
              to={`/events?category=${type.key}`}
              className="ev__showcase-card sr--child"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="ev__showcase-icon">
                <type.Icon />
              </div>
              <div className="ev__showcase-content">
                <h3 className="ev__showcase-name">{type.title}</h3>
                <p className="ev__showcase-desc">{type.description}</p>
                <div className="ev__showcase-examples">
                  {type.examples.map((ex, j) => (
                    <span key={j} className="ev__showcase-tag">{ex}</span>
                  ))}
                </div>
              </div>
              <span className="ev__showcase-arrow"><IconArrow /></span>
            </Link>
          ))}
        </div>

        {/* CTA banner */}
        <div className="ev__showcase-cta">
          <p className="ev__showcase-cta-text">
            Don't see exactly what you're looking for?
          </p>
          <Link to="/request-event" className="ev__showcase-cta-btn">
            Request a Custom Event <IconArrow />
          </Link>
        </div>

      </div>
    </section>
  )
}
