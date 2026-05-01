import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import './EventAdModal.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

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

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
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

const IconGold = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

// ── Helper functions ──────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { 
    day: '2-digit', month: 'short', year: 'numeric' 
  })
}

const getDaysUntil = (date) => {
  if (!date) return null
  const diff = new Date(date) - new Date()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days > 0 ? days : null
}

const getFeaturedImage = (item) => {
  // Primary: featured media from item
  if (item?.media?.[0]?.file_url) {
    return item.media[0].file_url
  }
  // Fallback: use a generic Ghana experience image
  return 'https://res.cloudinary.com/dy8me66pj/image/upload/v1774488639/tourism/tourist_sites/vtubwgj6b5oc9qt72czr.jpg'
}

// ── Component ─────────────────────────────────────────────────────────
export default function EventAdModal() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([]) // Combined events and tours
  const [loading, setLoading] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const autoSwitchTimerRef = useRef(null)

  // ── Fetch upcoming events AND tours (no date filter for now) ────────
  const fetchUpcomingItems = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch both events and tours
      const [eventsData, toursData] = await Promise.all([
        api.events.list({
          page_size: 10,
          ordering: '-created_at'
        }).catch(() => ({ results: [] })),
        api.tours.list({
          page_size: 10,
          is_active: true,
          ordering: '-created_at'
        }).catch(() => ({ results: [] }))
      ])

      const events = (eventsData?.results ?? eventsData ?? []).map(e => ({ ...e, type: 'event' }))
      const tours = (toursData?.results ?? toursData ?? []).map(t => ({ ...t, type: 'tour' }))

      // Combine and show max 8 items
      const combined = [...events, ...tours]
      setItems(combined.slice(0, 8))
    } catch (err) {
      console.error('Failed to fetch upcoming items:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Setup auto-switch timer ──────────────────────────────────────────
  const setupAutoSwitch = useCallback(() => {
    if (autoSwitchTimerRef.current) {
      clearInterval(autoSwitchTimerRef.current)
    }

    if (items.length > 1 && open) {
      autoSwitchTimerRef.current = setInterval(() => {
        setCurrentIdx(prev => (prev + 1) % items.length)
      }, 5000) // Switch every 5 seconds
    }
  }, [items.length, open])

  // ── Auto-show modal after 2 seconds on mount ───────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUpcomingItems()
      setOpen(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [fetchUpcomingItems])

  // ── Listen for media uploads and refresh ───────────────────────────
  useEffect(() => {
    const handleMediaUploaded = () => {
      // Refresh the items when new media is uploaded
      fetchUpcomingItems()
    }

    window.addEventListener('mediaUploaded', handleMediaUploaded)
    return () => window.removeEventListener('mediaUploaded', handleMediaUploaded)
  }, [fetchUpcomingItems])

  // ── Setup auto-switch when modal opens or items change ──────────────
  useEffect(() => {
    setupAutoSwitch()
    return () => {
      if (autoSwitchTimerRef.current) {
        clearInterval(autoSwitchTimerRef.current)
      }
    }
  }, [setupAutoSwitch])

  // ── Handle close ───────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setOpen(false)
    if (autoSwitchTimerRef.current) {
      clearInterval(autoSwitchTimerRef.current)
    }
  }, [])

  // ── Handle backdrop click ──────────────────────────────────────────
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [handleClose])

  // ── Handle navigation (reset timer) ────────────────────────────────
  const handleNavigation = useCallback((newIdx) => {
    setCurrentIdx(newIdx)
    // Reset the auto-switch timer when user navigates
    if (autoSwitchTimerRef.current) {
      clearInterval(autoSwitchTimerRef.current)
    }
    setupAutoSwitch()
  }, [setupAutoSwitch])

  // ── Handle Escape key ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleClose])

  // ── Prevent body scroll when modal is open ─────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  // ── Navigation handlers ────────────────────────────────────────────
  const handlePrev = () => {
    handleNavigation((currentIdx - 1 + items.length) % items.length)
  }

  const handleNext = () => {
    handleNavigation((currentIdx + 1) % items.length)
  }

  if (!open || loading || items.length === 0) {
    return null
  }

  const currentItem = items[currentIdx]
  const imageUrl = getFeaturedImage(currentItem)
  const daysUntil = currentItem.type === 'event' ? getDaysUntil(currentItem.date) : null
  const detailLink = currentItem.type === 'event' 
    ? `/events/${currentItem.slug}`
    : `/tours/${currentItem.slug}`
  const itemTypeLabel = currentItem.type === 'event' ? 'Event' : 'Tour'

  return (
    <>
      {/* ── Backdrop ────────────────────────────────────────────────── */}
      <div 
        className="event-ad-modal__backdrop" 
        onClick={handleBackdropClick}
        aria-hidden="false"
      />

      {/* ── Modal Container ────────────────────────────────────────── */}
      <div className="event-ad-modal">
        
        {/* ── Close button ──────────────────────────────────────────– */}
        <button 
          className="event-ad-modal__close" 
          onClick={handleClose}
          aria-label="Close modal"
          title="Close"
        >
          <IconX />
        </button>

        {/* ── Ad Label (top-left) ──────────────────────────────────── */}
        <div className="event-ad-modal__badge">
          <IconGold /> Explore Ghana
        </div>

        <div className="event-ad-modal__content">
          
          {/* ── Image Section (left) ──────────────────────────────– */}
          <div className="event-ad-modal__image-section">
            <div className="event-ad-modal__image-wrapper">
              <img 
                src={imageUrl} 
                alt={currentItem.title}
                className="event-ad-modal__image"
              />
              {/* Overlay badge for days until (only for events) */}
              {daysUntil && (
                <div className="event-ad-modal__days-badge">
                  <span className="event-ad-modal__days-number">{daysUntil}</span>
                  <span className="event-ad-modal__days-label">days away</span>
                </div>
              )}
            </div>

            {/* ── Carousel indicators ───────────────────────────────– */}
            {items.length > 1 && (
              <div className="event-ad-modal__indicators">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    className={`event-ad-modal__indicator ${idx === currentIdx ? 'event-ad-modal__indicator--active' : ''}`}
                    onClick={() => handleNavigation(idx)}
                    aria-label={`Item ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Info Section (right) ──────────────────────────────– */}
          <div className="event-ad-modal__info-section">
            
            {/* Type badge */}
            <span className={`event-ad-modal__type-badge event-ad-modal__type-badge--${currentItem.type}`}>
              {itemTypeLabel}
            </span>

            {/* Category badge (for events only) */}
            {currentItem.type === 'event' && currentItem.category && (
              <span className="event-ad-modal__category">
                {currentItem.category.replace('_', ' ').toUpperCase()}
              </span>
            )}

            {/* Title */}
            <h3 className="event-ad-modal__title">
              {currentItem.title}
            </h3>

            {/* Description snippet */}
            {currentItem.description && (
              <p className="event-ad-modal__description">
                {currentItem.description.slice(0, 120)}...
              </p>
            )}

            {/* Details (Date & Location or Duration & Location) */}
            <div className="event-ad-modal__details">
              {currentItem.type === 'event' && currentItem.date && (
                <div className="event-ad-modal__detail-item">
                  <IconCalendar />
                  <span>{fmt(currentItem.date)}</span>
                </div>
              )}
              {currentItem.type === 'tour' && currentItem.duration && (
                <div className="event-ad-modal__detail-item">
                  <IconCalendar />
                  <span>{currentItem.duration}</span>
                </div>
              )}
              {currentItem.location && (
                <div className="event-ad-modal__detail-item">
                  <IconMapPin />
                  <span>{currentItem.location}</span>
                </div>
              )}
            </div>

            {/* Highlights/Inclusions preview */}
            {currentItem.highlights && currentItem.highlights.length > 0 && (
              <div className="event-ad-modal__highlights">
                <p className="event-ad-modal__highlights-label">Highlights:</p>
                <ul className="event-ad-modal__highlights-list">
                  {currentItem.highlights.slice(0, 3).map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                  {currentItem.highlights.length > 3 && (
                    <li className="event-ad-modal__highlights-more">
                      +{currentItem.highlights.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="event-ad-modal__actions">
              <Link 
                to={detailLink}
                className="event-ad-modal__btn event-ad-modal__btn--primary"
              >
                Learn More <IconArrow />
              </Link>
              <button 
                className="event-ad-modal__btn event-ad-modal__btn--secondary"
                onClick={handleClose}
              >
                Maybe Later
              </button>
            </div>

            {/* Item counter */}
            {items.length > 1 && (
              <div className="event-ad-modal__counter">
                {currentIdx + 1} of {items.length} • Auto-switching in 5s
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation arrows (fixed outside modal) ────────────────– */}
        {items.length > 1 && (
          <>
            <button
              className="event-ad-modal__nav event-ad-modal__nav--prev"
              onClick={handlePrev}
              aria-label="Previous"
              title="Previous"
            >
              <IconChevLeft />
            </button>
            <button
              className="event-ad-modal__nav event-ad-modal__nav--next"
              onClick={handleNext}
              aria-label="Next"
              title="Next"
            >
              <IconChevRight />
            </button>
          </>
        )}
      </div>
    </>
  )
}
