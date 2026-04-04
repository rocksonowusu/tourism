import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './AllSites.css'

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
const IconImages = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
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

// Region map (same as Destinations component)
const REGION_MAP = {
  'greater accra':   'Greater Accra',
  'central region':  'Central Region',
  'ashanti region':  'Ashanti',
  'volta region':    'Volta Region',
  'savannah region': 'Northern & Savannah',
  'upper east region':'Northern & Savannah',
  'upper west region':'Northern & Savannah',
  'northern region': 'Northern & Savannah',
  'eastern region':  'Eastern Region',
  'western region':  'Western Region',
  'bono region':     'Bono Region',
  'bono east region':'Bono Region',
}

function extractRegion(location = '') {
  const lower = location.toLowerCase()
  for (const [key, label] of Object.entries(REGION_MAP)) {
    if (lower.includes(key)) return label
  }
  return 'Other'
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80'
const PAGE_SIZE = 12

// ── Component ────────────────────────────────────────────────────────────
export default function AllSites() {
  const [sites, setSites]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [activeTab, setActiveTab] = useState('All')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      const data = await api.sites.list(params)
      setSites(data?.results ?? data ?? [])
      setTotal(data?.count ?? (data?.length ?? 0))
    } catch {
      setSites([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  // Normalise sites
  const normalised = sites.map(s => ({
    id:          s.id,
    slug:        s.slug,
    name:        s.name,
    location:    s.location ?? '',
    description: s.description ?? '',
    region:      extractRegion(s.location),
    isFeatured:  s.is_featured,
    images:      (s.media ?? []).map(m => m.file_url).filter(Boolean),
    mediaCount:  s.media_count ?? (s.media ?? []).length,
  }))

  // Build region tabs from loaded data
  const regionSet = [...new Set(normalised.map(s => s.region))].sort()
  const tabs = ['All', ...regionSet]
  const validTab = tabs.includes(activeTab) ? activeTab : 'All'

  const filtered = validTab === 'All'
    ? normalised
    : normalised.filter(s => s.region === validTab)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  return (
    <div className="app">
      <Header />
      <section className="all-sites">
        <PaintStrokes items={[
          { variant: 'b', position: 'tl', width: 340, opacity: 0.45 },
          { variant: 'a', position: 'br', width: 350, opacity: 0.5 },
        ]} />
        <div className="container">

          {/* Breadcrumb */}
          <nav className="as__breadcrumb">
            <Link to="/">Home</Link>
            <span className="as__breadcrumb-sep">/</span>
            <span className="as__breadcrumb-current">Tourist Sites</span>
          </nav>

          {/* Header */}
          <div className="as__header">
            <p className="as__eyebrow">Explore Ghana</p>
            <h1 className="as__title">All Tourist Sites</h1>
            <p className="as__subtitle">
              From ancient castles to lush rainforests, discover the places
              that make Ghana unforgettable.
            </p>
          </div>

          {/* Controls */}
          <div className="as__controls">
            <div className="as__search-wrap">
              <span className="as__search-icon"><IconSearch /></span>
              <input
                className="as__search"
                placeholder="Search sites…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {!loading && (
              <span className="as__count">
                {total} site{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Region tabs */}
          {!loading && normalised.length > 0 && (
            <div className="as__tabs">
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={`as__tab ${validTab === tab ? 'as__tab--active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="as__loading">
              <div className="as__spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="as__empty">
              <div className="as__empty-icon">
                <IconMapPin />
              </div>
              <h3 className="as__empty-title">No sites found</h3>
              <p className="as__empty-desc">Try adjusting your search or region filter.</p>
            </div>
          ) : (
            <div className="as__grid">
              {filtered.map(site => {
                const img = site.images[0] ?? FALLBACK_IMG

                return (
                  <Link key={site.id} to={`/sites/${site.slug}`} className="as__card-link">
                    <article className="as__card">
                      <div className="as__card-img">
                        <img
                          src={img}
                          alt={site.name}
                          loading="lazy"
                          onError={e => { e.target.src = FALLBACK_IMG }}
                        />
                        <div className="as__card-overlay" />
                        {site.isFeatured && (
                          <span className="as__card-tag">Featured</span>
                        )}
                        {site.mediaCount > 1 && (
                          <span className="as__card-photos">
                            <IconImages /> {site.mediaCount}
                          </span>
                        )}
                      </div>
                      <div className="as__card-body">
                        <h3 className="as__card-name">{site.name}</h3>
                        {site.location && (
                          <p className="as__card-loc">
                            <IconMapPin /> {site.location}
                          </p>
                        )}
                        {site.description && (
                          <p className="as__card-desc">{site.description}</p>
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
            <div className="as__pagination">
              <button
                className="as__page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <IconChevLeft />
              </button>
              <span className="as__page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="as__page-btn"
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
