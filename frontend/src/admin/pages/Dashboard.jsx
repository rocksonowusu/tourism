import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import s from './Dashboard.module.css'
import { usePageTitle } from '../hooks/usePageTitle'

// ── Icons ──────────────────────────────────────────────────────────────────
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconImage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconMedia = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const IconCompass = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
)
const IconInbox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)
const IconStarOutline = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

// ── helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—'

const isUpcoming = (d) => d && new Date(d) >= new Date()

const greet = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const longDate = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})

// ── component ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  usePageTitle('Dashboard')
  const navigate = useNavigate()
  const [stats,         setStats]         = useState(null)
  const [recentEvents,  setRecentEvents]  = useState([])
  const [featuredSites, setFeaturedSites] = useState([])
  const [recentMedia,   setRecentMedia]   = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [evAll, evUp, siteAll, evMedia, siteMedia, evMediaRecent, siteMediaRecent, tourAll, tripNew, eventReqNew] = await Promise.allSettled([
          api.events.list({      page_size: 8, ordering: '-created_at' }),
          api.events.upcoming({  page_size: 1 }),
          api.sites.list({       page_size: 4 }),
          api.eventMedia.list({  page_size: 1 }),
          api.siteMedia.list({   page_size: 1 }),
          api.eventMedia.list({  page_size: 4, ordering: '-created_at' }),
          api.siteMedia.list({   page_size: 4, ordering: '-created_at' }),
          api.tours.list({       page_size: 1 }),
          api.tripRequests.newCount(),
          api.eventRequests.newCount(),
        ])

        const evData            = evAll.value            ?? { count: 0, results: [] }
        const upData            = evUp.value             ?? { count: 0 }
        const siteData          = siteAll.value          ?? { count: 0, results: [] }
        const evMediaData       = evMedia.value          ?? { count: 0 }
        const stMediaData       = siteMedia.value        ?? { count: 0 }
        const evMediaItems      = evMediaRecent.value    ?? { results: [] }
        const siteMediaItems    = siteMediaRecent.value  ?? { results: [] }
        const tourData          = tourAll.value           ?? { count: 0 }
        const tripNewData       = tripNew.value           ?? { count: 0 }
        const eventReqNewData   = eventReqNew.value        ?? { count: 0 }

        setStats({
          totalEvents:   evData.count,
          totalSites:    siteData.count,
          upcomingCount: upData.count,
          mediaCount:    (evMediaData.count ?? 0) + (stMediaData.count ?? 0),
          totalTours:    tourData.count,
          newRequests:   tripNewData.count ?? 0,
          newEventRequests: eventReqNewData.count ?? 0,
        })
        setRecentEvents(evData.results    ?? [])
        setFeaturedSites(siteData.results ?? [])

        // Merge + dedupe the 4+4 most recent media items, take first 6
        const merged = [
          ...(evMediaItems.results   ?? []).map(m => ({ ...m, _kind: 'event' })),
          ...(siteMediaItems.results ?? []).map(m => ({ ...m, _kind: 'site' })),
        ]
        merged.sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0))
        setRecentMedia(merged.slice(0, 6))
      } catch {
        // API may not be running in dev
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className={s.page}>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>{greet()}</h1>
          <p className={s.pageDate}>{longDate}</p>
        </div>
        <Link to="/admin/events" className={s.quickAdd}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Event
        </Link>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <section className={s.statsGrid}>
        <StatCard label="Total Events"    value={stats?.totalEvents}   icon={<IconCalendar />} color="gold"  loading={loading} />
        <StatCard label="Tourist Sites"   value={stats?.totalSites}    icon={<IconMapPin />}   color="blue"  loading={loading} />
        <StatCard label="Tours"           value={stats?.totalTours}    icon={<IconCompass />}   color="green" loading={loading} />
        <StatCard label="Trip Requests"   value={stats?.newRequests}   icon={<IconInbox />}    color="gold"  loading={loading} />
        <StatCard label="Event Requests"  value={stats?.newEventRequests} icon={<IconStarOutline />}  color="gold"  loading={loading} />
        <StatCard label="Upcoming Events" value={stats?.upcomingCount} icon={<IconClock />}    color="green" loading={loading} />
        <StatCard label="Media Files"     value={stats?.mediaCount}    icon={<IconImage />}    color="blue"  loading={loading} />
      </section>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <section className={s.quickActions}>
        <h2 className={s.sectionLabel}>Quick Actions</h2>
        <div className={s.actionsGrid}>
          <button className={s.actionCard} onClick={() => navigate('/admin/events')}>
            <span className={s.actionIcon} style={{ '--ac': 'rgba(197,160,40,0.22)', '--ac-fg': 'var(--gold-rich)' }}>
              <IconPlus />
            </span>
            <span className={s.actionText}>
              <span className={s.actionTitle}>New Event</span>
              <span className={s.actionSub}>Create & publish an event</span>
            </span>
          </button>
          <button className={s.actionCard} onClick={() => navigate('/admin/sites')}>
            <span className={s.actionIcon} style={{ '--ac': 'rgba(59,130,246,0.20)', '--ac-fg': '#60A5FA' }}>
              <IconGrid />
            </span>
            <span className={s.actionText}>
              <span className={s.actionTitle}>Add Site</span>
              <span className={s.actionSub}>Register a tourist site</span>
            </span>
          </button>
          <button className={s.actionCard} onClick={() => navigate('/admin/media')}>
            <span className={s.actionIcon} style={{ '--ac': 'rgba(16,185,129,0.20)', '--ac-fg': '#34D399' }}>
              <IconUpload />
            </span>
            <span className={s.actionText}>
              <span className={s.actionTitle}>Upload Media</span>
              <span className={s.actionSub}>Add photos to sites or events</span>
            </span>
          </button>
          <button className={s.actionCard} onClick={() => navigate('/admin/tours')}>
            <span className={s.actionIcon} style={{ '--ac': 'rgba(16,185,129,0.20)', '--ac-fg': '#34D399' }}>
              <IconCompass />
            </span>
            <span className={s.actionText}>
              <span className={s.actionTitle}>Manage Tours</span>
              <span className={s.actionSub}>Create & manage tour packages</span>
            </span>
          </button>
          <button className={s.actionCard} onClick={() => navigate('/admin/trip-requests')}>
            <span className={s.actionIcon} style={{ '--ac': 'rgba(239,68,68,0.15)', '--ac-fg': '#F87171' }}>
              <IconInbox />
            </span>
            <span className={s.actionText}>
              <span className={s.actionTitle}>Trip Requests</span>
              <span className={s.actionSub}>View & respond to bookings</span>
            </span>
          </button>
          <button className={s.actionCard} onClick={() => navigate('/admin/event-requests')}>
            <span className={s.actionIcon} style={{ '--ac': 'rgba(197,160,40,0.22)', '--ac-fg': 'var(--gold-rich)' }}>
              <IconStarOutline />
            </span>
            <span className={s.actionText}>
              <span className={s.actionTitle}>Event Requests</span>
              <span className={s.actionSub}>Manage event enquiries</span>
            </span>
          </button>
          <a className={s.actionCard} href="/" target="_blank" rel="noopener noreferrer">
            <span className={s.actionIcon} style={{ '--ac': 'rgba(168,85,247,0.20)', '--ac-fg': '#C084FC' }}>
              <IconGlobe />
            </span>
            <span className={s.actionText}>
              <span className={s.actionTitle}>View Public Site</span>
              <span className={s.actionSub}>See what visitors see</span>
            </span>
          </a>
        </div>
      </section>

      {/* ── Lower two-column section ─────────────────────────────────── */}
      <div className={s.grid2}>

        {/* Recent Events */}
        <section className={s.card}>
          <div className={s.cardHeader}>
            <h2 className={s.cardTitle}>Recent Events</h2>
            <Link to="/admin/events" className={s.viewAll}>
              View all <IconArrow />
            </Link>
          </div>

          {loading ? (
            <div className={s.skeletonList}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={s.skeletonRow}>
                  <div className={s.skeletonLine} style={{ width: '55%' }} />
                  <div className={s.skeletonLine} style={{ width: '20%' }} />
                </div>
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <p className={s.empty}>No events have been created yet.</p>
          ) : (
            <div className={s.eventTable}>
              <div className={s.eventTableHead}>
                <span>Event</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              {recentEvents.map(ev => (
                <div key={ev.id} className={s.eventRow}>
                  <div className={s.eventInfo}>
                    <span className={s.eventTitle}>{ev.title}</span>
                    {ev.location && (
                      <span className={s.eventLocation}>
                        <IconPin /> {ev.location}
                      </span>
                    )}
                  </div>
                  <span className={s.eventDate}>{fmtDate(ev.start_date)}</span>
                  <div className={s.eventStatus}>
                    {ev.is_featured && <Badge variant="gold">Featured</Badge>}
                    <Badge variant={isUpcoming(ev.start_date) ? 'success' : 'default'}>
                      {isUpcoming(ev.start_date) ? 'Upcoming' : 'Past'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Featured Sites */}
        <section className={s.card}>
          <div className={s.cardHeader}>
            <h2 className={s.cardTitle}>Featured Sites</h2>
            <Link to="/admin/sites" className={s.viewAll}>
              View all <IconArrow />
            </Link>
          </div>

          {loading ? (
            <div className={s.siteGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={s.siteSkeleton} />
              ))}
            </div>
          ) : featuredSites.length === 0 ? (
            <p className={s.empty}>No featured sites configured.</p>
          ) : (
            <div className={s.siteGrid}>
              {featuredSites.map(site => (
                <div key={site.id} className={s.siteCard}>
                  <div className={s.siteCardTop}>
                    <span className={s.siteIconWrap}><IconMapPin /></span>
                    <span className={s.siteFeatBadge}><IconStar /></span>
                  </div>
                  <div className={s.siteName}>{site.name}</div>
                  {site.location && <div className={s.siteLoc}>{site.location}</div>}
                  <div className={s.siteMeta}>
                    <span className={s.siteMetaItem}>
                      <IconCalendar /> {site.upcoming_events_count ?? 0} events
                    </span>
                    <span className={s.siteMetaItem}>
                      <IconMedia /> {site.media_count ?? 0} media
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── Recent Media Strip ───────────────────────────────────────── */}
      {(loading || recentMedia.length > 0) && (
        <section className={s.card}>
          <div className={s.cardHeader}>
            <h2 className={s.cardTitle}>Recently Uploaded Media</h2>
            <Link to="/admin/media" className={s.viewAll}>
              View all <IconArrow />
            </Link>
          </div>
          {loading ? (
            <div className={s.mediaStrip}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={s.mediaSkeleton} />
              ))}
            </div>
          ) : (
            <div className={s.mediaStrip}>
              {recentMedia.map((m, i) => (
                <div key={`${m._kind}-${m.id}-${i}`} className={s.mediaThumb}>
                  <img
                    src={m.file_url ?? m.file}
                    alt={m.caption ?? m.alt_text ?? 'Media'}
                    loading="lazy"
                  />
                  {m.caption && (
                    <div className={s.mediaCaption}>{m.caption}</div>
                  )}
                  <span className={s.mediaKindBadge}>{m._kind}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  )
}

