import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import api from '../api/client'
import './AllReviews.css'

const IconStar = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24"
    fill={filled ? '#C5A028' : 'none'}
    stroke="#C5A028" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconStarBig = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24"
    fill={filled ? '#C5A028' : 'none'}
    stroke="#C5A028" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const SERVICE_OPTIONS = [
  { value: '', label: 'All Services' },
  { value: 'tour', label: 'Tours' },
  { value: 'accommodation', label: 'Accommodations' },
  { value: 'event', label: 'Events' },
  { value: 'car_rental', label: 'Car Rentals' },
  { value: 'general', label: 'General' },
]

const SERVICE_LABELS = {
  tour: 'Tour',
  accommodation: 'Accommodation',
  event: 'Event',
  car_rental: 'Car Rental',
  general: 'General',
}

// ── Gender-aware random profile pictures ─────────────────────────────────
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
  return FEMALE_NAMES.has(first) ? 'women' : 'men'
}
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0 }
  return Math.abs(hash)
}
function getAvatarUrl(name) {
  return `https://randomuser.me/api/portraits/${getGender(name)}/${hashCode(name) % 80}.jpg`
}

function Stars({ rating, size = 'sm' }) {
  const Comp = size === 'lg' ? IconStarBig : IconStar
  return (
    <div className="reviews-page__stars">
      {[1,2,3,4,5].map(i => <Comp key={i} filled={i <= rating} />)}
    </div>
  )
}

export default function AllReviews() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState(searchParams.get('service_type') || '')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Leave-a-review form
  const [showForm, setShowForm]   = useState(false)
  const [formData, setFormData]   = useState({
    reviewer_name: '', reviewer_email: '', rating: 5,
    title: '', comment: '', service_type: 'general',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [formError, setFormError]   = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    async function load() {
      try {
        const params = { page, page_size: 10, is_approved: true }
        if (filter) params.service_type = filter
        const res = await api.reviews.list(params)
        if (!cancelled) {
          setReviews(res.results || res)
          if (res.count !== undefined) setTotalPages(Math.ceil(res.count / 10))
        }
      } catch (err) {
        console.error('Failed to load reviews', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, filter])

  function handleFilterChange(val) {
    setFilter(val)
    setPage(1)
    if (val) setSearchParams({ service_type: val })
    else setSearchParams({})
  }

  function handleFormChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await api.reviews.submit(formData)
      setSubmitted(true)
    } catch (err) {
      setFormError(err?.response?.data?.detail || 'Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="reviews-page">
      <Header />

      {/* Hero */}
      <section className="reviews-page__hero">
        <div className="container">
          <p className="reviews-page__eyebrow">⭐ Testimonials</p>
          <h1 className="reviews-page__hero-title">Guest Reviews</h1>
          <p className="reviews-page__hero-sub">
            Read honest feedback from our guests and share your own experience
          </p>
          <button
            className="reviews-page__leave-btn"
            onClick={() => { setShowForm(true); setSubmitted(false) }}
          >
            Leave a Review
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="reviews-page__toolbar">
        <div className="container">
          <div className="reviews-page__filters">
            {SERVICE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`reviews-page__filter-btn ${filter === opt.value ? 'reviews-page__filter-btn--active' : ''}`}
                onClick={() => handleFilterChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="reviews-page__content">
        <div className="container">
          {loading ? (
            <div className="reviews-page__loading"><div className="reviews-page__spinner" /></div>
          ) : reviews.length === 0 ? (
            <div className="reviews-page__empty">
              <h3>No reviews yet</h3>
              <p>Be the first to share your experience!</p>
            </div>
          ) : (
            <>
              <div className="reviews-page__list">
                {reviews.map(review => (
                  <div key={review.id} className="reviews-page__card">
                    <div className="reviews-page__card-header">
                      <div className="reviews-page__card-reviewer">
                        <img
                          src={review.reviewer_photo_url || getAvatarUrl(review.reviewer_name)}
                          alt={review.reviewer_name}
                          className="reviews-page__avatar"
                        />
                        <div>
                          <span className="reviews-page__reviewer-name">{review.reviewer_name}</span>
                          <span className="reviews-page__reviewer-service">
                            {SERVICE_LABELS[review.service_type] || review.service_type}
                          </span>
                        </div>
                      </div>
                      <Stars rating={review.rating} />
                    </div>
                    <h3 className="reviews-page__card-title">{review.title}</h3>
                    <p className="reviews-page__card-comment">{review.comment}</p>
                    <span className="reviews-page__card-date">
                      {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="reviews-page__pagination">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span>Page {page} of {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Leave Review Modal */}
      {showForm && (
        <div className="reviews-page__modal-overlay" onClick={() => setShowForm(false)}>
          <div className="reviews-page__modal" onClick={e => e.stopPropagation()}>
            <button className="reviews-page__modal-close" onClick={() => setShowForm(false)}>×</button>

            {submitted ? (
              <div className="reviews-page__success">
                <IconCheck />
                <h3>Thank You!</h3>
                <p>Your review has been submitted and will appear once approved by our team.</p>
                <button onClick={() => setShowForm(false)}>Close</button>
              </div>
            ) : (
              <>
                <h2 className="reviews-page__modal-title">Leave a Review</h2>
                <form onSubmit={handleSubmitReview} className="reviews-page__form">
                  <div className="reviews-page__form-row">
                    <label>Name *</label>
                    <input type="text" name="reviewer_name" value={formData.reviewer_name} onChange={handleFormChange} required />
                  </div>
                  <div className="reviews-page__form-row">
                    <label>Email *</label>
                    <input type="email" name="reviewer_email" value={formData.reviewer_email} onChange={handleFormChange} required />
                  </div>
                  <div className="reviews-page__form-row">
                    <label>Rating *</label>
                    <div className="reviews-page__rating-input">
                      {[1,2,3,4,5].map(i => (
                        <button type="button" key={i} onClick={() => setFormData(prev => ({ ...prev, rating: i }))}>
                          <IconStarBig filled={i <= formData.rating} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="reviews-page__form-row">
                    <label>Service Type</label>
                    <select name="service_type" value={formData.service_type} onChange={handleFormChange}>
                      {SERVICE_OPTIONS.filter(o => o.value).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="reviews-page__form-row">
                    <label>Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleFormChange} required placeholder="Summarize your experience" />
                  </div>
                  <div className="reviews-page__form-row">
                    <label>Your Review *</label>
                    <textarea name="comment" value={formData.comment} onChange={handleFormChange} required rows="4" placeholder="Tell us about your experience…" />
                  </div>
                  {formError && <p className="reviews-page__form-error">{formError}</p>}
                  <button type="submit" className="reviews-page__form-submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
