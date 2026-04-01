import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './TourDetail.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold-rich, #C5A028)" stroke="var(--gold-rich, #C5A028)" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

// Section icons
const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
)
const IconSparkles = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813L20 12l-6.088 3.187L12 21l-1.912-5.813L4 12l6.088-3.187L12 3z"/>
  </svg>
)
const IconGift = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
)
const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80'
const WHATSAPP_NUMBER = '233557533568'

// ── Component ────────────────────────────────────────────────────────────
export default function TourDetail() {
  const { slug } = useParams()
  const [tour, setTour]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [activeImg, setActiveImg]   = useState(0)

  // Form state
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    preferred_date: '', number_of_adults: 1,
    number_of_children: 0, number_of_infants: 0,
    special_requests: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [formError, setFormError]   = useState(null)

  // ── Fetch tour ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await api.tours.bySlug(slug)
        setTour(data)
      } catch (err) {
        setError(err.message || 'Tour not found')
      } finally {
        setLoading(false)
      }
    }
    fetch()
    window.scrollTo(0, 0)
  }, [slug])

  // ── Form helpers ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Math.max(0, parseInt(value) || 0) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      await api.tripRequests.submit({
        tour: tour.id,
        ...form,
        number_of_adults: Math.max(1, form.number_of_adults),
      })
      setSubmitted(true)
    } catch (err) {
      setFormError(err.data?.detail || err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const whatsappUrl = useMemo(() => {
    if (!tour) return '#'
    const msg = [
      `Hi! I'm interested in the "${tour.title}" tour.`,
      `📍 ${tour.location}`,
      tour.duration ? `⏱ ${tour.duration}` : '',
      `👥 Adults: ${form.number_of_adults}, Children: ${form.number_of_children}, Infants: ${form.number_of_infants}`,
      form.preferred_date ? `📅 Preferred date: ${form.preferred_date}` : '',
      '',
      'Could you share more details and pricing?',
    ].filter(Boolean).join('\n')
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
  }, [tour, form])

  // ── Media ───────────────────────────────────────────────────────────
  const media = tour?.media ?? []
  const heroImg = media[activeImg]?.file_url ?? FALLBACK_IMG

  // ── Render ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="td__loading"><div className="td__spinner" /></div>
        <Footer />
      </div>
    )
  }
  if (error || !tour) {
    return (
      <div className="app">
        <Header />
        <div className="td__error">
          <h2>Tour Not Found</h2>
          <p>{error || "The tour you're looking for doesn't exist."}</p>
          <Link to="/tours" className="td__back-btn"><IconArrowLeft /> All Tours</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const price = false  // pricing removed — discussed privately

  return (
    <div className="app">
      <Header />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="td__hero">
        <div className="td__hero-bg">
          <img src={heroImg} alt={tour.title} onError={e => { e.target.src = FALLBACK_IMG }} />
        </div>
        <div className="td__hero-overlay" />
        <div className="td__hero-inner container">
          <Link to="/tours" className="td__breadcrumb">
            <IconArrowLeft /> All Tours
          </Link>
          <div className="td__hero-content">
            <div className="td__hero-text">
              {tour.is_featured && (
                <div className="td__hero-featured"><IconStar /> Featured Tour</div>
              )}
              <h1 className="td__hero-title">{tour.title}</h1>
              <div className="td__hero-meta">
                {tour.location && (
                  <span className="td__hero-meta-item"><IconMapPin /> {tour.location}</span>
                )}
                {tour.duration && (
                  <span className="td__hero-meta-item"><IconClock /> {tour.duration}</span>
                )}
                {tour.max_group_size && (
                  <span className="td__hero-meta-item"><IconUsers /> Max {tour.max_group_size} travellers</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      {media.length > 1 && (
        <div className="container">
          <div className="td__gallery-strip">
            {media.filter(m => m.media_type === 'image').map((m, i) => (
              <div
                key={m.id}
                className={`td__gallery-thumb ${i === activeImg ? 'td__gallery-thumb--active' : ''}`}
                onClick={() => setActiveImg(i)}
              >
                <img src={m.file_url} alt={m.caption || tour.title} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────── */}
      <section className="td__body">
        <PaintStrokes items={[
          { variant: 'a', position: 'tr', width: 300, opacity: 0.4 },
          { variant: 'b', position: 'bl', width: 280, opacity: 0.35 },
        ]} />
        <div className="container">
          <div className="td__body-grid">
            {/* ─── Left: Tour info ──────────────────────────────── */}
            <div className="td__main">
              {/* Description */}
              <div className="td__section">
                <h2 className="td__section-title"><IconFileText /> About This Tour</h2>
                <p className="td__description">{tour.description}</p>
              </div>

              {/* Highlights */}
              {tour.highlights?.length > 0 && (
                <div className="td__section">
                  <h2 className="td__section-title"><IconSparkles /> Highlights</h2>
                  <ul className="td__list">
                    {tour.highlights.map((h, i) => (
                      <li key={i}>
                        <span className="td__list-icon td__list-icon--highlight"><IconStar /></span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Inclusions */}
              {tour.inclusions?.length > 0 && (
                <div className="td__section">
                  <h2 className="td__section-title"><IconGift /> What's Included</h2>
                  <ul className="td__list">
                    {tour.inclusions.map((item, i) => (
                      <li key={i}>
                        <span className="td__list-icon td__list-icon--include"><IconCheck /></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Exclusions */}
              {tour.exclusions?.length > 0 && (
                <div className="td__section">
                  <h2 className="td__section-title"><IconX /> Not Included</h2>
                  <ul className="td__list">
                    {tour.exclusions.map((item, i) => (
                      <li key={i}>
                        <span className="td__list-icon td__list-icon--exclude"><IconX /></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Itinerary */}
              {tour.itinerary?.length > 0 && (
                <div className="td__section">
                  <h2 className="td__section-title"><IconMap /> Itinerary</h2>
                  <div className="td__itinerary">
                    {tour.itinerary.map((item, i) => (
                      <div key={i} className="td__itin-item">
                        <div className="td__itin-day">{item.day || `Day ${i + 1}`}</div>
                        <h3 className="td__itin-title">{item.title}</h3>
                        {item.description && (
                          <p className="td__itin-desc">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─── Right: Request form ──────────────────────────── */}
            <div className="td__sidebar">
              <div className="td__request-card">
                {submitted ? (
                  <div className="td__success">
                    <div className="td__success-icon"><IconCheckCircle /></div>
                    <h3>Request Submitted!</h3>
                    <p>
                      Thank you! Our team will review your request and get back to you shortly.
                      Check your email for a confirmation.
                    </p>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="td__whatsapp-btn">
                      <IconWhatsApp /> Chat on WhatsApp
                    </a>
                  </div>
                ) : (
                  <>
                    <h2 className="td__request-title">Request This Tour</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="td__form-group">
                        <label className="td__form-label">Full Name *</label>
                        <input
                          className="td__form-input" type="text" name="customer_name"
                          value={form.customer_name} onChange={handleChange}
                          placeholder="Your full name" required
                        />
                      </div>
                      <div className="td__form-group">
                        <label className="td__form-label">Email *</label>
                        <input
                          className="td__form-input" type="email" name="customer_email"
                          value={form.customer_email} onChange={handleChange}
                          placeholder="you@email.com" required
                        />
                      </div>
                      <div className="td__form-group">
                        <label className="td__form-label">Phone *</label>
                        <input
                          className="td__form-input" type="tel" name="customer_phone"
                          value={form.customer_phone} onChange={handleChange}
                          placeholder="+233 XX XXX XXXX" required
                        />
                      </div>
                      <div className="td__form-group">
                        <label className="td__form-label">Preferred Date *</label>
                        <input
                          className="td__form-input" type="date" name="preferred_date"
                          value={form.preferred_date} onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Traveller counts */}
                      <div className="td__form-row">
                        <div className="td__form-group">
                          <label className="td__form-label">Adults</label>
                          <input
                            className="td__form-input" type="number" name="number_of_adults"
                            value={form.number_of_adults} onChange={handleChange}
                            min="1" max="50"
                          />
                        </div>
                        <div className="td__form-group">
                          <label className="td__form-label">Children</label>
                          <input
                            className="td__form-input" type="number" name="number_of_children"
                            value={form.number_of_children} onChange={handleChange}
                            min="0" max="20"
                          />
                        </div>
                        <div className="td__form-group">
                          <label className="td__form-label">Infants</label>
                          <input
                            className="td__form-input" type="number" name="number_of_infants"
                            value={form.number_of_infants} onChange={handleChange}
                            min="0" max="10"
                          />
                        </div>
                      </div>

                      {/* Discount note */}
                      <div className="td__discount-note">
                        <p className="td__discount-title">Discounts Available</p>
                        <ul className="td__discount-list">
                          <li>Children (3–12) enjoy reduced rates</li>
                          <li>Infants (under 3) travel at special pricing</li>
                          <li>Special discounts for persons with disabilities</li>
                        </ul>
                        <p className="td__discount-hint">Our team will discuss pricing with you directly after submission.</p>
                      </div>

                      <div className="td__form-group">
                        <label className="td__form-label">Special Requests</label>
                        <textarea
                          className="td__form-textarea" name="special_requests"
                          value={form.special_requests} onChange={handleChange}
                          placeholder="Any dietary needs, accessibility requirements, or special requests…"
                        />
                      </div>

                      {formError && <div className="td__form-error">{formError}</div>}

                      <button type="submit" className="td__submit-btn" disabled={submitting}>
                        {submitting ? 'Submitting…' : 'Submit Request'}
                      </button>

                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="td__whatsapp-btn">
                        <IconWhatsApp /> Chat on WhatsApp
                      </a>
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
