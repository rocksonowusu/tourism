import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './ReviewsSection.css'
import api from '../api/client'
import PaintStrokes from './PaintStrokes'

const IconStar = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24"
    fill={filled ? '#C5A028' : 'none'}
    stroke="#C5A028" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconQuote = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="#C5A028" opacity="0.18">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H5C3.75 3 3 3.75 3 5v3c0 1.25.75 2 2 2h2c0 4-3 6-7 6v5zm12 0c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-3c-1.25 0-2 .75-2 2v3c0 1.25.75 2 2 2h2c0 4-3 6-7 6v5z"/>
  </svg>
)

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const SERVICE_LABELS = {
  tour: 'Tour',
  accommodation: 'Accommodation',
  event: 'Event',
  car_rental: 'Car Rental',
  general: 'General',
}

// ── Gender-aware random profile pictures ─────────────────────────────────
// Common female first names for heuristic gender detection
const FEMALE_NAMES = new Set([
  'mary','patricia','jennifer','linda','barbara','elizabeth','susan','jessica',
  'sarah','karen','nancy','lisa','betty','margaret','sandra','ashley','dorothy',
  'kimberly','emily','donna','michelle','carol','amanda','melissa','deborah',
  'stephanie','rebecca','sharon','laura','cynthia','kathleen','amy','angela',
  'shirley','anna','brenda','pamela','emma','nicole','helen','samantha',
  'katherine','christine','debra','rachel','carolyn','janet','catherine',
  'maria','heather','diane','ruth','julie','olivia','joyce','virginia',
  'victoria','kelly','lauren','christina','joan','evelyn','judith','megan',
  'andrea','cheryl','hannah','jacqueline','martha','gloria','teresa','ann',
  'sara','madison','frances','kathryn','janice','jean','abigail','alice',
  'judy','sophia','grace','denise','amber','doris','marilyn','danielle',
  'beverly','isabella','theresa','diana','natalie','brittany','charlotte',
  'marie','kayla','alexis','lori','ama','akua','adwoa','afia','abena','yaa',
  'adjoa','efua','akosua','esi','araba','ekua','kukua','aba','adoma',
  'abenaa','gifty','vida','naana','mabel','comfort','patience','mercy',
  'felicia','priscilla','joyce','beatrice','agnes','esther','lydia','hannah',
  'fatima','amina','aisha','zainab','halima','mariam','habiba','rashida',
])

function getGender(name) {
  const first = (name || '').trim().split(/\s+/)[0].toLowerCase()
  if (FEMALE_NAMES.has(first)) return 'women'
  return 'men'
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getAvatarUrl(name) {
  const gender = getGender(name)
  const idx = hashCode(name) % 80  // randomuser has ~100 portraits per gender
  return `https://randomuser.me/api/portraits/${gender}/${idx}.jpg`
}

function Stars({ rating }) {
  return (
    <div className="reviews-section__stars">
      {[1,2,3,4,5].map(i => <IconStar key={i} filled={i <= rating} />)}
    </div>
  )
}

export default function ReviewsSection() {
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [current, setCurrent]   = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.reviews.featured({ page_size: 6 })
        if (!cancelled) setReviews(res.results || res)
      } catch (err) {
        console.error('Failed to load reviews', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Auto-advance
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    if (reviews.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrent(c => (c + 1) % reviews.length)
      }, 5000)
    }
  }, [reviews.length])

  useEffect(() => {
    resetTimer()
    return () => clearInterval(timerRef.current)
  }, [resetTimer])

  function goNext() {
    setCurrent(c => (c + 1) % reviews.length)
    resetTimer()
  }
  function goPrev() {
    setCurrent(c => (c - 1 + reviews.length) % reviews.length)
    resetTimer()
  }

  if (loading) return null
  if (reviews.length === 0) return null

  const review = reviews[current]

  return (
    <section className="reviews-section" id="reviews">
      <PaintStrokes items={[
        { variant: 'b', position: 'tl', width: 300, opacity: 0.4 },
        { variant: 'a', position: 'br', width: 340, opacity: 0.45 },
        { variant: 'splash', position: 'tr', width: 200, opacity: 0.3 },
      ]} />
      <div className="container">
        <div className="reviews-section__header">
          <p className="reviews-section__eyebrow">Testimonials</p>
          <h2 className="reviews-section__title">What Our Guests Say</h2>
        </div>

        <div className="reviews-section__carousel">
          <button className="reviews-section__nav reviews-section__nav--prev" onClick={goPrev} aria-label="Previous review">
            <IconChevronLeft />
          </button>

          <div className="reviews-section__card" key={review.id}>
            <IconQuote />
            <Stars rating={review.rating} />
            <h3 className="reviews-section__review-title">{review.title}</h3>
            <p className="reviews-section__comment">{review.comment}</p>
            <div className="reviews-section__reviewer">
              <img
                src={review.reviewer_photo_url || getAvatarUrl(review.reviewer_name)}
                alt={review.reviewer_name}
                className="reviews-section__avatar"
              />
              <div>
                <span className="reviews-section__name">{review.reviewer_name}</span>
                <span className="reviews-section__service">
                  {SERVICE_LABELS[review.service_type] || review.service_type}
                </span>
              </div>
            </div>
          </div>

          <button className="reviews-section__nav reviews-section__nav--next" onClick={goNext} aria-label="Next review">
            <IconChevronRight />
          </button>
        </div>

        {/* Dots */}
        <div className="reviews-section__dots">
          {reviews.map((_, i) => (
            <button
              key={i}
              className={`reviews-section__dot ${i === current ? 'reviews-section__dot--active' : ''}`}
              onClick={() => { setCurrent(i); resetTimer() }}
              aria-label={`Go to review ${i+1}`}
            />
          ))}
        </div>

        <div className="reviews-section__cta">
          <Link to="/reviews" className="reviews-section__cta-btn">
            Read All Reviews <IconArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}
