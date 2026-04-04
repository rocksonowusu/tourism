import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './AllEvents.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconChevLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// ── Season icons ──────────────────────────────────────────────────────────
const IconZap = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const IconFlame = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c-4.97 0-9-2.69-9-6 0-4 5-11 9-14 4 3 9 10 9 14 0 3.31-4.03 6-9 6z"/>
    <path d="M12 22c-1.66 0-3-1.12-3-2.5S10.34 14 12 14s3 4 3 5.5S13.66 22 12 22z"/>
  </svg>
)
const IconHourglass = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
  </svg>
)
const IconCalendarPlus = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
)
const IconSunrise = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/>
    <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/>
    <line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
    <line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/>
  </svg>
)
const IconWind = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
  </svg>
)
const IconCamera = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IconRewind = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/>
  </svg>
)
const IconPin = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
  </svg>
)

const SEASON_MAP = {
  'happening-now':   { icon: <IconZap />,          text: 'Happening Now!',     tone: 'live'    },
  'almost-here':     { icon: <IconFlame />,        text: 'Almost Here!',       tone: 'hot'     },
  'coming-soon':     { icon: <IconHourglass />,    text: 'Coming Soon',        tone: 'warm'    },
  'mark-calendar':   { icon: <IconCalendarPlus />, text: 'Mark Your Calendar', tone: 'plan'    },
  'on-the-horizon':  { icon: <IconSunrise />,      text: 'On the Horizon',     tone: 'far'     },
  'just-missed':     { icon: <IconWind />,         text: 'You Just Missed It!',tone: 'missed'  },
  'recently-ended':  { icon: <IconCamera />,       text: 'Recently Ended',     tone: 'past'    },
  'throwback':       { icon: <IconRewind />,       text: 'Throwback',          tone: 'memory'  },
  'date-tba':        { icon: <IconPin />,          text: 'Date TBA',           tone: 'tba'     },
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80'
const PAGE_SIZE = 12

const CATEGORY_LABELS = {
  '':               'All Events',
  'corporate':      'Corporate',
  'family_friends': 'Family & Friends',
  'retreat':        'Retreat',
  'recreational':   'Recreational',
  'cultural':       'Cultural',
  'couples':        'Couples',
  'custom':         'Custom',
}

function formatDate(dateStr) {
  if (!dateStr) return {}
  const d = new Date(dateStr)
  return {
    day:   d.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    full:  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  }
}

// ── Component ────────────────────────────────────────────────────────────
export default function AllEvents() {
  const [events, setEvents]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [category, setCategory] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (filter === 'upcoming') params.is_upcoming = true
      if (filter === 'past')     params.is_past     = true
      if (filter === 'featured') params.is_featured = true
      if (category) params.category = category
      const data = await api.events.list(params)
      setEvents(data?.results ?? data ?? [])
      setTotal(data?.count ?? (data?.length ?? 0))
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page, search, filter, category])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, filter, category])

  // scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="app">
      <Header />
      <section className="all-events">
        <PaintStrokes items={[
          { variant: 'a', position: 'tr', width: 360, opacity: 0.5 },
          { variant: 'b', position: 'bl', width: 320, opacity: 0.45 },
        ]} />
        <div className="container">

          {/* Breadcrumb */}
          <nav className="ae__breadcrumb">
            <Link to="/">Home</Link>
            <span className="ae__breadcrumb-sep">/</span>
            <span className="ae__breadcrumb-current">Events</span>
          </nav>

          {/* Header */}
          <div className="ae__header">
            <p className="ae__eyebrow">What's On in Ghana</p>
            <h1 className="ae__title">All Events</h1>
            <p className="ae__subtitle">
              Discover festivals, cultural celebrations, and unforgettable experiences
              happening across Ghana.
            </p>
          </div>

          {/* Controls */}
          <div className="ae__controls">
            <div className="ae__search-wrap">
              <span className="ae__search-icon"><IconSearch /></span>
              <input
                className="ae__search"
                placeholder="Search events…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="ae__filter"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="featured">Featured</option>
            </select>
            {!loading && (
              <span className="ae__count">
                {total} event{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Category pills */}
          <div className="ae__categories">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`ae__cat-pill${category === key ? ' ae__cat-pill--active' : ''}`}
                onClick={() => setCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Request an Event CTA */}
          <div className="ae__request-banner">
            <div className="ae__request-banner-text">
              <h3>Want us to organise a custom event for you?</h3>
              <p>Corporate retreats, family gatherings, recreational activities. We plan it all.</p>
            </div>
            <Link to="/request-event" className="ae__request-banner-btn">
              Request an Event →
            </Link>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="ae__loading">
              <div className="ae__spinner" />
            </div>
          ) : events.length === 0 ? (
            <div className="ae__empty">
              <div className="ae__empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="ae__empty-title">No events found</h3>
              <p className="ae__empty-desc">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="ae__grid">
              {events.map(ev => {
                const d = formatDate(ev.date)
                const season = ev.season_label && SEASON_MAP[ev.season_label]
                const img = ev.media?.[0]?.file_url ?? FALLBACK_IMG

                return (
                  <Link key={ev.id} to={`/events/${ev.slug}`} className="ae__card-link">
                    <article className="ae__card">
                      <div className="ae__card-img">
                        <img
                          src={img}
                          alt={ev.title}
                          loading="lazy"
                          onError={e => { e.target.src = FALLBACK_IMG }}
                        />
                        <div className="ae__card-overlay" />
                        {d.day && (
                          <div className="ae__card-date">
                            <span className="ae__card-date-day">{d.day}</span>
                            <span className="ae__card-date-month">{d.month}</span>
                          </div>
                        )}
                        {season && (
                          <span className={`ae__card-season ae__card-season--${season.tone}`}>
                            {season.icon} {season.text}
                          </span>
                        )}
                      </div>
                      <div className="ae__card-body">
                        <h3 className="ae__card-name">{ev.title}</h3>
                        {ev.category && CATEGORY_LABELS[ev.category] && (
                          <span className="ae__card-category">{CATEGORY_LABELS[ev.category]}</span>
                        )}
                        <div className="ae__card-meta">
                          {ev.location && (
                            <span className="ae__card-meta-item">
                              <IconMapPin /> {ev.location}
                            </span>
                          )}
                          {d.full && (
                            <span className="ae__card-meta-item">
                              <IconCalendar /> {d.full}
                            </span>
                          )}
                        </div>
                        {ev.description && (
                          <p className="ae__card-desc">{ev.description}</p>
                        )}
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ae__pagination">
              <button
                className="ae__page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <IconChevLeft />
              </button>
              <span className="ae__page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="ae__page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <IconChevRight />
              </button>
            </div>
          )}

        </div>
      </section>
      <Footer />
    </div>
  )
}
