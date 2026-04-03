import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import api from '../api/client'
import './CommunityProjectDetail.css'

const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconHeart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const PLACEHOLDER = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80'

export default function CommunityProjectDetail() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    let cancelled = false
    async function load() {
      try {
        const data = await api.communityProjects.bySlug(slug)
        if (!cancelled) setProject(data)
      } catch (err) {
        console.error('Failed to load project', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="cp-detail">
        <Header />
        <div className="cp-detail__loading"><div className="cp-detail__spinner" /></div>
        <Footer />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="cp-detail">
        <Header />
        <div className="cp-detail__not-found">
          <h2>Project Not Found</h2>
          <Link to="/community">← Back to All Projects</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const images = project.media?.filter(m => m.media_type === 'image') || []
  const heroImg = images.length > 0 ? (images[0].file_url || images[0].file) : PLACEHOLDER

  return (
    <div className="cp-detail">
      <Header />

      {/* Hero */}
      <section className="cp-detail__hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="cp-detail__hero-overlay" />
        <div className="container cp-detail__hero-inner">
          <Link to="/community" className="cp-detail__back">
            <IconArrowLeft /> All Projects
          </Link>
          <h1 className="cp-detail__title">{project.title}</h1>
          <div className="cp-detail__meta">
            <span><IconMapPin /> {project.location}</span>
            {project.date && (
              <span>
                <IconCalendar />{' '}
                {new Date(project.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="cp-detail__stats-bar">
        <div className="container">
          <div className="cp-detail__stats">
            <div className="cp-detail__stat">
              <IconUsers />
              <div>
                <span className="cp-detail__stat-value">{project.beneficiaries_count.toLocaleString()}</span>
                <span className="cp-detail__stat-label">People Impacted</span>
              </div>
            </div>
            {project.impact_summary && (
              <div className="cp-detail__stat">
                <IconHeart />
                <div>
                  <span className="cp-detail__stat-value">Impact</span>
                  <span className="cp-detail__stat-label">{project.impact_summary}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="cp-detail__body">
        <div className="container">
          <div className="cp-detail__description">
            <h2>About This Project</h2>
            {project.description.split('\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Gallery */}
          {images.length > 1 && (
            <div className="cp-detail__gallery">
              <h2>Gallery</h2>
              <div className="cp-detail__gallery-grid">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    className="cp-detail__gallery-item"
                    onClick={() => setLightbox(idx)}
                  >
                    <img src={img.file_url || img.file} alt={img.caption || project.title} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="cp-detail__lightbox" onClick={() => setLightbox(null)}>
          <button className="cp-detail__lightbox-close" onClick={() => setLightbox(null)}>
            <IconX />
          </button>
          <img
            src={images[lightbox].file_url || images[lightbox].file}
            alt={images[lightbox].caption || project.title}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  )
}
