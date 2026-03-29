import React from 'react'
import { Link } from 'react-router-dom'
import './EventsSection.css'
import { useScrollReveal } from '../hooks/useScrollReveal'

const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

// Fallback Ghana events when API is empty
const MOCK_EVENTS = [
  {
    id: 'm1',
    name: 'Chale Wote Street Art Festival',
    date: '2026-08-15',
    location: 'James Town, Accra',
    description: 'Ghana\'s biggest contemporary arts festival — a vibrant explosion of street art, performance, music and creativity in the heart of old Accra.',
    category: 'Arts & Culture',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80',
  },
  {
    id: 'm2',
    name: 'Homowo Festival',
    date: '2026-09-05',
    location: 'Accra, Greater Accra',
    description: 'The Ga people\'s harvest festival of "hooting at hunger" — celebrated with traditional food, drumming, and colourful processions.',
    category: 'Cultural Festival',
    image: 'https://images.unsplash.com/photo-1580746738099-b2d7c0e5a7ec?w=600&q=80',
  },
  {
    id: 'm3',
    name: 'Afrochella (AfroFuture)',
    date: '2026-12-27',
    location: 'El Wak Sports Stadium, Accra',
    description: 'Africa\'s premier music and cultural celebration, bringing together top African artists, creatives, and the global diaspora.',
    category: 'Music & Entertainment',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
  },
  {
    id: 'm4',
    name: 'Panafest',
    date: '2026-07-24',
    location: 'Cape Coast, Central Region',
    description: 'A biennial pan-African heritage festival commemorating the transatlantic slave trade with drama, film, visual arts and scholarly forums.',
    category: 'Heritage',
    image: 'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=600&q=80',
  },
  {
    id: 'm5',
    name: 'Ghana Food Festival',
    date: '2026-06-12',
    location: 'Accra Mall Grounds, Accra',
    description: 'Celebrate Ghana\'s rich culinary traditions — from jollof rice cook-offs to kelewele stands, waakye stalls, and live cooking demos.',
    category: 'Food & Drink',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  },
  {
    id: 'm6',
    name: 'Kente Festival',
    date: '2026-10-10',
    location: 'Bonwire, Ashanti Region',
    description: 'A celebration of Ghana\'s world-famous hand-woven Kente cloth — watch master weavers at work and take home an authentic piece of Ghanaian heritage.',
    category: 'Arts & Craft',
    image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&q=80',
  },
]

function formatDate(dateStr) {
  if (!dateStr) return {}
  const d = new Date(dateStr)
  return {
    day:   d.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    year:  d.toLocaleDateString('en-GB', { year: 'numeric' }),
    full:  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  }
}

export default function EventsSection({ events = [], loading }) {
  const headerRef = useScrollReveal({ threshold: 0.1 })
  const listRef = useScrollReveal({ threshold: 0.06, stagger: true })
  const displayEvents = events.length
    ? events.map(e => ({
        id:          e.id,
        slug:        e.slug,
        name:        e.name ?? e.title,
        date:        e.date ?? e.start_date,
        location:    e.location ?? '',
        description: e.description ?? '',
        category:    e.category ?? 'Event',
        image:       e.media?.[0]?.file_url ?? e.image ?? e.featured_image ?? MOCK_EVENTS[0].image,
      }))
    : MOCK_EVENTS

  const featured = displayEvents[0]
  const sideEvents = displayEvents.slice(1, 5)
  const featuredDate = formatDate(featured?.date)

  return (
    <section className="ev-section" id="events">
      <div className="container">

        {/* ── Section header ──────────────────────────────────────── */}
        <div className="ev__header sr" ref={headerRef}>
          <div>
            <p className="ev__eyebrow">What's On in Ghana</p>
            <h2 className="ev__title">Upcoming Events</h2>
          </div>
          <a href="#events" className="ev__view-all">
            View all events <IconArrow />
          </a>
        </div>

        {/* ── Editorial layout ────────────────────────────────────── */}
        {loading ? (
          <div className="ev__skeleton-wrap">
            <div className="ev__skeleton ev__skeleton--featured" />
            <div className="ev__skeleton-side">
              {[1, 2, 3, 4].map(i => <div key={i} className="ev__skeleton ev__skeleton--row" />)}
            </div>
          </div>
        ) : (
          <div className="ev__editorial">

            {/* Left: featured card */}
            {featured && (
              <Link
                to={featured.slug ? `/events/${featured.slug}` : '#'}
                className="ev__featured-link"
              >
              <article className="ev__featured fade-in">
                <div className="ev__featured-img">
                  <img
                    src={featured.image}
                    alt={featured.name}
                    loading="eager"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900&q=80' }}
                  />
                  <div className="ev__featured-overlay" />
                  {/* Category tag */}
                  {featured.category && (
                    <span className="ev__tag">{featured.category}</span>
                  )}
                  {/* Date chip */}
                  {featuredDate.day && (
                    <div className="ev__featured-date">
                      <span className="ev__featured-date-day">{featuredDate.day}</span>
                      <span className="ev__featured-date-month">{featuredDate.month}</span>
                    </div>
                  )}
                </div>
                <div className="ev__featured-body">
                  <h3 className="ev__featured-name">{featured.name}</h3>
                  <div className="ev__featured-meta">
                    {featured.location && (
                      <span className="ev__meta-item">
                        <IconMapPin /> {featured.location}
                      </span>
                    )}
                    {featuredDate.full && (
                      <span className="ev__meta-item">
                        <IconCalendar /> {featuredDate.full}
                      </span>
                    )}
                  </div>
                  {featured.description && (
                    <p className="ev__featured-desc">{featured.description}</p>
                  )}
                  <span className="ev__featured-cta">
                    Learn more <IconArrow />
                  </span>
                </div>
              </article>
              </Link>
            )}

            {/* Right: stacked event list */}
            <div className="ev__list sr" ref={listRef}>
              {sideEvents.map((event, i) => {
                const d = formatDate(event.date)
                const eventLink = event.slug ? `/events/${event.slug}` : '#'
                return (
                  <Link
                    key={event.id ?? i}
                    to={eventLink}
                    className="ev__list-item-link"
                    style={{ animationDelay: `${(i + 1) * 0.08}s` }}
                  >
                  <article
                    className="ev__list-item fade-in sr--child"
                  >
                    <div className="ev__list-thumb">
                      <img
                        src={event.image}
                        alt={event.name}
                        loading="lazy"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=300&q=80' }}
                      />
                      {d.day && (
                        <div className="ev__list-date">
                          <span>{d.day}</span>
                          <span>{d.month}</span>
                        </div>
                      )}
                    </div>
                    <div className="ev__list-body">
                      {event.category && <span className="ev__list-tag">{event.category}</span>}
                      <h4 className="ev__list-name">{event.name}</h4>
                      {event.location && (
                        <p className="ev__list-loc"><IconMapPin /> {event.location}</p>
                      )}
                    </div>
                    <div className="ev__list-arrow"><IconArrow /></div>
                  </article>
                  </Link>
                )
              })}
            </div>

          </div>
        )}
      </div>
    </section>
  )
}
