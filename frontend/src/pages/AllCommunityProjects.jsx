import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import api from '../api/client'
import './AllCommunityProjects.css'

const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const PLACEHOLDER = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80'

export default function AllCommunityProjects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState(searchParams.get('search') || '')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    async function load() {
      try {
        const params = { page, page_size: 9 }
        if (search) params.search = search
        const res = await api.communityProjects.list(params)
        if (!cancelled) {
          setProjects(res.results || res)
          if (res.count !== undefined) {
            setTotalPages(Math.ceil(res.count / 9))
          }
        }
      } catch (err) {
        console.error('Failed to load community projects', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, search])

  function handleSearch(e) {
    e.preventDefault()
    const val = e.target.elements.search.value.trim()
    setSearch(val)
    setPage(1)
    if (val) setSearchParams({ search: val })
    else setSearchParams({})
  }

  function getImage(project) {
    if (project.media && project.media.length > 0) {
      const img = project.media.find(m => m.media_type === 'image')
      return img ? (img.file_url || img.file) : PLACEHOLDER
    }
    return PLACEHOLDER
  }

  return (
    <div className="page-community">
      <Header />

      {/* Hero */}
      <section className="page-community__hero">
        <div className="container">
          <p className="page-community__eyebrow"><IconHeart /> Giving Back</p>
          <h1 className="page-community__hero-title">Community Impact</h1>
          <p className="page-community__hero-sub">
            Discover the projects and initiatives that make tourism a force for good in Ghana
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="page-community__toolbar">
        <div className="container">
          <form className="page-community__search" onSubmit={handleSearch}>
            <IconSearch />
            <input
              type="text"
              name="search"
              placeholder="Search projects…"
              defaultValue={search}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      {/* Grid */}
      <section className="page-community__content">
        <div className="container">
          {loading ? (
            <div className="page-community__loading"><div className="page-community__spinner" /></div>
          ) : projects.length === 0 ? (
            <div className="page-community__empty">
              <h3>No projects found</h3>
              <p>Try adjusting your search or check back later for new initiatives.</p>
            </div>
          ) : (
            <>
              <div className="page-community__grid">
                {projects.map(project => (
                  <Link to={`/community/${project.slug}`} key={project.id} className="page-community__card">
                    <div className="page-community__card-img">
                      <img src={getImage(project)} alt={project.title} loading="lazy" />
                      <div className="page-community__card-overlay" />
                      {project.is_featured && (
                        <span className="page-community__card-badge">Featured</span>
                      )}
                    </div>
                    <div className="page-community__card-body">
                      <div className="page-community__card-meta">
                        <span className="page-community__card-location">
                          <IconMapPin /> {project.location}
                        </span>
                        {project.date && (
                          <span className="page-community__card-date">
                            <IconCalendar /> {new Date(project.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <h3 className="page-community__card-title">{project.title}</h3>
                      <p className="page-community__card-summary">
                        {project.impact_summary || project.description?.slice(0, 140) + '…'}
                      </p>
                      <div className="page-community__card-footer">
                        <span className="page-community__card-impact">
                          <IconUsers /> {project.beneficiaries_count.toLocaleString()} impacted
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="page-community__pagination">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span>Page {page} of {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
