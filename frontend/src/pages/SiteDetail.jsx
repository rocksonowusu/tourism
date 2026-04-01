import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './SiteDetail.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
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
const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconTag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
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

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1400&q=85'

// ── helpers ───────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtPrice(p) {
  if (!p || Number(p) === 0) return 'Free'
  return `GH₵ ${Number(p).toFixed(2)}`
}

function extractRegion(location) {
  if (!location) return null
  const regionMap = {
    'Greater Accra': ['Accra', 'Tema', 'Madina'],
    'Ashanti': ['Kumasi', 'Ashanti', 'Obuasi'],
    'Central': ['Cape Coast', 'Elmina', 'Central'],
    'Western': ['Takoradi', 'Sekondi', 'Western'],
    'Eastern': ['Koforidua', 'Eastern', 'Akosombo'],
    'Northern': ['Tamale', 'Northern'],
    'Volta': ['Ho', 'Keta', 'Volta', 'Wli'],
    'Bono': ['Sunyani', 'Bono'],
    'Upper East': ['Bolgatanga', 'Upper East'],
    'Upper West': ['Wa', 'Upper West'],
  }
  for (const [region, keywords] of Object.entries(regionMap)) {
    if (keywords.some(k => location.toLowerCase().includes(k.toLowerCase()))) return region
  }
  return null
}

// ── Component ─────────────────────────────────────────────────────────────
export default function SiteDetail() {
  const { slug } = useParams()
  const [site, setSite]               = useState(null)
  const [siteEvents, setSiteEvents]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [activeImg, setActiveImg]     = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setError(null)
    setActiveImg(0)

    api.sites.bySlug(slug)
      .then(data => {
        setSite(data)
        // Fetch events at this site
        return api.sites.events(data.id, { page_size: 6 }).catch(() => ({ results: [] }))
      })
      .then(res => {
        setSiteEvents(res?.results ?? [])
      })
      .catch(() => setError('Site not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="std__loading">
          <div className="std__spinner" />
          <p>Loading site…</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="app">
        <Header />
        <div className="std__error">
          <h2>Site Not Found</h2>
          <p>The tourist site you're looking for doesn't exist or has been removed.</p>
          <Link to="/#destinations" className="std__back-btn">
            <IconArrowLeft /> Back to Destinations
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const media = site.media ?? []
  const images = media.filter(m => m.media_type === 'image')
  const heroImages = images.length > 0 ? images : [{ id: 0, file_url: FALLBACK_HERO, caption: site.name }]
  const region = extractRegion(site.location)

  return (
    <div className="app">
      <Header />

      {/* ── Hero with image cycler ────────────────────────────────── */}
      <section className="std__hero">
        <div className="std__hero-bg">
          <img
            src={heroImages[activeImg]?.file_url ?? FALLBACK_HERO}
            alt={heroImages[activeImg]?.caption || site.name}
            key={activeImg}
          />
          <div className="std__hero-overlay" />
        </div>

        {/* Image dots */}
        {heroImages.length > 1 && (
          <div className="std__hero-dots">
            {heroImages.map((_, i) => (
              <button
                key={i}
                className={`std__hero-dot ${i === activeImg ? 'std__hero-dot--active' : ''}`}
                onClick={() => setActiveImg(i)}
              />
            ))}
          </div>
        )}

        <div className="container std__hero-inner">
          <Link to="/#destinations" className="std__breadcrumb">
            <IconArrowLeft /> All Destinations
          </Link>
          <div className="std__hero-content">
            {site.is_featured && (
              <span className="std__featured-badge"><IconStar /> Featured Destination</span>
            )}
            <h1 className="std__hero-title">{site.name}</h1>
            <div className="std__hero-meta">
              <span className="std__meta-chip"><IconMapPin /> {site.location}</span>
              {region && <span className="std__meta-chip">{region} Region</span>}
              {images.length > 0 && (
                <span className="std__meta-chip"><IconCamera /> {images.length} photo{images.length > 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <section className="std__body">
        <PaintStrokes items={[
          { variant: 'a', position: 'tr', width: 330, opacity: 0.45 },
          { variant: 'b', position: 'bl', width: 300, opacity: 0.4 },
        ]} />
        <div className="container std__layout">

          {/* Left column */}
          <div className="std__content">
            {/* About */}
            <div className="std__about">
              <h2 className="std__section-title">About {site.name}</h2>
              <div className="std__desc-text">
                {site.description
                  ? site.description.split('\n').map((para, i) => <p key={i}>{para}</p>)
                  : <p>A beautiful tourist destination in Ghana waiting to be explored.</p>
                }
              </div>
            </div>

            {/* Gallery */}
            {images.length > 0 && (
              <div className="std__gallery">
                <h2 className="std__section-title">Photos ({images.length})</h2>
                <div className="std__gallery-grid">
                  {images.map((m, i) => (
                    <div
                      key={m.id}
                      className="std__gallery-item"
                      onClick={() => setLightboxIdx(i)}
                    >
                      <img src={m.file_url} alt={m.caption || site.name} loading="lazy" />
                      {m.caption && <span className="std__gallery-caption">{m.caption}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events at this site */}
            {siteEvents.length > 0 && (
              <div className="std__events">
                <h2 className="std__section-title">Events at {site.name}</h2>
                <div className="std__events-grid">
                  {siteEvents.map(ev => {
                    const evImg = ev.media?.[0]?.file_url
                    return (
                      <Link key={ev.id} to={`/events/${ev.slug}`} className="std__event-card">
                        {evImg && (
                          <div className="std__event-card-img">
                            <img src={evImg} alt={ev.title} loading="lazy" />
                          </div>
                        )}
                        <div className="std__event-card-body">
                          <h4 className="std__event-card-title">{ev.title}</h4>
                          <div className="std__event-card-meta">
                            {ev.date && (
                              <span><IconCalendar /> {fmtDate(ev.date)}</span>
                            )}
                            {ev.price && Number(ev.price) > 0 && (
                              <span><IconTag /> {fmtPrice(ev.price)}</span>
                            )}
                          </div>
                          {ev.is_upcoming && <span className="std__event-badge">Upcoming</span>}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="std__sidebar">
            {/* Quick info */}
            <div className="std__sidebar-card">
              <h3 className="std__sidebar-title">Destination Info</h3>
              <ul className="std__facts">
                <li><IconMapPin /><span>{site.location}</span></li>
                {region && <li><IconStar /><span>{region} Region</span></li>}
                {site.media_count > 0 && <li><IconCamera /><span>{site.media_count} media file{site.media_count > 1 ? 's' : ''}</span></li>}
                {site.upcoming_events_count > 0 && (
                  <li><IconCalendar /><span>{site.upcoming_events_count} upcoming event{site.upcoming_events_count > 1 ? 's' : ''}</span></li>
                )}
              </ul>
            </div>

            {/* Share */}
            <div className="std__sidebar-card">
              <h3 className="std__sidebar-title">Share</h3>
              <button
                className="std__share-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href)
                  alert('Link copied!')
                }}
              >
                <IconShare /> Copy Link
              </button>
            </div>

            {/* Getting there — placeholder for future map */}
            <div className="std__sidebar-card">
              <h3 className="std__sidebar-title">Getting There</h3>
              <div className="std__map-placeholder">
                <IconMapPin />
                <span>{site.location}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {lightboxIdx !== null && images.length > 0 && (
        <div className="std__lightbox" onClick={() => setLightboxIdx(null)}>
          <button className="std__lb-close" onClick={() => setLightboxIdx(null)}><IconX /></button>
          <button
            className="std__lb-prev"
            onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + images.length) % images.length) }}
          >
            <IconChevLeft />
          </button>
          <img
            src={images[lightboxIdx].file_url}
            alt={images[lightboxIdx].caption || site.name}
            className="std__lb-img"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="std__lb-next"
            onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % images.length) }}
          >
            <IconChevRight />
          </button>
          <div className="std__lb-counter">{lightboxIdx + 1} / {images.length}</div>
        </div>
      )}

      <Footer />
    </div>
  )
}
