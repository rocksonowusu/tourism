import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './EventDetail.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconTag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconShare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconChevLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// Fallback hero images
const FALLBACK_HERO = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1400&q=85'

// ── helpers ───────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtTime(d) {
  if (!d) return null
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function fmtPrice(p) {
  if (!p || Number(p) === 0) return 'Free'
  return `GH₵ ${Number(p).toFixed(2)}`
}

function timeUntil(d) {
  if (!d) return null
  const diff = new Date(d) - new Date()
  if (diff < 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 30) return `${Math.floor(days / 30)} months away`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} away`
  const hrs = Math.floor(diff / (1000 * 60 * 60))
  return hrs > 0 ? `${hrs} hour${hrs > 1 ? 's' : ''} away` : 'Starting soon'
}

// ── Component ─────────────────────────────────────────────────────────────
export default function EventDetail() {
  const { slug } = useParams()
  const [event, setEvent]             = useState(null)
  const [relatedEvents, setRelated]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [lightboxIdx, setLightboxIdx] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setError(null)

    api.events.bySlug(slug)
      .then(data => {
        setEvent(data)
        // Fetch related events (same site or upcoming)
        return api.events.upcoming({ page_size: 4 })
      })
      .then(res => {
        const items = (res?.results ?? []).filter(e => e.slug !== slug)
        setRelated(items.slice(0, 3))
      })
      .catch(() => setError('Event not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="evd__loading">
          <div className="evd__spinner" />
          <p>Loading event…</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="app">
        <Header />
        <div className="evd__error">
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="evd__back-btn">
            <IconArrowLeft /> Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const media = event.media ?? []
  const images = media.filter(m => m.media_type === 'image')
  const heroImg = images[0]?.file_url ?? FALLBACK_HERO
  const countdown = timeUntil(event.date)
  const isUpcoming = event.is_upcoming
  const site = event.tourist_site

  return (
    <div className="app">
      <Header />

      {/* ── Hero banner ──────────────────────────────────────────── */}
      <section className="evd__hero">
        <div className="evd__hero-bg">
          <img src={heroImg} alt={event.title} />
          <div className="evd__hero-overlay" />
        </div>
        <div className="container evd__hero-inner">
          <Link to="/#events" className="evd__breadcrumb">
            <IconArrowLeft /> All Events
          </Link>
          <div className="evd__hero-content">
            {isUpcoming && countdown && (
              <span className="evd__countdown">
                <IconClock /> {countdown}
              </span>
            )}
            {event.is_featured && <span className="evd__featured-badge">★ Featured</span>}
            <h1 className="evd__hero-title">{event.title}</h1>
            <div className="evd__hero-meta">
              {event.date && (
                <span className="evd__meta-chip">
                  <IconCalendar /> {fmtDate(event.date)}
                </span>
              )}
              {event.location && (
                <span className="evd__meta-chip">
                  <IconMapPin /> {event.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────── */}
      <section className="evd__body">
        <div className="container evd__layout">

          {/* Left: content column */}
          <div className="evd__content">
            {/* Info bar */}
            <div className="evd__info-bar">
              <div className="evd__info-item">
                <span className="evd__info-label">Date & Time</span>
                <span className="evd__info-value">
                  {fmtDate(event.date) ?? 'TBA'}
                  {fmtTime(event.date) && ` · ${fmtTime(event.date)}`}
                </span>
              </div>
              <div className="evd__info-item">
                <span className="evd__info-label">Location</span>
                <span className="evd__info-value">{event.location || 'TBA'}</span>
              </div>
              <div className="evd__info-item">
                <span className="evd__info-label">Price</span>
                <span className="evd__info-value evd__price">{fmtPrice(event.price)}</span>
              </div>
              {isUpcoming && (
                <div className="evd__info-item">
                  <span className="evd__info-label">Status</span>
                  <span className="evd__status evd__status--upcoming">Upcoming</span>
                </div>
              )}
              {event.is_past && (
                <div className="evd__info-item">
                  <span className="evd__info-label">Status</span>
                  <span className="evd__status evd__status--past">Past Event</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="evd__description">
              <h2 className="evd__section-title">About This Event</h2>
              <div className="evd__desc-text">
                {event.description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Linked site */}
            {site && (
              <div className="evd__linked-site">
                <h3 className="evd__section-title">Venue</h3>
                <Link to={`/sites/${site.slug}`} className="evd__site-card">
                  <div className="evd__site-card-icon">
                    <IconMapPin />
                  </div>
                  <div className="evd__site-card-info">
                    <span className="evd__site-card-name">{site.name}</span>
                    <span className="evd__site-card-loc">{site.location}</span>
                  </div>
                  <IconArrowRight />
                </Link>
              </div>
            )}

            {/* Media gallery */}
            {images.length > 0 && (
              <div className="evd__gallery">
                <h2 className="evd__section-title">Gallery ({images.length})</h2>
                <div className="evd__gallery-grid">
                  {images.map((m, i) => (
                    <div
                      key={m.id}
                      className="evd__gallery-item"
                      onClick={() => setLightboxIdx(i)}
                    >
                      <img src={m.file_url} alt={m.caption || event.title} loading="lazy" />
                      {m.caption && <span className="evd__gallery-caption">{m.caption}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <aside className="evd__sidebar">
            {/* Share card */}
            <div className="evd__sidebar-card">
              <h3 className="evd__sidebar-title">Share Event</h3>
              <button
                className="evd__share-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href)
                  alert('Link copied!')
                }}
              >
                <IconShare /> Copy Link
              </button>
            </div>

            {/* Quick facts */}
            <div className="evd__sidebar-card">
              <h3 className="evd__sidebar-title">Quick Facts</h3>
              <ul className="evd__facts">
                <li><IconCalendar /><span>{fmtDate(event.date) ?? 'TBA'}</span></li>
                <li><IconMapPin /><span>{event.location}</span></li>
                <li><IconTag /><span>{fmtPrice(event.price)}</span></li>
                {event.media_count > 0 && (
                  <li><IconClock /><span>{event.media_count} media file{event.media_count > 1 ? 's' : ''}</span></li>
                )}
              </ul>
            </div>

            {/* Related events */}
            {relatedEvents.length > 0 && (
              <div className="evd__sidebar-card">
                <h3 className="evd__sidebar-title">More Events</h3>
                <div className="evd__related-list">
                  {relatedEvents.map(re => (
                    <Link key={re.id} to={`/events/${re.slug}`} className="evd__related-item">
                      <span className="evd__related-name">{re.title}</span>
                      <span className="evd__related-date">{fmtDate(re.date)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {lightboxIdx !== null && images.length > 0 && (
        <div className="evd__lightbox" onClick={() => setLightboxIdx(null)}>
          <button className="evd__lb-close" onClick={() => setLightboxIdx(null)}><IconX /></button>
          <button
            className="evd__lb-prev"
            onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + images.length) % images.length) }}
          >
            <IconChevLeft />
          </button>
          <img
            src={images[lightboxIdx].file_url}
            alt={images[lightboxIdx].caption || event.title}
            className="evd__lb-img"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="evd__lb-next"
            onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % images.length) }}
          >
            <IconChevRight />
          </button>
          <div className="evd__lb-counter">{lightboxIdx + 1} / {images.length}</div>
        </div>
      )}

      <Footer />
    </div>
  )
}
