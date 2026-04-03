import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './AccommodationDetail.css'

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
const IconBed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
  </svg>
)
const IconBath = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/>
    <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/>
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
const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)
const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
)
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconInfo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'
const WHATSAPP_NUMBER = '233557533568'

const PROPERTY_LABELS = {
  apartment: 'Apartment',
  house:     'House',
  villa:     'Villa',
  suite:     'Suite',
}

// ── Component ────────────────────────────────────────────────────────────
export default function AccommodationDetail() {
  const { slug } = useParams()
  const [apartment, setApartment] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await api.apartments.bySlug(slug)
        setApartment(data)
      } catch (err) {
        setError(err.message || 'Accommodation not found')
      } finally {
        setLoading(false)
      }
    }
    fetch()
    window.scrollTo(0, 0)
  }, [slug])

  // WhatsApp message — professional, no emojis
  const whatsappUrl = useMemo(() => {
    if (!apartment) return '#'
    const lines = [
      `Hello, I am interested in the "${apartment.title}" property.`,
      '',
      `Location: ${apartment.location || 'N/A'}`,
      `Property type: ${PROPERTY_LABELS[apartment.property_type] || apartment.property_type}`,
      apartment.bedrooms ? `Bedrooms: ${apartment.bedrooms}` : '',
      apartment.price_per_night ? `Listed rate: GH₵${Number(apartment.price_per_night).toLocaleString()} per night` : '',
      '',
      'I would like to enquire about availability and booking details.',
      'Please let me know the next steps.',
    ].filter(Boolean).join('\n')
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`
  }, [apartment])

  const media = apartment?.media ?? []
  const heroImg = media[activeImg]?.file_url ?? FALLBACK_IMG
  const amenities = apartment?.amenities ?? []
  const rules = apartment?.rules ?? []

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="ad__loading"><div className="ad__spinner" /></div>
        <Footer />
      </div>
    )
  }
  if (error || !apartment) {
    return (
      <div className="app">
        <Header />
        <div className="ad__error">
          <h2>Accommodation Not Found</h2>
          <p>{error || "The property you're looking for doesn't exist."}</p>
          <Link to="/accommodations" className="ad__back-btn"><IconArrowLeft /> All Accommodations</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app">
      <Header />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="ad__hero">
        <div className="ad__hero-bg">
          <img src={heroImg} alt={apartment.title} onError={e => { e.target.src = FALLBACK_IMG }} />
        </div>
        <div className="ad__hero-overlay" />
        <div className="ad__hero-inner container">
          <Link to="/accommodations" className="ad__breadcrumb">
            <IconArrowLeft /> All Accommodations
          </Link>
          <div className="ad__hero-content">
            <div className="ad__hero-text">
              {apartment.is_featured && (
                <div className="ad__hero-featured"><IconStar /> Featured</div>
              )}
              <h1 className="ad__hero-title">{apartment.title}</h1>
              <div className="ad__hero-meta">
                {apartment.location && (
                  <span className="ad__hero-meta-item"><IconMapPin /> {apartment.location}</span>
                )}
                {apartment.property_type && (
                  <span className="ad__hero-meta-item">
                    {PROPERTY_LABELS[apartment.property_type] ?? apartment.property_type}
                  </span>
                )}
                {apartment.bedrooms && (
                  <span className="ad__hero-meta-item"><IconBed /> {apartment.bedrooms} Bedroom{apartment.bedrooms !== 1 ? 's' : ''}</span>
                )}
                {apartment.max_guests && (
                  <span className="ad__hero-meta-item"><IconUsers /> Up to {apartment.max_guests} guest{apartment.max_guests !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      {media.length > 1 && (
        <div className="container">
          <div className="ad__gallery-strip">
            {media.filter(m => m.media_type === 'image').map((m, i) => (
              <div
                key={m.id}
                className={`ad__gallery-thumb ${i === activeImg ? 'ad__gallery-thumb--active' : ''}`}
                onClick={() => setActiveImg(i)}
              >
                <img src={m.file_url} alt={m.caption || apartment.title} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────── */}
      <section className="ad__body">
        <PaintStrokes items={[
          { variant: 'a', position: 'tr', width: 300, opacity: 0.4 },
          { variant: 'b', position: 'bl', width: 280, opacity: 0.35 },
        ]} />
        <div className="container">
          <div className="ad__body-grid">
            {/* ─── Left: Property info ──────────────────────────── */}
            <div className="ad__main">
              {/* Description */}
              <div className="ad__section">
                <h2 className="ad__section-title"><IconFileText /> About This Property</h2>
                <p className="ad__description">{apartment.description}</p>
              </div>

              {/* Property details */}
              <div className="ad__section">
                <h2 className="ad__section-title"><IconGrid /> Property Details</h2>
                <div className="ad__details-grid">
                  {apartment.bedrooms && (
                    <div className="ad__detail-item">
                      <IconBed />
                      <span>{apartment.bedrooms} Bedroom{apartment.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {apartment.bathrooms && (
                    <div className="ad__detail-item">
                      <IconBath />
                      <span>{apartment.bathrooms} Bathroom{apartment.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {apartment.max_guests && (
                    <div className="ad__detail-item">
                      <IconUsers />
                      <span>Max {apartment.max_guests} Guest{apartment.max_guests !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {apartment.property_type && (
                    <div className="ad__detail-item">
                      <IconStar />
                      <span>{PROPERTY_LABELS[apartment.property_type] ?? apartment.property_type}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="ad__section">
                  <h2 className="ad__section-title"><IconCheck /> Amenities</h2>
                  <ul className="ad__list">
                    {amenities.map((a, i) => (
                      <li key={i}>
                        <span className="ad__list-icon ad__list-icon--check"><IconCheck /></span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* House Rules */}
              {rules.length > 0 && (
                <div className="ad__section">
                  <h2 className="ad__section-title"><IconInfo /> House Rules</h2>
                  <ul className="ad__list">
                    {rules.map((r, i) => (
                      <li key={i}>
                        <span className="ad__list-icon ad__list-icon--info"><IconInfo /></span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Address */}
              {apartment.address && (
                <div className="ad__section">
                  <h2 className="ad__section-title"><IconMapPin /> Address</h2>
                  <p className="ad__description">{apartment.address}</p>
                </div>
              )}
            </div>

            {/* ─── Right: Sidebar CTA ───────────────────────────── */}
            <div className="ad__sidebar">
              <div className="ad__cta-card">
                <h2 className="ad__cta-title">Interested in this property?</h2>

                {apartment.price_per_night && (
                  <div className="ad__cta-price">
                    <span className="ad__cta-amount">GH₵{Number(apartment.price_per_night).toLocaleString()}</span>
                    <span className="ad__cta-per">per night</span>
                  </div>
                )}

                <p className="ad__cta-desc">
                  Contact us directly on WhatsApp to check availability, discuss your
                  travel dates, and arrange your stay.
                </p>

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="ad__whatsapp-btn">
                  <IconWhatsApp /> Enquire on WhatsApp
                </a>

                <p className="ad__cta-note">
                  Our team typically responds within a few hours during business hours.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
