import React, { useEffect, useState, useCallback, useMemo } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './EventRequests.module.css'
import { usePageTitle } from '../hooks/usePageTitle'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
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
const IconInbox = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)

// ── Helpers ──────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const STATUS_VARIANTS = {
  new:       'info',
  contacted: 'gold',
  confirmed: 'success',
  cancelled: 'default',
}

const STATUS_LABELS = {
  new:       'New',
  contacted: 'Contacted',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
}

const TYPE_LABELS = {
  corporate:    'Corporate',
  family:       'Family & Friends',
  retreat:      'Retreat',
  recreational: 'Recreational',
  custom:       'Custom',
}

const TYPE_COLORS = {
  corporate:    { bg: '#FEF9E6', fg: '#C5A028', border: 'rgba(197,160,40,0.18)' },
  family:       { bg: '#EDE9FE', fg: '#6D28D9', border: 'rgba(109,40,217,0.15)' },
  retreat:      { bg: '#EDFCF0', fg: '#1A6B2C', border: '#D0F0D6' },
  recreational: { bg: '#E0F2FE', fg: '#0369A1', border: 'rgba(3,105,161,0.15)' },
  custom:       { bg: '#FEF2F2', fg: '#B91C1C', border: 'rgba(185,28,28,0.15)' },
}

// Booking-specific status helpers
const BOOKING_STATUS_VARIANTS = {
  new:       'info',
  confirmed: 'success',
  cancelled: 'default',
}
const BOOKING_STATUS_LABELS = {
  new:       'New',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
}

// ── Component ────────────────────────────────────────────────────────────
export default function EventRequests() {
  const { addToast } = useToast()
  usePageTitle('Event Requests')

  // ── Tab state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('requests') // 'requests' | 'bookings'

  // ── Requests state ────────────────────────────────────────────────
  const [requests, setRequests]       = useState([])
  const [reqTotal, setReqTotal]       = useState(0)
  const [reqLoading, setReqLoading]   = useState(true)
  const [reqNewCount, setReqNewCount] = useState(0)
  const [reqPage, setReqPage]         = useState(1)
  const [reqSearch, setReqSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType]     = useState('')

  // ── Bookings state ────────────────────────────────────────────────
  const [bookings, setBookings]         = useState([])
  const [bkTotal, setBkTotal]           = useState(0)
  const [bkLoading, setBkLoading]       = useState(true)
  const [bkNewCount, setBkNewCount]     = useState(0)
  const [bkPage, setBkPage]             = useState(1)
  const [bkSearch, setBkSearch]         = useState('')
  const [bkFilterStatus, setBkFilterStatus] = useState('')

  // ── Shared modal state ────────────────────────────────────────────
  const [modal, setModal]       = useState(null) // null | 'view' | 'delete' | 'bk-view' | 'bk-delete'
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')
  const [statusVal, setStatusVal] = useState('')

  const PAGE_SIZE = 15

  // ── Load requests ─────────────────────────────────────────────────
  const loadRequests = useCallback(async () => {
    setReqLoading(true)
    try {
      const params = { page: reqPage, page_size: PAGE_SIZE, ordering: '-created_at' }
      if (reqSearch)    params.search = reqSearch
      if (filterStatus) params.status = filterStatus
      if (filterType)   params.event_type = filterType
      const data = await api.eventRequests.list(params)
      setRequests(data?.results ?? data ?? [])
      setReqTotal(data?.count ?? 0)
    } catch (e) { console.error(e) }
    finally { setReqLoading(false) }
  }, [reqSearch, filterStatus, filterType, reqPage])

  const loadReqNewCount = useCallback(async () => {
    try { const res = await api.eventRequests.newCount(); setReqNewCount(res?.count ?? 0) }
    catch { /* ignore */ }
  }, [])

  useEffect(() => { loadRequests() }, [loadRequests])
  useEffect(() => { loadReqNewCount() }, [loadReqNewCount])
  useEffect(() => { setReqPage(1) }, [reqSearch, filterStatus, filterType])

  const reqTotalPages = Math.ceil(reqTotal / PAGE_SIZE)

  // ── Load bookings ────────────────────────────────────────────────
  const loadBookings = useCallback(async () => {
    setBkLoading(true)
    try {
      const params = { page: bkPage, page_size: PAGE_SIZE, ordering: '-created_at' }
      if (bkSearch)       params.search = bkSearch
      if (bkFilterStatus) params.status = bkFilterStatus
      const data = await api.eventBookings.list(params)
      setBookings(data?.results ?? data ?? [])
      setBkTotal(data?.count ?? 0)
    } catch (e) { console.error(e) }
    finally { setBkLoading(false) }
  }, [bkSearch, bkFilterStatus, bkPage])

  const loadBkNewCount = useCallback(async () => {
    try { const res = await api.eventBookings.newCount(); setBkNewCount(res?.count ?? 0) }
    catch { /* ignore */ }
  }, [])

  useEffect(() => { loadBookings() }, [loadBookings])
  useEffect(() => { loadBkNewCount() }, [loadBkNewCount])
  useEffect(() => { setBkPage(1) }, [bkSearch, bkFilterStatus])

  const bkTotalPages = Math.ceil(bkTotal / PAGE_SIZE)

  // ── Request handlers ──────────────────────────────────────────────
  const openView = async (req) => {
    try {
      const detail = await api.eventRequests.detail(req.id)
      setSelected(detail); setStatusVal(detail.status)
    } catch { setSelected(req); setStatusVal(req.status) }
    setFormErr(''); setModal('view')
  }
  const openDelete = (req) => { setSelected(req); setModal('delete') }

  const handleStatusUpdate = async () => {
    if (!selected || statusVal === selected.status) return
    setSaving(true); setFormErr('')
    try {
      await api.eventRequests.update(selected.id, { status: statusVal })
      addToast({ message: `Status updated to "${STATUS_LABELS[statusVal]}".`, type: 'success' })
      closeModal(); loadRequests(); loadReqNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Update failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await api.eventRequests.delete(selected.id)
      addToast({ message: 'Event request deleted.', type: 'success' })
      closeModal(); loadRequests(); loadReqNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Delete failed.') }
    finally { setSaving(false) }
  }

  // ── Booking handlers ─────────────────────────────────────────────
  const openBkView = async (bk) => {
    try {
      const detail = await api.eventBookings.detail(bk.id)
      setSelected(detail); setStatusVal(detail.status)
    } catch { setSelected(bk); setStatusVal(bk.status) }
    setFormErr(''); setModal('bk-view')
  }
  const openBkDelete = (bk) => { setSelected(bk); setModal('bk-delete') }

  const handleBkStatusUpdate = async () => {
    if (!selected || statusVal === selected.status) return
    setSaving(true); setFormErr('')
    try {
      await api.eventBookings.update(selected.id, { status: statusVal })
      addToast({ message: `Booking status updated to "${BOOKING_STATUS_LABELS[statusVal]}".`, type: 'success' })
      closeModal(); loadBookings(); loadBkNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Update failed.') }
    finally { setSaving(false) }
  }

  const handleBkDelete = async () => {
    setSaving(true)
    try {
      await api.eventBookings.delete(selected.id)
      addToast({ message: 'Event booking deleted.', type: 'success' })
      closeModal(); loadBookings(); loadBkNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Delete failed.') }
    finally { setSaving(false) }
  }

  const closeModal = () => { setModal(null); setSelected(null); setFormErr('') }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className={s.page}>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className={s.tabBar}>
        <button
          className={`${s.tab} ${activeTab === 'requests' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Event Requests
          {reqNewCount > 0 && <span className={s.tabBadge}>{reqNewCount}</span>}
        </button>
        <button
          className={`${s.tab} ${activeTab === 'bookings' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Event Bookings
          {bkNewCount > 0 && <span className={s.tabBadge}>{bkNewCount}</span>}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
           REQUESTS TAB
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'requests' && (
        <>
          {/* Toolbar */}
          <div className={s.toolbar}>
            <div className={s.searchWrap}>
              <span className={s.searchIcon}><IconSearch /></span>
              <input
                className={s.search}
                placeholder="Search by name, email, phone…"
                value={reqSearch}
                onChange={e => setReqSearch(e.target.value)}
              />
            </div>
            <div className={s.filters}>
              <select className={s.select} value={filterType} onChange={e => setFilterType(e.target.value)} aria-label="Filter by event type">
                <option value="">All types</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select className={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Count bar */}
          {!reqLoading && (
            <div className={s.countBar}>
              <span className={s.countLabel}>
                {reqTotal} request{reqTotal !== 1 ? 's' : ''}
                {reqSearch || filterStatus || filterType ? ' matching filters' : ' total'}
              </span>
              {reqNewCount > 0 && <span className={s.newBadge}>{reqNewCount} new</span>}
            </div>
          )}

          {/* Table */}
          <div className={s.tableWrap}>
            {reqLoading ? (
              <Spinner centered size="lg" />
            ) : requests.length === 0 ? (
              <EmptyState
                icon={<IconInbox />}
                title="No event requests"
                description={reqSearch || filterStatus || filterType
                  ? 'No requests match your current filters.'
                  : 'No event requests have been submitted yet.'}
              />
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.colCustomer}>Customer</th>
                    <th className={s.colType}>Event Type</th>
                    <th className={s.colDate}>Preferred Date</th>
                    <th className={s.colAttendees}>Attendees</th>
                    <th className={s.colLocation}>Location</th>
                    <th className={s.colStatus}>Status</th>
                    <th className={s.colActions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => {
                    const tc = TYPE_COLORS[req.event_type] ?? TYPE_COLORS.custom
                    return (
                      <tr key={req.id} className={s.row}>
                        <td className={s.colCustomer}>
                          <span className={s.title}>{req.customer_name}</span>
                          <span className={s.sub}>{req.customer_email}</span>
                        </td>
                        <td className={s.colType}>
                          <span className={s.typeBadge} style={{ background: tc.bg, color: tc.fg, borderColor: tc.border }}>
                            {TYPE_LABELS[req.event_type] ?? req.event_type}
                          </span>
                        </td>
                        <td className={`${s.colDate} ${s.muted}`}>{fmt(req.preferred_date)}</td>
                        <td className={`${s.colAttendees} ${s.center}`}>{req.expected_attendees ?? '—'}</td>
                        <td className={`${s.colLocation} ${s.muted}`}>{req.location_preference || '—'}</td>
                        <td className={s.colStatus}>
                          <Badge variant={STATUS_VARIANTS[req.status] ?? 'default'}>{STATUS_LABELS[req.status] ?? req.status}</Badge>
                        </td>
                        <td className={s.colActions}>
                          <div className={s.actionBtns}>
                            <button className={s.iconBtn} onClick={() => openView(req)} title="View details" aria-label="View request details"><IconEye /></button>
                            <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => openDelete(req)} title="Delete request" aria-label="Delete request"><IconTrash /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {reqTotalPages > 1 && (
            <div className={s.pagination}>
              <button className={s.pageBtn} onClick={() => setReqPage(p => p - 1)} disabled={reqPage === 1} aria-label="Previous page"><IconChevLeft /></button>
              <span className={s.pageInfo}>Page {reqPage} of {reqTotalPages}</span>
              <button className={s.pageBtn} onClick={() => setReqPage(p => p + 1)} disabled={reqPage === reqTotalPages} aria-label="Next page"><IconChevRight /></button>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════
           BOOKINGS TAB
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'bookings' && (
        <>
          {/* Toolbar */}
          <div className={s.toolbar}>
            <div className={s.searchWrap}>
              <span className={s.searchIcon}><IconSearch /></span>
              <input
                className={s.search}
                placeholder="Search by name, email, phone…"
                value={bkSearch}
                onChange={e => setBkSearch(e.target.value)}
              />
            </div>
            <div className={s.filters}>
              <select className={s.select} value={bkFilterStatus} onChange={e => setBkFilterStatus(e.target.value)} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Count bar */}
          {!bkLoading && (
            <div className={s.countBar}>
              <span className={s.countLabel}>
                {bkTotal} booking{bkTotal !== 1 ? 's' : ''}
                {bkSearch || bkFilterStatus ? ' matching filters' : ' total'}
              </span>
              {bkNewCount > 0 && <span className={s.newBadge}>{bkNewCount} new</span>}
            </div>
          )}

          {/* Table */}
          <div className={s.tableWrap}>
            {bkLoading ? (
              <Spinner centered size="lg" />
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={<IconInbox />}
                title="No event bookings"
                description={bkSearch || bkFilterStatus
                  ? 'No bookings match your current filters.'
                  : 'No event bookings have been submitted yet.'}
              />
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.colCustomer}>Customer</th>
                    <th className={s.colEvent}>Event</th>
                    <th className={s.colGuests}>Guests</th>
                    <th className={s.colDate}>Submitted</th>
                    <th className={s.colStatus}>Status</th>
                    <th className={s.colActions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(bk => (
                    <tr key={bk.id} className={s.row}>
                      <td className={s.colCustomer}>
                        <span className={s.title}>{bk.customer_name}</span>
                        <span className={s.sub}>{bk.customer_email}</span>
                      </td>
                      <td className={s.colEvent}>
                        <span className={s.title}>{bk.event_title || '—'}</span>
                      </td>
                      <td className={`${s.colGuests} ${s.center}`}>{bk.number_of_guests ?? '—'}</td>
                      <td className={`${s.colDate} ${s.muted}`}>{fmt(bk.created_at)}</td>
                      <td className={s.colStatus}>
                        <Badge variant={BOOKING_STATUS_VARIANTS[bk.status] ?? 'default'}>
                          {BOOKING_STATUS_LABELS[bk.status] ?? bk.status}
                        </Badge>
                      </td>
                      <td className={s.colActions}>
                        <div className={s.actionBtns}>
                          <button className={s.iconBtn} onClick={() => openBkView(bk)} title="View details" aria-label="View booking details"><IconEye /></button>
                          <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => openBkDelete(bk)} title="Delete booking" aria-label="Delete booking"><IconTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {bkTotalPages > 1 && (
            <div className={s.pagination}>
              <button className={s.pageBtn} onClick={() => setBkPage(p => p - 1)} disabled={bkPage === 1} aria-label="Previous page"><IconChevLeft /></button>
              <span className={s.pageInfo}>Page {bkPage} of {bkTotalPages}</span>
              <button className={s.pageBtn} onClick={() => setBkPage(p => p + 1)} disabled={bkPage === bkTotalPages} aria-label="Next page"><IconChevRight /></button>
            </div>
          )}
        </>
      )}

      {/* ── Request View / Edit Status modal ─────────────────────────── */}
      <Modal
        open={modal === 'view'}
        title="Event Request Details"
        onClose={closeModal}
        width={600}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>Close</Button>
              {statusVal !== selected?.status && (
                <Button variant="primary" size="sm" onClick={handleStatusUpdate} loading={saving}>Update Status</Button>
              )}
            </div>
          </div>
        }
      >
        {selected && (
          <div className={s.detailGrid}>
            {/* Event Type */}
            <div className={s.detailTypeRow}>
              <span
                className={s.typeBadge}
                style={{
                  background: (TYPE_COLORS[selected.event_type] ?? TYPE_COLORS.custom).bg,
                  color: (TYPE_COLORS[selected.event_type] ?? TYPE_COLORS.custom).fg,
                  borderColor: (TYPE_COLORS[selected.event_type] ?? TYPE_COLORS.custom).border,
                }}
              >
                {TYPE_LABELS[selected.event_type] ?? selected.event_type} Event
              </span>
            </div>

            {/* Customer Info */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Customer Information</div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Name</span><span className={s.detailValue}>{selected.customer_name}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Email</span><span className={s.detailValue}>{selected.customer_email}</span></div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Phone</span><span className={s.detailValue}>{selected.customer_phone || '—'}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Submitted</span><span className={s.detailValue}>{fmt(selected.created_at)}</span></div>
              </div>
            </div>

            {/* Event Details */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Event Details</div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Preferred Date</span><span className={s.detailValue}>{fmt(selected.preferred_date)}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Expected Attendees</span><span className={s.detailValue}>{selected.expected_attendees ?? '—'}</span></div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Location</span><span className={s.detailValue}>{selected.location_preference || '—'}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Budget Range</span><span className={s.detailValue}>{selected.budget_range || '—'}</span></div>
              </div>
            </div>

            {/* Activities */}
            {selected.activities_interested_in && selected.activities_interested_in.length > 0 && (
              <div className={s.detailSection}>
                <div className={s.detailSectionTitle}>Activities Interested In</div>
                <div className={s.detailPills}>
                  {selected.activities_interested_in.map((act, i) => <span key={i} className={s.detailPill}>{act}</span>)}
                </div>
              </div>
            )}

            {/* Special Requirements */}
            {selected.special_requirements && (
              <div className={s.detailSection}>
                <div className={s.detailSectionTitle}>Special Requirements</div>
                <div className={s.detailNotes}>{selected.special_requirements}</div>
              </div>
            )}

            {/* Status Update */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Status</div>
              <select className={s.statusSelect} value={statusVal} onChange={e => setStatusVal(e.target.value)}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Request Delete modal ─────────────────────────────────────── */}
      <Modal
        open={modal === 'delete'}
        title="Delete Event Request"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost"  size="sm" onClick={closeModal}   disabled={saving}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>Delete</Button>
            </div>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>Delete event request from <strong>{selected?.customer_name}</strong>?</p>
            <p className={s.deleteHint}>This will permanently remove this event request. This cannot be undone.</p>
          </div>
        </div>
      </Modal>

      {/* ── Booking View / Edit Status modal ─────────────────────────── */}
      <Modal
        open={modal === 'bk-view'}
        title="Event Booking Details"
        onClose={closeModal}
        width={600}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>Close</Button>
              {statusVal !== selected?.status && (
                <Button variant="primary" size="sm" onClick={handleBkStatusUpdate} loading={saving}>Update Status</Button>
              )}
            </div>
          </div>
        }
      >
        {selected && (
          <div className={s.detailGrid}>
            {/* Customer Info */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Customer Information</div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Name</span><span className={s.detailValue}>{selected.customer_name}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Email</span><span className={s.detailValue}>{selected.customer_email}</span></div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Phone</span><span className={s.detailValue}>{selected.customer_phone || '—'}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Submitted</span><span className={s.detailValue}>{fmt(selected.created_at)}</span></div>
              </div>
            </div>

            {/* Event & Booking Details */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Booking Details</div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Event</span><span className={s.detailValue}>{selected.event_title || '—'}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Number of Guests</span><span className={s.detailValue}>{selected.number_of_guests ?? '—'}</span></div>
              </div>
            </div>

            {/* Special Requests */}
            {selected.special_requests && (
              <div className={s.detailSection}>
                <div className={s.detailSectionTitle}>Special Requests</div>
                <div className={s.detailNotes}>{selected.special_requests}</div>
              </div>
            )}

            {/* Status Update */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Status</div>
              <select className={s.statusSelect} value={statusVal} onChange={e => setStatusVal(e.target.value)}>
                <option value="new">New</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Booking Delete modal ─────────────────────────────────────── */}
      <Modal
        open={modal === 'bk-delete'}
        title="Delete Event Booking"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost"  size="sm" onClick={closeModal}     disabled={saving}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleBkDelete} loading={saving}>Delete</Button>
            </div>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>Delete booking from <strong>{selected?.customer_name}</strong>?</p>
            <p className={s.deleteHint}>This will permanently remove this event booking. This cannot be undone.</p>
          </div>
        </div>
      </Modal>

    </div>
  )
}
