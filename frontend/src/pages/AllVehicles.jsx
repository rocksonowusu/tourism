import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './AllVehicles.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconUsers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconSettings = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
const IconCar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
    <circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0b2c?w=600&q=80'
const PAGE_SIZE = 12

const VEHICLE_LABELS = {
  sedan:  'Sedan',
  suv:    'SUV',
  van:    'Van',
  bus:    'Bus',
  luxury: 'Luxury',
}

// ── Component ────────────────────────────────────────────────────────────
export default function AllVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (filter === 'featured') params.is_featured = true
      if (typeFilter) params.vehicle_type = typeFilter
      const data = await api.vehicles.list(params)
      setVehicles(data?.results ?? data ?? [])
      setTotal(data?.count ?? (data?.length ?? 0))
    } catch {
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [page, search, filter, typeFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, filter, typeFilter])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="app">
      <Header />
      <section className="all-vehicles">
        <PaintStrokes items={[
          { variant: 'a', position: 'tr', width: 360, opacity: 0.5 },
          { variant: 'b', position: 'bl', width: 320, opacity: 0.45 },
        ]} />
        <div className="container">

          {/* Breadcrumb */}
          <nav className="av__breadcrumb">
            <Link to="/">Home</Link>
            <span className="av__breadcrumb-sep">/</span>
            <span className="av__breadcrumb-current">Car Rentals</span>
          </nav>

          {/* Header */}
          <div className="av__header">
            <p className="av__eyebrow">Drive With Us</p>
            <h1 className="av__title">Car Rentals</h1>
            <p className="av__subtitle">
              Explore our fleet of well-maintained vehicles available for hire,
              from comfortable sedans to spacious SUVs and luxury rides.
            </p>
          </div>

          {/* Controls */}
          <div className="av__controls">
            <div className="av__search-wrap">
              <span className="av__search-icon"><IconSearch /></span>
              <input
                className="av__search"
                placeholder="Search vehicles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="av__filter"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="bus">Bus</option>
              <option value="luxury">Luxury</option>
            </select>
            <select
              className="av__filter"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="featured">Featured</option>
            </select>
            {!loading && (
              <span className="av__count">
                {total} vehicle{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="av__loading">
              <div className="av__spinner" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="av__empty">
              <div className="av__empty-icon"><IconCar /></div>
              <h3 className="av__empty-title">No vehicles found</h3>
              <p className="av__empty-desc">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="av__grid">
              {vehicles.map(v => {
                const img = v.media?.[0]?.file_url ?? FALLBACK_IMG

                return (
                  <Link key={v.id} to={`/car-rentals/${v.slug}`} className="av__card-link">
                    <article className="av__card">
                      <div className="av__card-img">
                        <img
                          src={img}
                          alt={v.name}
                          loading="lazy"
                          onError={e => { e.target.src = FALLBACK_IMG }}
                        />
                        <div className="av__card-overlay" />
                        {v.vehicle_type && (
                          <div className="av__card-type">
                            {VEHICLE_LABELS[v.vehicle_type] ?? v.vehicle_type}
                          </div>
                        )}
                        {v.is_featured && (
                          <span className="av__card-featured">
                            <IconStar /> Featured
                          </span>
                        )}
                      </div>
                      <div className="av__card-body">
                        <h3 className="av__card-name">{v.name}</h3>
                        <div className="av__card-meta">
                          {v.brand && (
                            <span className="av__card-meta-item">
                              {v.brand} {v.model_year ? `(${v.model_year})` : ''}
                            </span>
                          )}
                          {v.seats && (
                            <span className="av__card-meta-item">
                              <IconUsers /> {v.seats} Seat{v.seats !== 1 ? 's' : ''}
                            </span>
                          )}
                          {v.transmission && (
                            <span className="av__card-meta-item">
                              <IconSettings /> {v.transmission === 'automatic' ? 'Auto' : 'Manual'}
                            </span>
                          )}
                        </div>
                        <div className="av__card-footer">
                          <span className="av__card-price">
                            {v.price_per_day
                              ? `GH₵${Number(v.price_per_day).toLocaleString()}/day`
                              : 'Contact Us'}
                          </span>
                          <span className="av__card-cta">
                            View Details <IconArrowRight />
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
            <div className="av__pagination">
              <button
                className="av__page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <IconChevLeft />
              </button>
              <span className="av__page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="av__page-btn"
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
