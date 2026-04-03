import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './AllAccommodations.css'

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
const IconBed = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
  </svg>
)
const IconUsers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'
const PAGE_SIZE = 12

const PROPERTY_LABELS = {
  apartment: 'Apartment',
  house:     'House',
  villa:     'Villa',
  suite:     'Suite',
}

// ── Component ────────────────────────────────────────────────────────────
export default function AllAccommodations() {
  const [apartments, setApartments] = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      if (filter === 'featured') params.is_featured = true
      if (typeFilter) params.property_type = typeFilter
      const data = await api.apartments.list(params)
      setApartments(data?.results ?? data ?? [])
      setTotal(data?.count ?? (data?.length ?? 0))
    } catch {
      setApartments([])
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
      <section className="all-accommodations">
        <PaintStrokes items={[
          { variant: 'a', position: 'tr', width: 360, opacity: 0.5 },
          { variant: 'b', position: 'bl', width: 320, opacity: 0.45 },
        ]} />
        <div className="container">

          {/* Breadcrumb */}
          <nav className="aa__breadcrumb">
            <Link to="/">Home</Link>
            <span className="aa__breadcrumb-sep">/</span>
            <span className="aa__breadcrumb-current">Accommodations</span>
          </nav>

          {/* Header */}
          <div className="aa__header">
            <p className="aa__eyebrow">Stay With Us</p>
            <h1 className="aa__title">Accommodations</h1>
            <p className="aa__subtitle">
              Discover comfortable and curated stays across Ghana — from modern city
              apartments to serene coastal villas and luxury suites.
            </p>
          </div>

          {/* Controls */}
          <div className="aa__controls">
            <div className="aa__search-wrap">
              <span className="aa__search-icon"><IconSearch /></span>
              <input
                className="aa__search"
                placeholder="Search accommodations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="aa__filter"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="apartment">Apartments</option>
              <option value="house">Houses</option>
              <option value="villa">Villas</option>
              <option value="suite">Suites</option>
            </select>
            <select
              className="aa__filter"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="featured">Featured</option>
            </select>
            {!loading && (
              <span className="aa__count">
                {total} propert{total !== 1 ? 'ies' : 'y'}
              </span>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="aa__loading">
              <div className="aa__spinner" />
            </div>
          ) : apartments.length === 0 ? (
            <div className="aa__empty">
              <div className="aa__empty-icon"><IconHome /></div>
              <h3 className="aa__empty-title">No accommodations found</h3>
              <p className="aa__empty-desc">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="aa__grid">
              {apartments.map(apt => {
                const img = apt.media?.[0]?.file_url ?? FALLBACK_IMG

                return (
                  <Link key={apt.id} to={`/accommodations/${apt.slug}`} className="aa__card-link">
                    <article className="aa__card">
                      <div className="aa__card-img">
                        <img
                          src={img}
                          alt={apt.title}
                          loading="lazy"
                          onError={e => { e.target.src = FALLBACK_IMG }}
                        />
                        <div className="aa__card-overlay" />
                        {apt.property_type && (
                          <div className="aa__card-type">
                            {PROPERTY_LABELS[apt.property_type] ?? apt.property_type}
                          </div>
                        )}
                        {apt.is_featured && (
                          <span className="aa__card-featured">
                            <IconStar /> Featured
                          </span>
                        )}
                      </div>
                      <div className="aa__card-body">
                        <h3 className="aa__card-name">{apt.title}</h3>
                        <div className="aa__card-meta">
                          {apt.location && (
                            <span className="aa__card-meta-item">
                              <IconMapPin /> {apt.location}
                            </span>
                          )}
                          {apt.bedrooms && (
                            <span className="aa__card-meta-item">
                              <IconBed /> {apt.bedrooms} Bed{apt.bedrooms !== 1 ? 's' : ''}
                            </span>
                          )}
                          {apt.max_guests && (
                            <span className="aa__card-meta-item">
                              <IconUsers /> {apt.max_guests} Guest{apt.max_guests !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="aa__card-footer">
                          <span className="aa__card-price">
                            {apt.price_per_night
                              ? `GH₵${Number(apt.price_per_night).toLocaleString()}/night`
                              : 'Contact Us'}
                          </span>
                          <span className="aa__card-cta">
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
            <div className="aa__pagination">
              <button
                className="aa__page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <IconChevLeft />
              </button>
              <span className="aa__page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="aa__page-btn"
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
