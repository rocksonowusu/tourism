import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './ReviewsSection.css'
import api from '../api/client'
import PaintStrokes from './PaintStrokes'

const IconStar = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24"
    fill={filled ? '#C5A028' : 'none'}
    stroke="#C5A028" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const SERVICE_LABELS = {
  tour:          'Tour',
  accommodation: 'Stay',
  event:         'Event',
  car_rental:    'Car Rental',
  general:       'General',
}

// ── Avatar helpers ─────────────────────────────────────────────────────────
const FEMALE_NAMES = new Set([
  'mary','patricia','jennifer','linda','barbara','elizabeth','susan','jessica',
  'sarah','karen','nancy','lisa','betty','margaret','sandra','ashley','dorothy',
  'kimberly','emily','donna','michelle','carol','amanda','melissa','deborah',
  'stephanie','rebecca','sharon','laura','cynthia','kathleen','amy','angela',
  'ama','akua','adwoa','afia','abena','yaa','adjoa','efua','akosua','esi',
  'araba','ekua','kukua','aba','adoma','gifty','vida','naana','mabel',
  'comfort','patience','mercy','felicia','priscilla','beatrice','agnes',
  'esther','lydia','hannah','fatima','amina','aisha','zainab','halima',
  'shirley','anna','brenda','pamela','emma','nicole','helen','samantha',
  'marilyn','danielle','beverly','isabella','theresa','diana','natalie',
])

function getGender(name) {
  const first = (name || '').trim().split(/\s+/)[0].toLowerCase()
  return FEMALE_NAMES.has(first) ? 'women' : 'men'
}
function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }
  return Math.abs(h)
}
function getAvatarUrl(name) {
  return `https://randomuser.me/api/portraits/${getGender(name)}/${hashCode(name) % 80}.jpg`
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Verified Review'
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)   return `${days}d ago`
  if (days < 30)  return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// Stack has 5 positions; transforms defined in CSS via .rs__card--p{n}
const STACK_SIZE = 5

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading]  = useState(true)
  const [topIdx, setTopIdx]    = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let res = await api.reviews.featured({ page_size: 6 })
        let items = res.results || res || []
        if (items.length === 0) {
          res = await api.reviews.list({ page_size: 6 })
          items = res.results || res || []
        }
        if (!cancelled) setReviews(items)
      } catch (err) {
        console.error('Failed to load reviews', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Auto-advance every 5 s
  useEffect(() => {
    if (reviews.length <= 1) return
    const id = setInterval(() => {
      setTopIdx(i => (i + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(id)
  }, [reviews.length])

  const advance = useCallback(() => {
    if (reviews.length <= 1) return
    setTopIdx(i => (i + 1) % reviews.length)
  }, [reviews.length])

  if (loading || !reviews.length) return null

  return (
    <section className="reviews-section" id="reviews">
      <PaintStrokes items={[
        { variant: 'b', position: 'tl', width: 300, opacity: 0.35 },
        { variant: 'a', position: 'br', width: 320, opacity: 0.40 },
      ]} />
      <div className="container">

        <div className="rs__header">
          <p className="rs__eyebrow">Testimonials</p>
          <h2 className="rs__title">What Our Guests Say</h2>
          <p className="rs__subtitle">Real stories from travellers who explored Ghana with us</p>
        </div>

        {/* ── Card stack ───────────────────────────────────── */}
        <div className="rs__stage">
          <div className="rs__stack">
            {reviews.map((review, idx) => {
              const pos      = (idx - topIdx + reviews.length) % reviews.length
              const isTop    = pos === 0
              const posClass = `rs__card--p${Math.min(pos, STACK_SIZE - 1)}`
              const hidden   = pos >= STACK_SIZE

              return (
                <article
                  key={review.id}
                  className={[
                    'rs__card',
                    posClass,
                    isTop  ? 'rs__card--top'    : '',
                    hidden ? 'rs__card--hidden' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={isTop ? advance : undefined}
                  aria-label={isTop ? 'Next review' : undefined}
                >
                  {/* Head */}
                  <div className="rs__card-head">
                    <img
                      src={review.reviewer_photo_url || getAvatarUrl(review.reviewer_name)}
                      alt={review.reviewer_name}
                      className="rs__avatar"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                    <div className="rs__meta">
                      <span className="rs__name">{review.reviewer_name}</span>
                      <span className="rs__from">
                        {SERVICE_LABELS[review.service_type] || 'Guest'}
                      </span>
                    </div>
                    <div className="rs__stars">
                      {[1,2,3,4,5].map(i => <IconStar key={i} filled={i <= review.rating} />)}
                    </div>
                  </div>

                  {review.title && (
                    <h3 className="rs__card-title">{review.title}</h3>
                  )}

                  <p className="rs__comment">{review.comment}</p>

                  {/* Footer */}
                  <div className="rs__card-foot">
                    <span className="rs__badge">
                      {SERVICE_LABELS[review.service_type] || 'General'}
                    </span>
                    <span className="rs__time">
                      {review.created_at ? `Posted ${timeAgo(review.created_at)}` : 'Verified'}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>

          {reviews.length > 1 && (
            <p className="rs__hint">Tap card to browse</p>
          )}
        </div>

        {/* Dots */}
        <div className="rs__dots">
          {reviews.map((_, i) => (
            <button
              key={i}
              className={`rs__dot${i === topIdx ? ' rs__dot--on' : ''}`}
              onClick={() => setTopIdx(i)}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>

        <div className="rs__cta">
          <Link to="/reviews" className="rs__cta-btn">
            Read All Reviews <IconArrowRight />
          </Link>
        </div>

      </div>
    </section>
  )
}
