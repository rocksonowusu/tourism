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
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gold-rich, #C5A028)" stroke="var(--gold-rich, #C5A028)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconNavigation = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
)
// ── Season badge icons ────────────────────────────────────────────────
const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const IconFlame = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c-4.97 0-9-2.69-9-6 0-4 5-11 9-14 4 3 9 10 9 14 0 3.31-4.03 6-9 6z"/>
    <path d="M12 22c-1.66 0-3-1.12-3-2.5S10.34 14 12 14s3 4 3 5.5S13.66 22 12 22z"/>
  </svg>
)
const IconHourglass = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
  </svg>
)
const IconCalendarPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
)
const IconSunrise = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/>
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/>
    <line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
    <line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/>
  </svg>
)
const IconWind = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
  </svg>
)
const IconCamera = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IconRewind = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/>
  </svg>
)
const IconPinTack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/>
  </svg>
)
// ── Extra section icons ───────────────────────────────────────────────
const IconGift = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
)
const IconSparkles = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813L20 12l-6.088 3.187L12 21l-1.912-5.813L4 12l6.088-3.187L12 3z"/>
    <path d="M20 3l.75 2.25L23 6l-2.25.75L20 9l-.75-2.25L17 6l2.25-.75L20 3z"/>
  </svg>
)
const IconMessageCircle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
)

// Fallback hero images
const FALLBACK_HERO = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1400&q=85'

// ── Season label map ──────────────────────────────────────────────────
const SEASON_MAP = {
  'happening-now':   { icon: <IconZap />,          text: 'Happening Now!',     tone: 'live'    },
  'almost-here':     { icon: <IconFlame />,        text: 'Almost Here!',       tone: 'hot'     },
  'coming-soon':     { icon: <IconHourglass />,    text: 'Coming Soon',        tone: 'warm'    },
  'mark-calendar':   { icon: <IconCalendarPlus />, text: 'Mark Your Calendar', tone: 'plan'    },
  'on-the-horizon':  { icon: <IconSunrise />,      text: 'On the Horizon',     tone: 'far'     },
  'just-missed':     { icon: <IconWind />,         text: 'You Just Missed It!',tone: 'missed'  },
  'recently-ended':  { icon: <IconCamera />,       text: 'Recently Ended',     tone: 'past'    },
  'throwback':       { icon: <IconRewind />,       text: 'Throwback',          tone: 'memory'  },
  'date-tba':        { icon: <IconPinTack />,      text: 'Date TBA',           tone: 'tba'     },
}

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
  const [userLoc, setUserLoc]         = useState(null)  // { lat, lng }

  // Request user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLoc(null),
        { enableHighAccuracy: false, timeout: 8000 }
      )
    }
  }, [])

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
  const highlights = event.highlights ?? []
  const hasCoords = event.latitude && event.longitude

  // Build Google Maps directions URL
  const mapsDirectionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}${userLoc ? `&origin=${userLoc.lat},${userLoc.lng}` : ''}&travelmode=driving`
    : null
  // Embeddable map URL (no API key required for basic embed)
  const mapsEmbedUrl = hasCoords
    ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}&z=14&output=embed`
    : null

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
            {!isUpcoming && event.season_label && SEASON_MAP[event.season_label] && (
              <span className={`evd__countdown evd__countdown--${SEASON_MAP[event.season_label].tone}`}>
                {SEASON_MAP[event.season_label].icon} {SEASON_MAP[event.season_label].text}
              </span>
            )}
            {event.is_featured && <span className="evd__featured-badge"><IconStar /> Featured</span>}
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
              {event.season_label && SEASON_MAP[event.season_label] && (
                <div className="evd__info-item">
                  <span className="evd__info-label">Status</span>
                  <span className={`evd__status evd__status--${SEASON_MAP[event.season_label].tone}`}>
                    {SEASON_MAP[event.season_label].icon} {SEASON_MAP[event.season_label].text}
                  </span>
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

            {/* ── What's Included ──────────────────────────────────── */}
            {highlights.length > 0 && (
              <div className="evd__inclusions">
                <h2 className="evd__section-title"><IconGift /> What's Included When You Book</h2>
                <div className="evd__inclusions-grid">
                  {highlights.map((item, i) => (
                    <div key={i} className="evd__inclusion-item">
                      <span className="evd__inclusion-icon"><IconCheck /></span>
                      <span className="evd__inclusion-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Getting There – Google Maps ──────────────────────── */}
            {hasCoords && (
              <div className="evd__map-section">
                <h2 className="evd__section-title"><IconMapPin /> Getting There</h2>
                <p className="evd__map-subtitle">
                  {userLoc
                    ? 'We detected your location — see the directions below!'
                    : 'Allow location access for personalised directions from where you are.'}
                </p>
                <div className="evd__map-container">
                  <iframe
                    title={`Map to ${event.title}`}
                    src={mapsEmbedUrl}
                    width="100%"
                    height="350"
                    style={{ border: 0, borderRadius: '16px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="evd__map-actions">
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="evd__directions-btn"
                  >
                    <IconNavigation /> {userLoc ? 'Get Directions from My Location' : 'Get Directions'}
                  </a>
                  {userLoc && (
                    <span className="evd__location-note">
                      <IconMapPin /> Your location detected
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Why Book With Us ─────────────────────────────────── */}
            {isUpcoming && (
              <div className="evd__why-book">
                <div className="evd__why-book-inner">
                  <div className="evd__why-book-content">
                    <h2 className="evd__why-book-title">
                      <IconSparkles /> Why Experience This With Us?
                    </h2>
                    <p className="evd__why-book-desc">
                      Don't just attend — immerse yourself. When you book with us, we handle
                      the logistics so you can focus on making memories.
                    </p>
                    <ul className="evd__why-book-perks">
                      <li><IconCheck /> <span>Hassle-free transport to & from the venue</span></li>
                      <li><IconCheck /> <span>Local expert guide who knows every hidden gem</span></li>
                      <li><IconCheck /> <span>Guaranteed best-value pricing — no hidden fees</span></li>
                      <li><IconCheck /> <span>Small groups for a personal, authentic experience</span></li>
                      <li><IconStar /> <span>4.9 average rating from 200+ happy travellers</span></li>
                    </ul>
                  </div>
                  <div className="evd__why-book-cta-wrap">
                    <div className="evd__why-book-price-card">
                      <span className="evd__why-book-price-label">Starting from</span>
                      <span className="evd__why-book-price">{fmtPrice(event.price)}</span>
                      <span className="evd__why-book-price-note">per person</span>
                    </div>
                    <a
                      href={`https://wa.me/233XXXXXXXXX?text=${encodeURIComponent(`Hi! I'd like to book the "${event.title}" event (${fmtDate(event.date)}). Please send me more details.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="evd__book-btn"
                    >
                      Book This Experience
                    </a>
                    <p className="evd__book-note">
                      <IconMessageCircle /> Or message us on WhatsApp for group discounts
                    </p>
                  </div>
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
