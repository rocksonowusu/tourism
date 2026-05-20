import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import './EventAdModal.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconChevLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = d => !d ? null : new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const getDaysUntil = date => {
  if (!date) return null
  const days = Math.ceil((new Date(date) - new Date()) / 86400000)
  return days > 0 ? days : null
}

const getFeaturedImage = item =>
  item?.media?.[0]?.file_url ||
  'https://res.cloudinary.com/dy8me66pj/image/upload/v1774488639/tourism/tourist_sites/vtubwgj6b5oc9qt72czr.jpg'

const FALLBACK_ITEM = {
  id: '__fallback__',
  type: 'tour',
  title: 'Discover Ghana',
  description: 'From the vibrant streets of Accra to ancient coastal castles and northern savannahs — your adventure starts here.',
  location: 'Ghana',
  slug: 'tours',
  media: [],
}

// ── Component ──────────────────────────────────────────────────────────────
export default function EventAdModal() {
  const [open, setOpen]           = useState(false)
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const timerRef    = useRef(null)
  const mountedRef  = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // ── Single timer effect — no external deps, fires exactly once ─────────
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!mountedRef.current) return
      setOpen(true)
      setLoading(true)
      try {
        const [eventsData, toursData] = await Promise.all([
          api.events.list({ page_size: 10, ordering: '-created_at' }).catch(() => ({ results: [] })),
          api.tours.list({ page_size: 10, is_active: true, ordering: '-created_at' }).catch(() => ({ results: [] })),
        ])
        if (!mountedRef.current) return
        const events = (eventsData?.results ?? eventsData ?? []).map(e => ({ ...e, type: 'event' }))
        const tours  = (toursData?.results  ?? toursData  ?? []).map(t => ({ ...t, type: 'tour'  }))
        const combined = [...events, ...tours].slice(0, 8)
        setItems(combined.length > 0 ? combined : [FALLBACK_ITEM])
      } catch {
        if (mountedRef.current) setItems([FALLBACK_ITEM])
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }, 2000)

    return () => clearTimeout(t)
  }, []) // ← empty: runs exactly once on mount

  // ── Auto-advance carousel ──────────────────────────────────────────────
  const startCarousel = useCallback((len) => {
    clearInterval(timerRef.current)
    if (len > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIdx(p => (p + 1) % len)
      }, 5000)
    }
  }, [])

  useEffect(() => {
    if (open && !loading && items.length > 1) startCarousel(items.length)
    return () => clearInterval(timerRef.current)
  }, [open, loading, items.length, startCarousel])

  // ── Lock scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const handleClose = useCallback(() => {
    setOpen(false)
    clearInterval(timerRef.current)
  }, [])

  // ── Escape key ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const fn = e => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [open, handleClose])

  const goTo = (idx) => {
    setCurrentIdx(idx)
    startCarousel(items.length)
  }
  const prev = () => goTo((currentIdx - 1 + items.length) % items.length)
  const next = () => goTo((currentIdx + 1) % items.length)

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 680

  // ── Loading overlay ────────────────────────────────────────────────────
  if (open && loading) {
    return (
      <>
        <div className="ead__backdrop" style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
        <div className="ead__loader" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div className="ead__loader-ring" />
          <p className="ead__loader-text">Discovering Ghana…</p>
        </div>
      </>
    )
  }

  if (!open || items.length === 0) return null

  const item      = items[currentIdx] || items[0]
  const imageUrl  = getFeaturedImage(item)
  const daysUntil = item.type === 'event' ? getDaysUntil(item.date) : null
  const isFallback = item.id === '__fallback__'
  const detailLink = isFallback
    ? '/tours'
    : item.type === 'event' ? `/events/${item.slug}` : `/tours/${item.slug}`

  return (
    <>
      {/* Backdrop */}
      <div
        className="ead__backdrop"
        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
        onClick={e => e.target === e.currentTarget && handleClose()}
      />

      {/* Modal */}
      <div
        className="ead__modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 9999, overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '44% 56%',
          maxHeight: '88vh',
        }}
      >
        {/* ── Left: image panel ─────────────────────────────────────── */}
        <div
          className="ead__img-col"
          style={{ position: 'relative', overflow: 'hidden', minHeight: isMobile ? 240 : 460 }}
        >
          <img
            src={imageUrl}
            alt={item.title}
            className="ead__img"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            className="ead__img-scrim"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          />

          {/* Brand badge */}
          <div
            className="ead__brand-tag"
            style={{ position: 'absolute', top: 16, left: 16, zIndex: 3, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            The Ghana Experience
          </div>

          {/* Urgency ribbon */}
          {daysUntil && (
            <div
              className="ead__urgency"
              style={{ position: 'absolute', bottom: 48, left: 16, zIndex: 3 }}
            >
              🔥 {daysUntil} day{daysUntil !== 1 ? 's' : ''} to go
            </div>
          )}

          {/* Dot indicators on image */}
          {items.length > 1 && (
            <div
              className="ead__img-dots"
              style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', gap: 7 }}
            >
              {items.map((_, i) => (
                <button
                  key={i}
                  className={`ead__img-dot${i === currentIdx ? ' ead__img-dot--on' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Item ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Side nav arrows */}
          {items.length > 1 && !isMobile && (
            <>
              <button
                className="ead__nav ead__nav--prev"
                style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', zIndex: 4 }}
                onClick={prev}
                aria-label="Previous"
              ><IconChevLeft /></button>
              <button
                className="ead__nav ead__nav--next"
                style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', zIndex: 4 }}
                onClick={next}
                aria-label="Next"
              ><IconChevRight /></button>
            </>
          )}
        </div>

        {/* ── Right: info panel (light mode) ────────────────────────── */}
        <div
          className="ead__info-col"
          style={{ position: 'relative', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: isMobile ? '24px 22px 22px' : '32px 30px 28px' }}
        >
          {/* Close button */}
          <button
            className="ead__close"
            style={{ position: 'absolute', top: 14, right: 14, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleClose}
            aria-label="Close"
          ><IconX /></button>

          {/* Tags */}
          <div className="ead__tags" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span className={`ead__type-tag ead__type-tag--${item.type}`}>
              {item.type === 'event' ? 'Event' : 'Tour Package'}
            </span>
            {item.is_featured && <span className="ead__featured-tag">★ Featured</span>}
            {item.type === 'event' && item.category && (
              <span className="ead__cat-tag">{item.category.replace(/_/g, ' ')}</span>
            )}
          </div>

          {/* Title */}
          <h2 className="ead__title" style={{ margin: 0 }}>{item.title}</h2>

          {/* Description */}
          {item.description && (
            <p className="ead__desc" style={{ margin: 0 }}>
              {item.description.length > 130 ? item.description.slice(0, 130) + '…' : item.description}
            </p>
          )}

          {/* Meta */}
          <div className="ead__meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {item.type === 'event' && fmt(item.date) && (
              <span className="ead__meta-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconCalendar /> {fmt(item.date)}</span>
            )}
            {item.type === 'tour' && item.duration && (
              <span className="ead__meta-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconCalendar /> {item.duration}</span>
            )}
            {item.location && (
              <span className="ead__meta-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconMapPin /> {item.location}</span>
            )}
          </div>

          {/* Highlights */}
          {item.highlights?.length > 0 && (
            <ul className="ead__highlights" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {item.highlights.slice(0, 3).map((h, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}><span className="ead__check">✓</span>{h}</li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <div className="ead__actions" style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 'auto', paddingTop: 6 }}>
            <Link to={detailLink} className="ead__cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleClose}>
              {item.type === 'event' ? 'View Event Details' : 'Explore This Tour'} <IconArrow />
            </Link>
            <button className="ead__skip" onClick={handleClose}>Maybe Later</button>
          </div>

          {/* Counter */}
          {items.length > 1 && (
            <p className="ead__count" style={{ textAlign: 'center', margin: 0 }}>{currentIdx + 1} of {items.length} • auto-cycling</p>
          )}
        </div>
      </div>
    </>
  )
}
