import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './AllTours.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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
const IconStar = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconRoute = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
    <circle cx="18" cy="5" r="3"/>
  </svg>
)
const IconCompass = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80'
const PAGE_SIZE = 12

// ── Component ────────────────────────────────────────────────────────────
export default function AllTours() {
  const [tours, setTours]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (filter === 'featured') params.is_featured = true
      const data = await api.tours.list(params)
      setTours(data?.results ?? data ?? [])
      setTotal(data?.count ?? (data?.length ?? 0))
    } catch {
      setTours([])
    } finally {
      setLoading(false)
    }
  }, [page, search, filter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, filter])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="app">
      <Header />
      <section className="all-tours">
        <PaintStrokes items={[
          { variant: 'a', position: 'tr', width: 360, opacity: 0.5 },
          { variant: 'b', position: 'bl', width: 320, opacity: 0.45 },
        ]} />
        <div className="container">

          {/* Breadcrumb */}
          <nav className="at__breadcrumb">
            <Link to="/">Home</Link>
            <span className="at__breadcrumb-sep">/</span>
            <span className="at__breadcrumb-current">Tours</span>
          </nav>

          {/* Header */}
          <div className="at__header">
            <p className="at__eyebrow">Plan Your Trip</p>
            <h1 className="at__title">Tour Packages</h1>
            <p className="at__subtitle">
              Discover curated tour packages across Ghana — from cultural immersions
              to coastal getaways and heritage trails.
            </p>
          </div>

          {/* ── Choose your path ─────────────────────────────────── */}
          <div className="at__choice-banner">
            <Link to="/tours" className="at__choice-card at__choice-card--active">
              <div className="at__choice-icon"><IconCompass /></div>
              <div className="at__choice-text">
                <h3 className="at__choice-title">Choose a Tour</h3>
                <p className="at__choice-desc">Browse our handcrafted packages and book your adventure.</p>
              </div>
            </Link>
            <span className="at__choice-divider">or</span>
            <Link to="/plan-tour" className="at__choice-card at__choice-card--custom">
              <div className="at__choice-icon"><IconRoute /></div>
              <div className="at__choice-text">
                <h3 className="at__choice-title">Plan Your Own Tour</h3>
                <p className="at__choice-desc">Pick your own sites, packages, and dates — we'll handle the rest.</p>
              </div>
              <span className="at__choice-arrow"><IconArrowRight /></span>
            </Link>
          </div>

          {/* Controls */}
          <div className="at__controls">
            <div className="at__search-wrap">
              <span className="at__search-icon"><IconSearch /></span>
              <input
                className="at__search"
                placeholder="Search tours…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="at__filter"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="">All Tours</option>
              <option value="featured">Featured</option>
            </select>
            {!loading && (
              <span className="at__count">
                {total} tour{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="at__loading">
              <div className="at__spinner" />
            </div>
          ) : tours.length === 0 ? (
            <div className="at__empty">
              <div className="at__empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="at__empty-title">No tours found</h3>
              <p className="at__empty-desc">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="at__grid">
              {tours.map(tour => {
                const img = tour.media?.[0]?.file_url ?? FALLBACK_IMG

                return (
                  <Link key={tour.id} to={`/tours/${tour.slug}`} className="at__card-link">
                    <article className="at__card">
                      <div className="at__card-img">
                        <img
                          src={img}
                          alt={tour.title}
                          loading="lazy"
                          onError={e => { e.target.src = FALLBACK_IMG }}
                        />
                        <div className="at__card-overlay" />
                        {tour.duration && (
                          <div className="at__card-duration">{tour.duration}</div>
                        )}
                        {tour.is_featured && (
                          <span className="at__card-featured">
                            <IconStar /> Featured
                          </span>
                        )}
                      </div>
                      <div className="at__card-body">
                        <h3 className="at__card-name">{tour.title}</h3>
                        <div className="at__card-meta">
                          {tour.location && (
                            <span className="at__card-meta-item">
                              <IconMapPin /> {tour.location}
                            </span>
                          )}
                          {tour.duration && (
                            <span className="at__card-meta-item">
                              <IconClock /> {tour.duration}
                            </span>
                          )}
                        </div>
                        <div className="at__card-footer">
                          <span className="at__card-price">Contact Us</span>
                          <span className="at__card-cta">
                            View Tour <IconArrowRight />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="at__pagination">
              <button
                className="at__page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <IconChevLeft />
              </button>
              <span className="at__page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="at__page-btn"
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
