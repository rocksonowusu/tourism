import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PaintStrokes from '../components/PaintStrokes'
import './VehicleDetail.css'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
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
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const IconFuel = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17"/><path d="M15 22H3"/><path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 4"/>
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0b2c?w=600&q=80'
const WHATSAPP_NUMBER = '233557533568'

const VEHICLE_LABELS = {
  sedan:  'Sedan',
  suv:    'SUV',
  van:    'Van',
  bus:    'Bus',
  luxury: 'Luxury',
}
const TRANSMISSION_LABELS = { automatic: 'Automatic', manual: 'Manual' }
const FUEL_LABELS = { petrol: 'Petrol', diesel: 'Diesel', electric: 'Electric', hybrid: 'Hybrid' }

// ── Component ────────────────────────────────────────────────────────────
export default function VehicleDetail() {
  const { slug } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await api.vehicles.bySlug(slug)
        setVehicle(data)
      } catch (err) {
        setError(err.message || 'Vehicle not found')
      } finally {
        setLoading(false)
      }
    }
    fetch()
    window.scrollTo(0, 0)
  }, [slug])

  // WhatsApp message — professional, no emojis
  const whatsappUrl = useMemo(() => {
    if (!vehicle) return '#'
    const lines = [
      `Hello, I am interested in renting the "${vehicle.name}".`,
      '',
      `Vehicle type: ${VEHICLE_LABELS[vehicle.vehicle_type] || vehicle.vehicle_type}`,
      vehicle.brand ? `Brand: ${vehicle.brand}` : '',
      vehicle.model_year ? `Year: ${vehicle.model_year}` : '',
      vehicle.seats ? `Seats: ${vehicle.seats}` : '',
      vehicle.transmission ? `Transmission: ${TRANSMISSION_LABELS[vehicle.transmission] || vehicle.transmission}` : '',
      vehicle.price_per_day ? `Listed rate: GH₵${Number(vehicle.price_per_day).toLocaleString()} per day` : '',
      '',
      'I would like to enquire about availability and rental terms.',
      'Please let me know the next steps.',
    ].filter(Boolean).join('\n')
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`
  }, [vehicle])

  const media = vehicle?.media ?? []
  const heroImg = media[activeImg]?.file_url ?? FALLBACK_IMG
  const features = vehicle?.features ?? []

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="vd__loading"><div className="vd__spinner" /></div>
        <Footer />
      </div>
    )
  }
  if (error || !vehicle) {
    return (
      <div className="app">
        <Header />
        <div className="vd__error">
          <h2>Vehicle Not Found</h2>
          <p>{error || "The vehicle you're looking for doesn't exist."}</p>
          <Link to="/car-rentals" className="vd__back-btn"><IconArrowLeft /> All Vehicles</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app">
      <Header />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="vd__hero">
        <div className="vd__hero-bg">
          <img src={heroImg} alt={vehicle.name} onError={e => { e.target.src = FALLBACK_IMG }} />
        </div>
        <div className="vd__hero-overlay" />
        <div className="vd__hero-inner container">
          <Link to="/car-rentals" className="vd__breadcrumb">
            <IconArrowLeft /> All Vehicles
          </Link>
          <div className="vd__hero-content">
            <div className="vd__hero-text">
              {vehicle.is_featured && (
                <div className="vd__hero-featured"><IconStar /> Featured</div>
              )}
              <h1 className="vd__hero-title">{vehicle.name}</h1>
              <div className="vd__hero-meta">
                {vehicle.vehicle_type && (
                  <span className="vd__hero-meta-item">{VEHICLE_LABELS[vehicle.vehicle_type] ?? vehicle.vehicle_type}</span>
                )}
                {vehicle.brand && (
                  <span className="vd__hero-meta-item">{vehicle.brand} {vehicle.model_year ? `(${vehicle.model_year})` : ''}</span>
                )}
                {vehicle.seats && (
                  <span className="vd__hero-meta-item"><IconUsers /> {vehicle.seats} Seat{vehicle.seats !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      {media.length > 1 && (
        <div className="container">
          <div className="vd__gallery-strip">
            {media.filter(m => m.media_type === 'image').map((m, i) => (
              <div
                key={m.id}
                className={`vd__gallery-thumb ${i === activeImg ? 'vd__gallery-thumb--active' : ''}`}
                onClick={() => setActiveImg(i)}
              >
                <img src={m.file_url} alt={m.caption || vehicle.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────── */}
      <section className="vd__body">
        <PaintStrokes items={[
          { variant: 'a', position: 'tr', width: 300, opacity: 0.4 },
          { variant: 'b', position: 'bl', width: 280, opacity: 0.35 },
        ]} />
        <div className="container">
          <div className="vd__body-grid">
            {/* ─── Left: Vehicle info ───────────────────────────── */}
            <div className="vd__main">
              {/* Description */}
              <div className="vd__section">
                <h2 className="vd__section-title"><IconFileText /> About This Vehicle</h2>
                <p className="vd__description">{vehicle.description}</p>
              </div>

              {/* Specifications */}
              <div className="vd__section">
                <h2 className="vd__section-title"><IconGrid /> Specifications</h2>
                <div className="vd__details-grid">
                  {vehicle.vehicle_type && (
                    <div className="vd__detail-item">
                      <IconStar />
                      <span>{VEHICLE_LABELS[vehicle.vehicle_type] ?? vehicle.vehicle_type}</span>
                    </div>
                  )}
                  {vehicle.brand && (
                    <div className="vd__detail-item">
                      <IconGrid />
                      <span>{vehicle.brand} {vehicle.model_year && `(${vehicle.model_year})`}</span>
                    </div>
                  )}
                  {vehicle.seats && (
                    <div className="vd__detail-item">
                      <IconUsers />
                      <span>{vehicle.seats} Seat{vehicle.seats !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {vehicle.transmission && (
                    <div className="vd__detail-item">
                      <IconSettings />
                      <span>{TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission}</span>
                    </div>
                  )}
                  {vehicle.fuel_type && (
                    <div className="vd__detail-item">
                      <IconFuel />
                      <span>{FUEL_LABELS[vehicle.fuel_type] ?? vehicle.fuel_type}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="vd__section">
                  <h2 className="vd__section-title"><IconCheck /> Features</h2>
                  <ul className="vd__list">
                    {features.map((f, i) => (
                      <li key={i}>
                        <span className="vd__list-icon"><IconCheck /></span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ─── Right: Sidebar CTA ───────────────────────────── */}
            <div className="vd__sidebar">
              <div className="vd__cta-card">
                <h2 className="vd__cta-title">Interested in this vehicle?</h2>

                {vehicle.price_per_day && (
                  <div className="vd__cta-price">
                    <span className="vd__cta-amount">GH₵{Number(vehicle.price_per_day).toLocaleString()}</span>
                    <span className="vd__cta-per">per day</span>
                  </div>
                )}

                <p className="vd__cta-desc">
                  Contact us directly on WhatsApp to check availability, discuss
                  your rental dates, and arrange pickup.
                </p>

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="vd__whatsapp-btn">
                  <IconWhatsApp /> Enquire on WhatsApp
                </a>

                <p className="vd__cta-note">
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
