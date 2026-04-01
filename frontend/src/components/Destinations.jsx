import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Destinations.css'
import PaintStrokes from './PaintStrokes'
import { useScrollReveal } from '../hooks/useScrollReveal'

const IconMapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconImages = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

// Canonical region labels — map trailing location strings to display names
// Matches the "..., <Region>" tail used in the DB seed data
const REGION_MAP = {
  'greater accra':  'Greater Accra',
  'central region': 'Central Region',
  'ashanti region': 'Ashanti',
  'volta region':   'Volta Region',
  'savannah region':'Northern & Savannah',
  'upper east region':'Northern & Savannah',
  'upper west region':'Northern & Savannah',
  'northern region':'Northern & Savannah',
  'eastern region': 'Eastern Region',
  'western region': 'Western Region',
  'bono region':    'Bono Region',
  'bono east region':'Bono Region',
}

/** Extract a canonical region label from a free-text location string */
function extractRegion(location = '') {
  const lower = location.toLowerCase()
  for (const [key, label] of Object.entries(REGION_MAP)) {
    if (lower.includes(key)) return label
  }
  return 'Other'
}

const GHANA_SITES = [
  {
    id: 'g1', name: 'Kakum National Park', location: 'Kakum, Central Region',
    region: 'Central Region', tag: 'Nature',
    images: [
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
      'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=600&q=80',
    ],
  },
  {
    id: 'g2', name: 'Cape Coast Castle', location: 'Cape Coast, Central Region',
    region: 'Central Region', tag: 'Heritage',
    images: [
      'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=600&q=80',
      'https://images.unsplash.com/photo-1589825743636-9b7c5bfd29b0?w=600&q=80',
      'https://images.unsplash.com/photo-1565799557186-1715e8f79fd9?w=600&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
    ],
  },
  {
    id: 'g3', name: 'Mole National Park', location: 'Mole, Savannah Region',
    region: 'Northern & Savannah', tag: 'Wildlife',
    images: [
      'https://images.unsplash.com/photo-1549366021-9f761d450615?w=600&q=80',
      'https://images.unsplash.com/photo-1504690189374-27e2a5bf80f8?w=600&q=80',
      'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&q=80',
      'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=600&q=80',
    ],
  },
  {
    id: 'g4', name: 'Labadi Beach', location: 'Accra, Greater Accra',
    region: 'Greater Accra', tag: 'Beach',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
      'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=600&q=80',
    ],
  },
  {
    id: 'g5', name: 'Boti Waterfall', location: 'Eastern Region',
    region: 'Volta Region', tag: 'Nature',
    images: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&q=80',
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80',
      'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=80',
      'https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=600&q=80',
    ],
  },
  {
    id: 'g6', name: 'Kumasi Cultural Centre', location: 'Kumasi, Ashanti Region',
    region: 'Ashanti', tag: 'Culture',
    images: [
      'https://images.unsplash.com/photo-1580746738099-b2d7c0e5a7ec?w=600&q=80',
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
      'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=600&q=80',
    ],
  },
  {
    id: 'g7', name: 'Paga Crocodile Pond', location: 'Paga, Upper East Region',
    region: 'Northern & Savannah', tag: 'Wildlife',
    images: [
      'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=600&q=80',
      'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=600&q=80',
      'https://images.unsplash.com/photo-1509479100390-f83a8349e79c?w=600&q=80',
      'https://images.unsplash.com/photo-1559827291-72f0e80af2a2?w=600&q=80',
    ],
  },
  {
    id: 'g8', name: 'Wli Waterfalls', location: 'Volta Region',
    region: 'Volta Region', tag: 'Nature',
    images: [
      'https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=600&q=80',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80',
      'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&q=80',
    ],
  },
]

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80'

// Varied placeholder pool used for DB sites that have no uploaded images yet
const PLACEHOLDER_POOL = [
  [
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    'https://images.unsplash.com/photo-1549366021-9f761d450615?w=600&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1580746738099-b2d7c0e5a7ec?w=600&q=80',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&q=80',
    'https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=600&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=600&q=80',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&q=80',
    'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=600&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80',
    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&q=80',
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&q=80',
  ],
]
const CYCLE_INTERVAL = 3500  // ms between photo transitions

// ── Per-card slideshow hook ───────────────────────────────────────────────
function useCycleIndex(count, interval = CYCLE_INTERVAL) {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (count <= 1) return
    timer.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % count)
        setFading(false)
      }, 400)
    }, interval)
    return () => clearInterval(timer.current)
  }, [count, interval])

  return { idx, fading }
}

// ── Single site card ──────────────────────────────────────────────────────
function SiteCard({ item, delay }) {
  const images = item.images?.length ? item.images : [FALLBACK_IMG]
  const { idx, fading } = useCycleIndex(images.length)

  return (
    <div
      className="dest__card"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="dest__card-img">
        {/* Crossfade layers — current and next */}
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={item.name}
            loading="lazy"
            className={`dest__slide ${i === idx ? (fading ? 'dest__slide--out' : 'dest__slide--active') : ''}`}
            onError={e => { e.target.src = FALLBACK_IMG }}
          />
        ))}

        {/* Gradient overlay */}
        <div className="dest__card-overlay" />

        {/* Tag badge */}
        {item.tag && <span className="dest__card-tag">{item.tag}</span>}

        {/* Photo counter dot-strip */}
        {images.length > 1 && (
          <div className="dest__dots">
            {images.map((_, i) => (
              <span key={i} className={`dest__dot ${i === idx ? 'dest__dot--active' : ''}`} />
            ))}
          </div> 
        )}

        {/* Photo count badge top-right */}
        {images.length > 1 && (
          <span className="dest__photo-count">
            <IconImages /> {images.length}
          </span>
        )}
      </div>

      <div className="dest__card-body">
        <h3 className="dest__card-name">{item.name}</h3>
        <p className="dest__card-loc">
          <IconMapPin />
          {item.location}
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export default function Destinations({ destinations = [], loading }) {
  const [activeTab, setActiveTab] = useState('All')
  const [gridKey, setGridKey]     = useState(0)   // bump to re-trigger card fade-in
  const headerRef = useScrollReveal({ threshold: 0.1 })

  // Map API results → normalised shape with `images` array and derived region
  // If a site has no uploaded media yet, rotate through placeholder pool for visual variety
  const apiItems = destinations.map((d, i) => {
    const uploaded = (d.media ?? []).map(m => m.file_url).filter(Boolean)
    const placeholders = PLACEHOLDER_POOL[i % PLACEHOLDER_POOL.length]
    return {
      id:       d.id,
      slug:     d.slug,
      name:     d.name,
      location: d.location ?? '',
      region:   extractRegion(d.location),
      tag:      d.is_featured ? 'Featured' : 'Site',
      images:   uploaded.length ? uploaded : placeholders,
    }
  })

  const allItems = apiItems.length ? apiItems : GHANA_SITES

  // Build tabs dynamically from whichever data set is active
  const regionSet = [...new Set(allItems.map(s => s.region))].sort()
  const tabs = ['All', ...regionSet]

  // Reset active tab if it no longer exists in the current data
  const validTab = tabs.includes(activeTab) ? activeTab : 'All'

  const filtered = validTab === 'All'
    ? allItems
    : allItems.filter(s => s.region === validTab)

  // Always show something — never empty grid
  const displayItems = filtered.length ? filtered : allItems

  function handleTabClick(tab) {
    setActiveTab(tab)
    setGridKey(k => k + 1)   // remount grid so sr--child elements get fresh reveal
  }

  return (
    <section className="destinations" id="destinations">
      <PaintStrokes items={[
        { variant: 'a', position: 'tr', width: 350, opacity: 0.5 },
        { variant: 'b', position: 'bl', width: 320, opacity: 0.45 },
      ]} />
      <div className="container">

        {/* Header row */}
        <div className="dest__header sr" ref={headerRef}>
          <div>
            <p className="dest__eyebrow">Handpicked Destinations</p>
            <h2 className="dest__title">Places We'll Take You</h2>
          </div>
          <Link to="/sites" className="dest__view-all">
            View all destinations <IconArrowRight />
          </Link>
        </div>

        {/* Filter tabs — built from live data */}
        <div className="dest__tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`dest__tab ${validTab === tab ? 'dest__tab--active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="dest__skeleton-row">
            {[1,2,3,4].map(i => <div key={i} className="dest__skeleton" />)}
          </div>
        ) : (
          <div key={gridKey} className="dest__grid dest__grid--animate">
            {displayItems.slice(0, 12).map((item, i) => (
              <Link
                key={item.id ?? i}
                to={item.slug ? `/sites/${item.slug}` : '#'}
                className="dest__card-link"
              >
                <SiteCard item={item} delay={i * 0.05} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
