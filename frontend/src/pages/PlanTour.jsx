import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './PlanTour.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconMinus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconCheckCircle = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80'

const STEP_LABELS = [
  'Select Sites',
  'Choose Packages',
  'Traveller Details',
  'Contact & Dates',
  'Review & Submit',
]

const FLEXIBILITY_OPTIONS = [
  { value: 'exact',             label: 'Exact dates' },
  { value: 'flexible_1_2_days', label: 'Flexible (1-2 days)' },
  { value: 'flexible_week',     label: 'Flexible (within a week)' },
  { value: 'anytime',           label: 'Anytime / Open' },
]

export default function PlanTour() {
  const [step, setStep]           = useState(1)
  const [sites, setSites]         = useState([])
  const [packages, setPackages]   = useState([])
  const [sitesLoading, setSitesLoading] = useState(true)

  // selections
  const [selectedSites, setSelectedSites]       = useState([])
  const [selectedPackages, setSelectedPackages] = useState([])
  const [siteSearch, setSiteSearch]             = useState('')
  const SITES_PER_PAGE = 8
  const [sitesVisible, setSitesVisible]         = useState(SITES_PER_PAGE)
  // traveller counts
  const [adults, setAdults]     = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants]   = useState(0)

  // contact & dates
  const [contact, setContact] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    country: '', preferred_start_date: '', preferred_end_date: '',
    flexibility: 'exact', special_requests: '',
  })

  // submit state
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  // ── Load data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setSitesLoading(true)
      try {
        const [siteData, pkgData] = await Promise.all([
          api.sites.list({ page_size: 100 }),
          api.customTourRequests.packageOptions(),
        ])
        setSites(siteData?.results ?? siteData ?? [])
        setPackages(pkgData ?? [])
      } catch {
        setSites([])
        setPackages([])
      } finally {
        setSitesLoading(false)
      }
    }
    load()
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────
  const toggleSite = (siteId) => {
    setSelectedSites(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    )
  }

  const togglePackage = (key) => {
    setSelectedPackages(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  const handleContactChange = (e) => {
    const { name, value } = e.target
    setContact(prev => ({ ...prev, [name]: value }))
  }

  const selectedSiteObjects = useMemo(
    () => sites.filter(s => selectedSites.includes(s.id)),
    [sites, selectedSites]
  )

  const selectedPackageLabels = useMemo(
    () => packages.filter(p => selectedPackages.includes(p.key)).map(p => p.label),
    [packages, selectedPackages]
  )

  // Filtered + paginated sites for Step 1
  const filteredSites = useMemo(() => {
    if (!siteSearch.trim()) return sites
    const q = siteSearch.toLowerCase()
    return sites.filter(s =>
      (s.name ?? '').toLowerCase().includes(q) ||
      (s.location ?? '').toLowerCase().includes(q)
    )
  }, [sites, siteSearch])

  // Show selected sites first, then the rest
  const sortedSites = useMemo(() => {
    const selected = filteredSites.filter(s => selectedSites.includes(s.id))
    const rest = filteredSites.filter(s => !selectedSites.includes(s.id))
    return [...selected, ...rest]
  }, [filteredSites, selectedSites])

  const visibleSites = sortedSites.slice(0, sitesVisible)
  const hasMoreSites = sitesVisible < sortedSites.length

  const handleSiteSearch = useCallback((e) => {
    setSiteSearch(e.target.value)
    setSitesVisible(SITES_PER_PAGE)
  }, [])

  const showMoreSites = () => setSitesVisible(v => v + SITES_PER_PAGE)

  // ── Validation ─────────────────────────────────────────────────────────
  const validateStep = (s) => {
    setError('')
    if (s === 1 && selectedSites.length === 0) {
      setError('Please select at least one site to visit.')
      return false
    }
    if (s === 3 && adults < 1) {
      setError('At least 1 adult is required.')
      return false
    }
    if (s === 4) {
      if (!contact.customer_name.trim()) { setError('Your name is required.'); return false }
      if (!contact.customer_email.trim()) { setError('Email address is required.'); return false }
      if (!contact.customer_phone.trim()) { setError('Phone number is required.'); return false }
      if (!contact.preferred_start_date) { setError('Preferred start date is required.'); return false }
    }
    return true
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setStep(prev => Math.min(prev + 1, 5))
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStep(prev => Math.max(prev - 1, 1))
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep(4)) { setStep(4); return }
    setSubmitting(true)
    setError('')
    try {
      await api.customTourRequests.submit({
        site_ids:             selectedSites,
        packages:             selectedPackages,
        number_of_adults:     adults,
        number_of_children:   children,
        number_of_infants:    infants,
        preferred_start_date: contact.preferred_start_date,
        preferred_end_date:   contact.preferred_end_date || null,
        flexibility:          contact.flexibility,
        customer_name:        contact.customer_name,
        customer_email:       contact.customer_email,
        customer_phone:       contact.customer_phone,
        country:              contact.country,
        special_requests:     contact.special_requests,
      })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success Screen ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <Header />
        <div className="pt">
          <div className="pt__success">
            <div className="pt__success-icon"><IconCheckCircle /></div>
            <h1 className="pt__success-title">Request Submitted!</h1>
            <p className="pt__success-desc">
              Thank you, {contact.customer_name}! We have received your custom tour request.
              Our team will review your selections and reach out within 24 hours.
            </p>
            <div className="pt__success-actions">
              <Link to="/tours" className="pt__btn pt__btn--primary">Browse Tours</Link>
              <Link to="/" className="pt__btn pt__btn--outline">Back to Home</Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <div className="pt">
        {/* Hero */}
        <div className="pt__hero">
          <div className="pt__hero-inner">
            <p className="pt__hero-tag">Design Your Dream Trip</p>
            <h1 className="pt__hero-title">Plan Your Own Tour</h1>
            <p className="pt__hero-sub">
              Select the sites you want to visit, choose your preferred packages,
              and we will craft a personalised itinerary just for you.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pt__progress-wrap">
          <div className="pt__stepper">
            {STEP_LABELS.map((label, i) => {
              const num = i + 1
              const isDone = step > num
              const isActive = step === num
              return (
                <div key={num} className={`pt__step ${isDone ? 'pt__step--done' : ''} ${isActive ? 'pt__step--active' : ''}`}>
                  <div className="pt__step-circle">
                    {isDone ? <IconCheck /> : num}
                  </div>
                  <span className="pt__step-label">{label}</span>
                  {num < 5 && <div className="pt__step-line" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="pt__container">

          {/* ── Step 1: Select Sites ──────────────────────────────── */}
          {step === 1 && (
            <div className="pt__card">
              <h2 className="pt__card-title">Where do you want to go?</h2>
              <p className="pt__card-desc">Select the tourist sites you would like to include in your tour. Pick as many as you like.</p>

              {/* Search */}
              <div className="pt__site-search-wrap">
                <span className="pt__site-search-icon"><IconSearch /></span>
                <input
                  className="pt__site-search"
                  placeholder="Search sites by name or location…"
                  value={siteSearch}
                  onChange={handleSiteSearch}
                />
              </div>

              {sitesLoading ? (
                <div className="pt__loading">Loading sites...</div>
              ) : sortedSites.length === 0 ? (
                <div className="pt__empty">
                  {siteSearch ? 'No sites match your search.' : 'No sites available at the moment.'}
                </div>
              ) : (
                <>
                  <div className="pt__sites-grid">
                    {visibleSites.map(site => {
                      const isSelected = selectedSites.includes(site.id)
                      const thumb = site.media?.[0]?.file_url ?? FALLBACK_IMG
                      return (
                        <button
                          key={site.id}
                          type="button"
                          className={`pt__site-card ${isSelected ? 'pt__site-card--selected' : ''}`}
                          onClick={() => toggleSite(site.id)}
                        >
                          <div className="pt__site-img-wrap">
                            <img src={thumb} alt={site.name} className="pt__site-img" loading="lazy" onError={e => { e.target.src = FALLBACK_IMG }} />
                            {isSelected && (
                              <div className="pt__site-check"><IconCheck /></div>
                            )}
                          </div>
                          <div className="pt__site-info">
                            <span className="pt__site-name">{site.name}</span>
                            <span className="pt__site-loc"><IconMapPin /> {site.location}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Show more / Show less */}
                  {hasMoreSites && (
                    <div className="pt__show-more-wrap">
                      <button type="button" className="pt__show-more" onClick={showMoreSites}>
                        Show More Sites ({sortedSites.length - sitesVisible} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}

              {selectedSites.length > 0 && (
                <div className="pt__selected-count">
                  {selectedSites.length} site{selectedSites.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Choose Packages ───────────────────────────── */}
          {step === 2 && (
            <div className="pt__card">
              <h2 className="pt__card-title">What would you like included?</h2>
              <p className="pt__card-desc">Select the packages and add-ons for your tour. These are optional — choose what matters most to you.</p>

              <div className="pt__packages-grid">
                {packages.map(pkg => {
                  const isSelected = selectedPackages.includes(pkg.key)
                  return (
                    <button
                      key={pkg.key}
                      type="button"
                      className={`pt__pkg-card ${isSelected ? 'pt__pkg-card--selected' : ''}`}
                      onClick={() => togglePackage(pkg.key)}
                    >
                      <div className="pt__pkg-check-wrap">
                        <div className={`pt__pkg-checkbox ${isSelected ? 'pt__pkg-checkbox--checked' : ''}`}>
                          {isSelected && <IconCheck />}
                        </div>
                      </div>
                      <span className="pt__pkg-label">{pkg.label}</span>
                    </button>
                  )
                })}
              </div>

              {selectedPackages.length > 0 && (
                <div className="pt__selected-count">
                  {selectedPackages.length} package{selectedPackages.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Traveller Details ─────────────────────────── */}
          {step === 3 && (
            <div className="pt__card">
              <h2 className="pt__card-title">How many travellers?</h2>
              <p className="pt__card-desc">Tell us the number of people in your group. Discounts are available for children, infants, and persons with disabilities.</p>

              <div className="pt__travellers">
                <div className="pt__counter-row">
                  <div className="pt__counter-info">
                    <span className="pt__counter-label">Adults</span>
                    <span className="pt__counter-hint">Ages 13+</span>
                  </div>
                  <div className="pt__counter-controls">
                    <button type="button" className="pt__counter-btn" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1}><IconMinus /></button>
                    <span className="pt__counter-value">{adults}</span>
                    <button type="button" className="pt__counter-btn" onClick={() => setAdults(adults + 1)}><IconPlus /></button>
                  </div>
                </div>

                <div className="pt__counter-row">
                  <div className="pt__counter-info">
                    <span className="pt__counter-label">Children</span>
                    <span className="pt__counter-hint">Ages 3 - 12 (discounted)</span>
                  </div>
                  <div className="pt__counter-controls">
                    <button type="button" className="pt__counter-btn" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0}><IconMinus /></button>
                    <span className="pt__counter-value">{children}</span>
                    <button type="button" className="pt__counter-btn" onClick={() => setChildren(children + 1)}><IconPlus /></button>
                  </div>
                </div>

                <div className="pt__counter-row">
                  <div className="pt__counter-info">
                    <span className="pt__counter-label">Infants</span>
                    <span className="pt__counter-hint">Under 3 (special pricing)</span>
                  </div>
                  <div className="pt__counter-controls">
                    <button type="button" className="pt__counter-btn" onClick={() => setInfants(Math.max(0, infants - 1))} disabled={infants <= 0}><IconMinus /></button>
                    <span className="pt__counter-value">{infants}</span>
                    <button type="button" className="pt__counter-btn" onClick={() => setInfants(infants + 1)}><IconPlus /></button>
                  </div>
                </div>

                <div className="pt__discount-note">
                  Discounts available for children, infants, and persons with disabilities. Our team will discuss applicable discounts with you.
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Contact & Dates ───────────────────────────── */}
          {step === 4 && (
            <div className="pt__card">
              <h2 className="pt__card-title">Your details</h2>
              <p className="pt__card-desc">Tell us how to reach you and when you would like to travel.</p>

              <div className="pt__form">
                <div className="pt__form-row">
                  <div className="pt__form-group">
                    <label className="pt__label" htmlFor="pt-name">Full Name *</label>
                    <input id="pt-name" className="pt__input" name="customer_name" value={contact.customer_name} onChange={handleContactChange} placeholder="Your full name" autoFocus />
                  </div>
                  <div className="pt__form-group">
                    <label className="pt__label" htmlFor="pt-email">Email Address *</label>
                    <input id="pt-email" className="pt__input" type="email" name="customer_email" value={contact.customer_email} onChange={handleContactChange} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="pt__form-row">
                  <div className="pt__form-group">
                    <label className="pt__label" htmlFor="pt-phone">Phone Number *</label>
                    <input id="pt-phone" className="pt__input" name="customer_phone" value={contact.customer_phone} onChange={handleContactChange} placeholder="+233 55 753 3568" />
                  </div>
                  <div className="pt__form-group">
                    <label className="pt__label" htmlFor="pt-country">Country</label>
                    <input id="pt-country" className="pt__input" name="country" value={contact.country} onChange={handleContactChange} placeholder="e.g. Ghana, United Kingdom" />
                  </div>
                </div>

                <div className="pt__form-divider" />

                <div className="pt__form-row">
                  <div className="pt__form-group">
                    <label className="pt__label" htmlFor="pt-start">Preferred Start Date *</label>
                    <input id="pt-start" className="pt__input" type="date" name="preferred_start_date" value={contact.preferred_start_date} onChange={handleContactChange} />
                  </div>
                  <div className="pt__form-group">
                    <label className="pt__label" htmlFor="pt-end">End Date <span className="pt__optional">(optional)</span></label>
                    <input id="pt-end" className="pt__input" type="date" name="preferred_end_date" value={contact.preferred_end_date} onChange={handleContactChange} />
                  </div>
                </div>
                <div className="pt__form-group">
                  <label className="pt__label" htmlFor="pt-flex">Date Flexibility</label>
                  <select id="pt-flex" className="pt__input" name="flexibility" value={contact.flexibility} onChange={handleContactChange}>
                    {FLEXIBILITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="pt__form-group">
                  <label className="pt__label" htmlFor="pt-notes">Special Requests <span className="pt__optional">(optional)</span></label>
                  <textarea id="pt-notes" className="pt__textarea" name="special_requests" rows={3} value={contact.special_requests} onChange={handleContactChange} placeholder="Any special requirements, dietary needs, accessibility needs..." />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Review & Submit ───────────────────────────── */}
          {step === 5 && (
            <div className="pt__card">
              <h2 className="pt__card-title">Review Your Request</h2>
              <p className="pt__card-desc">Please review your selections before submitting.</p>

              <div className="pt__review">
                {/* Sites */}
                <div className="pt__review-section">
                  <div className="pt__review-label">Selected Sites</div>
                  <div className="pt__review-tags">
                    {selectedSiteObjects.map(s => (
                      <span key={s.id} className="pt__review-tag">{s.name}</span>
                    ))}
                  </div>
                </div>

                {/* Packages */}
                {selectedPackageLabels.length > 0 && (
                  <div className="pt__review-section">
                    <div className="pt__review-label">Selected Packages</div>
                    <div className="pt__review-tags">
                      {selectedPackageLabels.map(l => (
                        <span key={l} className="pt__review-tag pt__review-tag--pkg">{l}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Travellers */}
                <div className="pt__review-section">
                  <div className="pt__review-label">Travellers</div>
                  <div className="pt__review-value">
                    {adults} adult{adults !== 1 ? 's' : ''}
                    {children > 0 && <>, {children} child{children !== 1 ? 'ren' : ''}</>}
                    {infants > 0 && <>, {infants} infant{infants !== 1 ? 's' : ''}</>}
                    <span className="pt__review-total"> ({adults + children + infants} total)</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="pt__review-section">
                  <div className="pt__review-label">Travel Dates</div>
                  <div className="pt__review-value">
                    {contact.preferred_start_date}
                    {contact.preferred_end_date && <> to {contact.preferred_end_date}</>}
                    {' '}({FLEXIBILITY_OPTIONS.find(o => o.value === contact.flexibility)?.label})
                  </div>
                </div>

                {/* Contact */}
                <div className="pt__review-section">
                  <div className="pt__review-label">Contact</div>
                  <div className="pt__review-value">
                    {contact.customer_name} &middot; {contact.customer_email} &middot; {contact.customer_phone}
                    {contact.country && <> &middot; {contact.country}</>}
                  </div>
                </div>

                {/* Notes */}
                {contact.special_requests && (
                  <div className="pt__review-section">
                    <div className="pt__review-label">Special Requests</div>
                    <div className="pt__review-value pt__review-value--italic">{contact.special_requests}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Error ─────────────────────────────────────────────── */}
          {error && <div className="pt__error">{error}</div>}

          {/* ── Navigation ────────────────────────────────────────── */}
          <div className="pt__nav">
            {step > 1 && (
              <button type="button" className="pt__btn pt__btn--outline" onClick={goBack}>
                <IconArrowLeft /> Back
              </button>
            )}
            <div className="pt__nav-spacer" />
            {step < 5 ? (
              <button type="button" className="pt__btn pt__btn--primary" onClick={goNext}>
                Continue <IconArrowRight />
              </button>
            ) : (
              <button
                type="button"
                className="pt__btn pt__btn--gold"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : <><IconSend /> Submit Request</>}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── Submitting overlay ───────────────────────────────── */}
      {submitting && (
        <div className="pt__overlay">
          <div className="pt__overlay-box">
            <div className="pt__overlay-spinner" />
            <p className="pt__overlay-text">Submitting your request…</p>
            <p className="pt__overlay-sub">Please wait while we process your custom tour.</p>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
