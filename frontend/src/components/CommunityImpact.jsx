import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './CommunityImpact.css'
import PaintStrokes from './PaintStrokes'
import api from '../api/client'

const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

// Fallback when no media
const PLACEHOLDER = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80'

export default function CommunityImpact() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.communityProjects.featured({ page_size: 3 })
        const items = res.results || res
        if (!cancelled) {
          setProjects(items)
          setTotalBeneficiaries(
            items.reduce((sum, p) => sum + (p.beneficiaries_count || 0), 0)
          )
        }
      } catch (err) {
        console.error('Failed to load community projects', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  function getImage(project) {
    if (project.media && project.media.length > 0) {
      const img = project.media.find(m => m.media_type === 'image')
      return img ? (img.file_url || img.file) : PLACEHOLDER
    }
    return PLACEHOLDER
  }

  return (
    <section className="community" id="community">
      <PaintStrokes items={[
        { variant: 'b', position: 'tl', width: 320, opacity: 0.45 },
        { variant: 'a', position: 'br', width: 350, opacity: 0.5 },
      ]} />
      <div className="container">

        {/* Header */}
        <div className="community__header">
          <div>
            <p className="community__eyebrow">
              <IconHeart /> Giving Back
            </p>
            <h2 className="community__title">Community Impact</h2>
            <p className="community__subtitle">
              Tourism with purpose — every visit helps uplift local communities across Ghana
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="community__stats">
          <div className="community__stat">
            <span className="community__stat-value">{projects.length}+</span>
            <span className="community__stat-label">Projects</span>
          </div>
          <div className="community__stat-divider" />
          <div className="community__stat">
            <span className="community__stat-value">{totalBeneficiaries.toLocaleString()}+</span>
            <span className="community__stat-label">People Impacted</span>
          </div>
          <div className="community__stat-divider" />
          <div className="community__stat">
            <span className="community__stat-value">
              <IconUsers /> Community
            </span>
            <span className="community__stat-label">Driven Initiatives</span>
          </div>
        </div>

        {/* Project cards */}
        {loading ? (
          <div className="community__loading">
            <div className="community__spinner" />
          </div>
        ) : projects.length === 0 ? (
          <p className="community__empty">Projects coming soon.</p>
        ) : (
          <div className="community__grid">
            {projects.map(project => (
              <Link
                to={`/community/${project.slug}`}
                key={project.id}
                className="community__card"
              >
                <div className="community__card-img">
                  <img src={getImage(project)} alt={project.title} loading="lazy" />
                  <div className="community__card-overlay" />
                  <span className="community__card-beneficiaries">
                    <IconUsers /> {project.beneficiaries_count.toLocaleString()} impacted
                  </span>
                </div>
                <div className="community__card-body">
                  <div className="community__card-location">
                    <IconMapPin /> {project.location}
                  </div>
                  <h3 className="community__card-title">{project.title}</h3>
                  <p className="community__card-summary">
                    {project.impact_summary || project.description?.slice(0, 120) + '…'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="community__cta">
          <Link to="/community" className="community__cta-btn">
            View All Projects <IconArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}
