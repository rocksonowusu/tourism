import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './Reviews.module.css'
import { usePageTitle } from '../hooks/usePageTitle'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconStar = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill={filled ? '#C5A028' : 'none'}
    stroke="#C5A028" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const IconChevLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconWarning = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconStarBig = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const SERVICE_LABELS = {
  tour: 'Tour',
  accommodation: 'Accommodation',
  event: 'Event',
  car_rental: 'Car Rental',
  general: 'General',
}

function Stars({ rating }) {
  return (
    <span className={s.stars}>
      {[1,2,3,4,5].map(i => <IconStar key={i} filled={i <= rating} />)}
    </span>
  )
}

/* ======================================================================= */

export default function Reviews() {
  usePageTitle('Reviews')

  const [tab, setTab]           = useState('all')   // all | pending | approved
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const [stats, setStats]       = useState(null)
  const [showDelete, setShowDelete] = useState(null)

  const PAGE_SIZE = 10
  const { addToast } = useToast()

  /* ── Fetch ────────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (tab === 'pending') {
        res = await api.reviews.pending({ page, page_size: PAGE_SIZE, ...(search && { search }), ...(serviceFilter && { service_type: serviceFilter }) })
      } else {
        const params = { page, page_size: PAGE_SIZE }
        if (search) params.search = search
        if (serviceFilter) params.service_type = serviceFilter
        if (tab === 'approved') params.is_approved = true
        res = await api.reviews.list(params)
      }
      setItems(res.results || res)
      setTotal(res.count ?? 0)
    } catch {
      addToast({ message: 'Failed to load reviews', type: 'error' })
    } finally { setLoading(false) }
  }, [page, search, tab, serviceFilter, addToast])

  const loadStats = useCallback(async () => {
    try {
      const s = await api.reviews.stats()
      setStats(s)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadStats() }, [loadStats])

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  /* ── Actions ──────────────────────────────────────────────────────── */
  async function toggleApprove(review) {
    const newVal = !review.is_approved
    // Optimistic update
    setItems(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: newVal } : r))
    if (stats) {
      setStats(prev => ({
        ...prev,
        approved: newVal ? prev.approved + 1 : prev.approved - 1,
        pending: newVal ? prev.pending - 1 : prev.pending + 1,
      }))
    }
    try {
      await api.reviews.update(review.id, { is_approved: newVal })
      addToast({ message: newVal ? 'Review approved' : 'Review unapproved', type: 'success' })
    } catch {
      // Revert on failure
      setItems(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: !newVal } : r))
      if (stats) {
        setStats(prev => ({
          ...prev,
          approved: newVal ? prev.approved - 1 : prev.approved + 1,
          pending: newVal ? prev.pending + 1 : prev.pending - 1,
        }))
      }
      addToast({ message: 'Action failed', type: 'error' })
    }
  }

  async function toggleFeatured(review) {
    const newVal = !review.is_featured
    // Optimistic update
    setItems(prev => prev.map(r => r.id === review.id ? { ...r, is_featured: newVal } : r))
    if (stats) {
      setStats(prev => ({
        ...prev,
        featured: newVal ? prev.featured + 1 : prev.featured - 1,
      }))
    }
    try {
      await api.reviews.update(review.id, { is_featured: newVal })
      addToast({ message: newVal ? 'Marked as featured' : 'Unfeatured', type: 'success' })
    } catch {
      // Revert on failure
      setItems(prev => prev.map(r => r.id === review.id ? { ...r, is_featured: !newVal } : r))
      if (stats) {
        setStats(prev => ({
          ...prev,
          featured: newVal ? prev.featured - 1 : prev.featured + 1,
        }))
      }
      addToast({ message: 'Action failed', type: 'error' })
    }
  }

  async function handleDelete() {
    try {
      await api.reviews.delete(showDelete.id)
      addToast({ message: 'Review deleted', type: 'success' })
      setShowDelete(null); load(); loadStats()
    } catch { addToast({ message: 'Failed to delete', type: 'error' }) }
  }

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className={s.page}>
      {/* Stats */}
      {stats && (
        <div className={s.statsRow}>
          <div className={s.statCard}>
            <span className={s.statValue}>{stats.total}</span>
            <span className={s.statLabel}>Total</span>
          </div>
          <div className={s.statCard}>
            <span className={s.statValue}>{stats.approved}</span>
            <span className={s.statLabel}>Approved</span>
          </div>
          <div className={s.statCard}>
            <span className={`${s.statValue} ${s.pending}`}>{stats.pending}</span>
            <span className={s.statLabel}>Pending</span>
          </div>
          <div className={s.statCard}>
            <span className={s.statValue}>{stats.featured}</span>
            <span className={s.statLabel}>Featured</span>
          </div>
          <div className={s.statCard}>
            <span className={s.statValue}>{stats.average_rating ? stats.average_rating.toFixed(1) : '—'} ★</span>
            <span className={s.statLabel}>Avg Rating</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'all' ? s.tabActive : ''}`} onClick={() => { setTab('all'); setPage(1) }}>
          All {stats ? `(${stats.total})` : ''}
        </button>
        <button className={`${s.tab} ${tab === 'pending' ? s.tabActive : ''}`} onClick={() => { setTab('pending'); setPage(1) }}>
          Pending {stats ? `(${stats.pending})` : ''}
        </button>
        <button className={`${s.tab} ${tab === 'approved' ? s.tabActive : ''}`} onClick={() => { setTab('approved'); setPage(1) }}>
          Approved {stats ? `(${stats.approved})` : ''}
        </button>
      </div>

      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}><IconSearch /></span>
          <input className={s.search} placeholder="Search reviews…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select className={s.select} value={serviceFilter} onChange={e => { setServiceFilter(e.target.value); setPage(1) }}>
          <option value="">All Services</option>
          <option value="tour">Tours</option>
          <option value="accommodation">Accommodations</option>
          <option value="event">Events</option>
          <option value="car_rental">Car Rentals</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Count */}
      <div className={s.countBar}>
        <span className={s.countLabel}>{total} review{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState icon={<IconStarBig />} title="No reviews found" description="Reviews submitted by guests will appear here." />
      ) : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Title</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(review => (
                  <tr key={review.id} className={s.row}>
                    <td>
                      <span className={s.reviewerName}>{review.reviewer_name}</span>
                      <span className={s.reviewerEmail}>{review.reviewer_email}</span>
                    </td>
                    <td><Stars rating={review.rating} /></td>
                    <td>
                      <span className={s.title}>{review.title}</span>
                      <span className={s.commentPreview}>{review.comment?.slice(0, 60)}{review.comment?.length > 60 ? '…' : ''}</span>
                    </td>
                    <td><Badge variant="outline">{SERVICE_LABELS[review.service_type] || review.service_type}</Badge></td>
                    <td>
                      <div className={s.badges}>
                        {review.is_approved ? <Badge variant="success">Approved</Badge> : <Badge variant="warning">Pending</Badge>}
                        {review.is_featured && <Badge variant="gold">Featured</Badge>}
                      </div>
                    </td>
                    <td className={s.muted}>
                      {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className={s.actions}>
                        <button
                          className={`${s.actionBtn} ${review.is_approved ? s.actionBtnActive : ''}`}
                          title={review.is_approved ? 'Unapprove' : 'Approve'}
                          onClick={() => toggleApprove(review)}
                        >
                          <IconCheck />
                        </button>
                        <button
                          className={`${s.actionBtn} ${review.is_featured ? s.actionBtnGold : ''}`}
                          title={review.is_featured ? 'Unfeature' : 'Feature'}
                          onClick={() => toggleFeatured(review)}
                        >
                          <IconStar filled={review.is_featured} />
                        </button>
                        <button className={`${s.actionBtn} ${s.danger}`} title="Delete" onClick={() => setShowDelete(review)}>
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={s.pagination}>
              <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><IconChevLeft /></button>
              <span className={s.pageInfo}>{page} / {totalPages}</span>
              <button className={s.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><IconChevRight /></button>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Review">
        <div className={s.deleteBody}>
          <IconWarning />
          <p>Are you sure you want to delete the review by <strong>{showDelete?.reviewer_name}</strong>? This cannot be undone.</p>
        </div>
        <div className={s.modalActions}>
          <Button variant="ghost" onClick={() => setShowDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
