import React from 'react'
import './Features.css'
import PaintStrokes from './PaintStrokes'

const IconTour = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const IconCulture = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c-4.97 0-9-2.69-9-6 0-4 5-11 9-14 4 3 9 10 9 14 0 3.31-4.03 6-9 6z"/>
    <path d="M12 22c-1.66 0-3-1.12-3-2.5S10.34 14 12 14s3 4 3 5.5S13.66 22 12 22z"/>
  </svg>
)
const IconHeritage = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><path d="M9 10h1"/><path d="M14 10h1"/>
  </svg>
)
const IconConcierge = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

function Features() {
  const features = [
    {
      id: 1,
      Icon: IconTour,
      title: 'Curated Tours',
      description: 'Expertly designed itineraries across all 16 regions, from Accra city tours to northern safari expeditions and coastal heritage trails.'
    },
    {
      id: 2,
      Icon: IconCulture,
      title: 'Cultural Immersion',
      description: 'Live the culture. Join traditional festivals, learn Kente weaving in Bonwire, taste authentic Ghanaian cuisine, and dance to highlife rhythms.'
    },
    {
      id: 3,
      Icon: IconHeritage,
      title: 'Heritage Walks',
      description: 'Walk through history at Cape Coast Castle, Elmina Fort, and the Kwame Nkrumah Mausoleum, guided by locals who know every story.'
    },
    {
      id: 4,
      Icon: IconConcierge,
      title: 'Personal Concierge',
      description: 'From airport pickup to hotel bookings and restaurant reservations, your dedicated travel concierge handles every detail so you can explore freely.'
    }
  ]

  return (
    <section className="features" id="features">
      <PaintStrokes items={[
        { variant: 'a', position: 'tr', width: 360, opacity: 0.55 },
        { variant: 'splash', position: 'bl', width: 240, opacity: 0.35 },
      ]} />
      <div className="container">
        <div className="features-header">
          <p className="features-eyebrow">Why The Ghana Experience?</p>
          <h2 className="features-title">We Don't Just Show You Ghana, We Let You Live It</h2>
          <p className="features-subtitle">
            Since 1957, we've been connecting travellers with the soul of Ghana
            through handcrafted experiences that go beyond the ordinary.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className="feature-card fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon"><feature.Icon /></div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
