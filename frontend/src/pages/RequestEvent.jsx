import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './RequestEvent.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconWhatsApp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const WHATSAPP_NUMBER = '233557533568'

const EVENT_TYPES = [
  { key: 'corporate',    label: 'Corporate',       desc: 'Team building, conferences, retreats' },
  { key: 'family',       label: 'Family & Friends', desc: 'Reunions, birthday parties, get-togethers' },
  { key: 'retreat',      label: 'Retreat',          desc: 'Wellness, spiritual, creative retreats' },
  { key: 'recreational', label: 'Recreational',     desc: 'Adventure, sports, outdoor fun' },
  { key: 'custom',       label: 'Custom',           desc: 'Something unique, tell us your idea!' },
]

const ACTIVITY_OPTIONS = [
  'Drumming & Dancing',
  'Traditional Cooking',
  'Cultural Tour',
  'Beach Activities',
  'Team Building Games',
  'Photography / Videography',
  'Live Music / DJ',
  'Guided Nature Walk',
  'Bonfire & Storytelling',
  'Art & Craft Workshop',
  'Wellness / Yoga',
  'Water Sports',
]

const INITIAL_FORM = {
  event_type: '',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  preferred_date: '',
  expected_attendees: 10,
  location_preference: '',
  budget_range: '',
  activities_interested_in: [],
  special_requirements: '',
}

export default function RequestEvent() {
  const [form, setForm]         = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const today = new Date().toISOString().split('T')[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    // Live date validation
    if (name === 'preferred_date' && value && value < today) {
      setFieldErrors(prev => ({ ...prev, preferred_date: 'Preferred date cannot be in the past.' }))
    } else if (name === 'preferred_date') {
      setFieldErrors(prev => { const { preferred_date, ...rest } = prev; return rest })
    }
  }

  const toggleActivity = (activity) => {
    setForm(prev => {
      const list = prev.activities_interested_in
      if (list.includes(activity)) {
        return { ...prev, activities_interested_in: list.filter(a => a !== activity) }
      }
      return { ...prev, activities_interested_in: [...list, activity] }
    })
  }

  const validate = () => {
    if (!form.event_type) return 'Please select an event type.'
    if (!form.customer_name.trim()) return 'Please enter your name.'
    if (!form.customer_email.trim()) return 'Please enter your email.'
    if (!form.customer_phone.trim()) return 'Please enter your phone number.'
    if (form.expected_attendees < 1) return 'At least 1 attendee is required.'
    if (form.preferred_date && form.preferred_date < today) return 'Preferred date cannot be in the past.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    // Check date field errors
    const errors = {}
    if (form.preferred_date && form.preferred_date < today) {
      errors.preferred_date = 'Preferred date cannot be in the past.'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setError('')
    setSubmitting(true)
    try {
      await api.eventRequests.submit({
        ...form,
        expected_attendees: Number(form.expected_attendees),
      })
      setSubmitted(true)
    } catch (ex) {
      setError(ex?.data?.detail || ex?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const whatsappMessage = () => {
    const type = EVENT_TYPES.find(t => t.key === form.event_type)?.label || form.event_type
    const parts = [
      `Hi, I'd like to request a *${type}* event.`,
      form.expected_attendees > 0 ? `Expected attendees: ${form.expected_attendees}` : '',
      form.preferred_date ? `Preferred date: ${form.preferred_date}` : '',
      form.location_preference ? `Location: ${form.location_preference}` : '',
      form.budget_range ? `Budget: ${form.budget_range}` : '',
      form.activities_interested_in.length > 0 ? `Activities: ${form.activities_interested_in.join(', ')}` : '',
      'Please let me know the details. Thank you!',
    ].filter(Boolean).join('\n')
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(parts)}`
  }

  // ── Success state ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="app">
        <Header />
        <section className="re__page">
          <div className="container">
            <div className="re__success">
              <div className="re__success-icon"><IconCheckCircle /></div>
              <h2>Request Submitted!</h2>
              <p>
                Thank you, <strong>{form.customer_name}</strong>! We've received your event request.
                Our team will be in touch within 24–48 hours to discuss the details.
              </p>
              <div className="re__success-actions">
                <Link to="/events" className="re__btn re__btn--outline">Back to Events</Link>
                <a href={whatsappMessage()} target="_blank" rel="noopener noreferrer" className="re__btn re__btn--whatsapp">
                  <IconWhatsApp /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app">
      <Header />
      <section className="re__page">
        <PaintStrokes items={[
          { variant: 'a', position: 'tr', width: 340, opacity: 0.4 },
          { variant: 'b', position: 'bl', width: 300, opacity: 0.35 },
        ]} />
        <div className="container">

          {/* Breadcrumb */}
          <nav className="re__breadcrumb">
            <Link to="/">Home</Link>
            <span className="re__breadcrumb-sep">/</span>
            <Link to="/events">Events</Link>
            <span className="re__breadcrumb-sep">/</span>
            <span className="re__breadcrumb-current">Request an Event</span>
          </nav>

          {/* Header */}
          <div className="re__header">
            <p className="re__eyebrow">Let Us Organise For You</p>
            <h1 className="re__title">Request an Event</h1>
            <p className="re__subtitle">
              Whether it's a corporate retreat, family gathering, or a unique recreational activity,
              tell us what you need and we'll make it happen.
            </p>
          </div>

          {/* Form */}
          <form className="re__form" onSubmit={handleSubmit}>

            {/* Event type selection */}
            <div className="re__section">
              <h2 className="re__section-title">
                <IconCalendar /> What type of event?
              </h2>
              <div className="re__type-grid">
                {EVENT_TYPES.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    className={`re__type-card${form.event_type === t.key ? ' re__type-card--active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, event_type: t.key }))}
                  >
                    <span className="re__type-label">{t.label}</span>
                    <span className="re__type-desc">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="re__section">
              <h2 className="re__section-title">
                <IconUsers /> Your Details
              </h2>
              <div className="re__field-grid">
                <div className="re__field">
                  <label htmlFor="customer_name">Full Name *</label>
                  <input id="customer_name" name="customer_name" value={form.customer_name}
                    onChange={handleChange} placeholder="John Doe" required />
                </div>
                <div className="re__field">
                  <label htmlFor="customer_email">Email *</label>
                  <input id="customer_email" name="customer_email" type="email"
                    value={form.customer_email} onChange={handleChange}
                    placeholder="john@example.com" required />
                </div>
                <div className="re__field">
                  <label htmlFor="customer_phone">Phone *</label>
                  <input id="customer_phone" name="customer_phone" value={form.customer_phone}
                    onChange={handleChange} placeholder="+233 55 753 3568" required />
                </div>
                <div className="re__field">
                  <label htmlFor="expected_attendees">Expected Attendees</label>
                  <input id="expected_attendees" name="expected_attendees" type="number"
                    min="1" value={form.expected_attendees} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="re__section">
              <h2 className="re__section-title">
                <IconMapPin /> Event Details
              </h2>
              <div className="re__field-grid">
                <div className="re__field">
                  <label htmlFor="preferred_date">Preferred Date</label>
                  <input id="preferred_date" name="preferred_date" type="date"
                    className={fieldErrors.preferred_date ? 're__input--error' : ''}
                    value={form.preferred_date} onChange={handleChange}
                    min={today} />
                  {fieldErrors.preferred_date && (
                    <span className="re__field-error">{fieldErrors.preferred_date}</span>
                  )}
                </div>
                <div className="re__field">
                  <label htmlFor="location_preference">Preferred Location</label>
                  <input id="location_preference" name="location_preference"
                    value={form.location_preference} onChange={handleChange}
                    placeholder="e.g. Accra, Cape Coast, Anywhere" />
                </div>
                <div className="re__field">
                  <label htmlFor="budget_range">Budget Range</label>
                  <input id="budget_range" name="budget_range"
                    value={form.budget_range} onChange={handleChange}
                    placeholder="e.g. GHS 5,000 – 10,000" />
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="re__section">
              <h2 className="re__section-title">Activities You're Interested In</h2>
              <div className="re__activity-grid">
                {ACTIVITY_OPTIONS.map(act => (
                  <button
                    key={act}
                    type="button"
                    className={`re__activity-chip${form.activities_interested_in.includes(act) ? ' re__activity-chip--active' : ''}`}
                    onClick={() => toggleActivity(act)}
                  >
                    {form.activities_interested_in.includes(act) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {/* Special requirements */}
            <div className="re__section">
              <h2 className="re__section-title">Special Requirements</h2>
              <textarea
                className="re__textarea"
                name="special_requirements"
                value={form.special_requirements}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about any special requirements, dietary needs, accessibility requirements, or any other details…"
              />
            </div>

            {/* Error */}
            {error && <div className="re__error">{error}</div>}

            {/* Actions */}
            <div className="re__actions">
              <button type="submit" className="re__btn re__btn--primary" disabled={submitting}>
                {submitting ? (
                  <span className="re__btn-loading">Submitting…</span>
                ) : (
                  <><IconSend /> Submit Request</>
                )}
              </button>
              <a href={whatsappMessage()} target="_blank" rel="noopener noreferrer" className="re__btn re__btn--whatsapp">
                <IconWhatsApp /> Chat on WhatsApp
              </a>
            </div>

          </form>
        </div>
      </section>
      <Footer />
    </div>
  )
}
