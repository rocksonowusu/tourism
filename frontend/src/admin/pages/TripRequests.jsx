import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './TripRequests.module.css'
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
const IconCompass = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
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

const ACCOMMODATION_LABELS = {
  BUDGET:   'Budget',
  STANDARD: 'Standard',
  PREMIUM:  'Premium',
  LUXURY:   'Luxury',
}

const TRANSPORT_LABELS = {
  SELF:           'Self-drive',
  SHARED:         'Shared shuttle',
  PRIVATE:        'Private vehicle',
  LUXURY_VEHICLE: 'Luxury vehicle',
}

// ── Component ────────────────────────────────────────────────────────────
export default function TripRequests() {
  const { addToast } = useToast()
  usePageTitle('Trip Requests')

  // ── Tab state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('standard') // 'standard' | 'custom'

  // ── Standard trip requests state ──────────────────────────────────
  const [stdRequests, setStdRequests]     = useState([])
  const [stdTotal, setStdTotal]           = useState(0)
  const [stdLoading, setStdLoading]       = useState(true)
  const [stdNewCount, setStdNewCount]     = useState(0)
  const [stdPage, setStdPage]             = useState(1)
  const [stdSearch, setStdSearch]         = useState('')
  const [stdFilterStatus, setStdFilterStatus] = useState('')
  const [stdFilterTour, setStdFilterTour]     = useState('')
  const [tours, setTours]                 = useState([])

  // ── Custom tour requests state ────────────────────────────────────
  const [cusRequests, setCusRequests]     = useState([])
  const [cusTotal, setCusTotal]           = useState(0)
  const [cusLoading, setCusLoading]       = useState(true)
  const [cusNewCount, setCusNewCount]     = useState(0)
  const [cusPage, setCusPage]             = useState(1)
  const [cusSearch, setCusSearch]         = useState('')
  const [cusFilterStatus, setCusFilterStatus] = useState('')

  // ── Shared modal state ────────────────────────────────────────────
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')
  const [statusVal, setStatusVal] = useState('')

  const PAGE_SIZE = 15

  // ── Load tours for filter ─────────────────────────────────────────
  useEffect(() => {
    api.tours.list({ page_size: 100 })
      .then(d => setTours(d?.results ?? d ?? []))
      .catch(() => {})
  }, [])

  // ── Load standard trip requests ───────────────────────────────────
  const loadStd = useCallback(async () => {
    setStdLoading(true)
    try {
      const params = { page: stdPage, page_size: PAGE_SIZE, ordering: '-created_at' }
      if (stdSearch)       params.search = stdSearch
      if (stdFilterStatus) params.status = stdFilterStatus
      if (stdFilterTour)   params.tour = stdFilterTour
      const data = await api.tripRequests.list(params)
      setStdRequests(data?.results ?? data ?? [])
      setStdTotal(data?.count ?? 0)
    } catch (e) { console.error(e) }
    finally { setStdLoading(false) }
  }, [stdSearch, stdFilterStatus, stdFilterTour, stdPage])

  const loadStdNewCount = useCallback(async () => {
    try { const res = await api.tripRequests.newCount(); setStdNewCount(res?.count ?? 0) }
    catch { /* ignore */ }
  }, [])

  useEffect(() => { loadStd() }, [loadStd])
  useEffect(() => { loadStdNewCount() }, [loadStdNewCount])
  useEffect(() => { setStdPage(1) }, [stdSearch, stdFilterStatus, stdFilterTour])

  const stdTotalPages = Math.ceil(stdTotal / PAGE_SIZE)

  // ── Load custom tour requests ─────────────────────────────────────
  const loadCus = useCallback(async () => {
    setCusLoading(true)
    try {
      const params = { page: cusPage, page_size: PAGE_SIZE, ordering: '-created_at' }
      if (cusSearch)       params.search = cusSearch
      if (cusFilterStatus) params.status = cusFilterStatus
      const data = await api.customTourRequests.list(params)
      setCusRequests(data?.results ?? data ?? [])
      setCusTotal(data?.count ?? 0)
    } catch (e) { console.error(e) }
    finally { setCusLoading(false) }
  }, [cusSearch, cusFilterStatus, cusPage])

  const loadCusNewCount = useCallback(async () => {
    try { const res = await api.customTourRequests.newCount(); setCusNewCount(res?.count ?? 0) }
    catch { /* ignore */ }
  }, [])

  useEffect(() => { loadCus() }, [loadCus])
  useEffect(() => { loadCusNewCount() }, [loadCusNewCount])
  useEffect(() => { setCusPage(1) }, [cusSearch, cusFilterStatus])

  const cusTotalPages = Math.ceil(cusTotal / PAGE_SIZE)

  // ── Standard handlers ─────────────────────────────────────────────
  const openStdView = async (req) => {
    try {
      const detail = await api.tripRequests.detail(req.id)
      setSelected(detail); setStatusVal(detail.status)
    } catch { setSelected(req); setStatusVal(req.status) }
    setFormErr(''); setModal('std-view')
  }
  const openStdDelete = (req) => { setSelected(req); setModal('std-delete') }

  const handleStdStatusUpdate = async () => {
    if (!selected || statusVal === selected.status) return
    setSaving(true); setFormErr('')
    try {
      await api.tripRequests.update(selected.id, { status: statusVal })
      addToast({ message: `Status updated to "${STATUS_LABELS[statusVal]}".`, type: 'success' })
      closeModal(); loadStd(); loadStdNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Update failed.') }
    finally { setSaving(false) }
  }

  const handleStdDelete = async () => {
    setSaving(true)
    try {
      await api.tripRequests.delete(selected.id)
      addToast({ message: 'Trip request deleted.', type: 'success' })
      closeModal(); loadStd(); loadStdNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Delete failed.') }
    finally { setSaving(false) }
  }

  // ── Custom handlers ───────────────────────────────────────────────
  const openCusView = async (req) => {
    try {
      const detail = await api.customTourRequests.detail(req.id)
      setSelected(detail); setStatusVal(detail.status)
    } catch { setSelected(req); setStatusVal(req.status) }
    setFormErr(''); setModal('cus-view')
  }
  const openCusDelete = (req) => { setSelected(req); setModal('cus-delete') }

  const handleCusStatusUpdate = async () => {
    if (!selected || statusVal === selected.status) return
    setSaving(true); setFormErr('')
    try {
      await api.customTourRequests.update(selected.id, { status: statusVal })
      addToast({ message: `Status updated to "${STATUS_LABELS[statusVal]}".`, type: 'success' })
      closeModal(); loadCus(); loadCusNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Update failed.') }
    finally { setSaving(false) }
  }

  const handleCusDelete = async () => {
    setSaving(true)
    try {
      await api.customTourRequests.delete(selected.id)
      addToast({ message: 'Custom tour request deleted.', type: 'success' })
      closeModal(); loadCus(); loadCusNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Delete failed.') }
    finally { setSaving(false) }
  }

  const closeModal = () => { setModal(null); setSelected(null); setFormErr('') }

  // ── Helpers ───────────────────────────────────────────────────────
  const totalTravellers = (req) =>
    (req.number_of_adults ?? 0) + (req.number_of_children ?? 0) + (req.number_of_infants ?? 0)

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className={s.page}>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className={s.tabBar}>
        <button
          className={`${s.tab} ${activeTab === 'standard' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('standard')}
        >
          Trip Requests
          {stdNewCount > 0 && <span className={s.tabBadge}>{stdNewCount}</span>}
        </button>
        <button
          className={`${s.tab} ${activeTab === 'custom' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom Tour Requests
          {cusNewCount > 0 && <span className={s.tabBadge}>{cusNewCount}</span>}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
           STANDARD TRIP REQUESTS TAB
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'standard' && (
        <>
          {/* Toolbar */}
          <div className={s.toolbar}>
            <div className={s.searchWrap}>
              <span className={s.searchIcon}><IconSearch /></span>
              <input
                className={s.search}
                placeholder="Search by name, email, phone…"
                value={stdSearch}
                onChange={e => setStdSearch(e.target.value)}
              />
            </div>
            <div className={s.filters}>
              <select className={s.select} value={stdFilterStatus} onChange={e => setStdFilterStatus(e.target.value)} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select className={s.select} value={stdFilterTour} onChange={e => setStdFilterTour(e.target.value)} aria-label="Filter by tour">
                <option value="">All tours</option>
                {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>

          {/* Count bar */}
          {!stdLoading && (
            <div className={s.countBar}>
              <span className={s.countLabel}>
                {stdTotal} request{stdTotal !== 1 ? 's' : ''}
                {stdSearch || stdFilterStatus || stdFilterTour ? ' matching filters' : ' total'}
              </span>
              {stdNewCount > 0 && <span className={s.newBadge}>{stdNewCount} new</span>}
            </div>
          )}

          {/* Table */}
          <div className={s.tableWrap}>
            {stdLoading ? (
              <Spinner centered size="lg" />
            ) : stdRequests.length === 0 ? (
              <EmptyState
                icon={<IconInbox />}
                title="No trip requests"
                description={stdSearch || stdFilterStatus || stdFilterTour
                  ? 'No requests match your current filters.'
                  : 'No trip requests have been submitted yet.'}
              />
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.colCustomer}>Customer</th>
                    <th className={s.colTour}>Tour</th>
                    <th className={s.colDate}>Preferred Date</th>
                    <th className={s.colTravellers}>Travellers</th>
                    <th className={s.colStatus}>Status</th>
                    <th className={s.colActions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stdRequests.map(req => (
                    <tr key={req.id} className={s.row}>
                      <td className={s.colCustomer}>
                        <span className={s.title}>{req.customer_name}</span>
                        <span className={s.sub}>{req.customer_email}</span>
                      </td>
                      <td className={`${s.colTour} ${s.muted}`}>{req.tour_title ?? '—'}</td>
                      <td className={`${s.colDate} ${s.muted}`}>{fmt(req.preferred_date)}</td>
                      <td className={`${s.colTravellers} ${s.center}`}>{totalTravellers(req)}</td>
                      <td className={s.colStatus}>
                        <Badge variant={STATUS_VARIANTS[req.status] ?? 'default'}>{STATUS_LABELS[req.status] ?? req.status}</Badge>
                      </td>
                      <td className={s.colActions}>
                        <div className={s.actionBtns}>
                          <button className={s.iconBtn} onClick={() => openStdView(req)} title="View details" aria-label="View request details"><IconEye /></button>
                          <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => openStdDelete(req)} title="Delete request" aria-label="Delete request"><IconTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {stdTotalPages > 1 && (
            <div className={s.pagination}>
              <button className={s.pageBtn} onClick={() => setStdPage(p => p - 1)} disabled={stdPage === 1} aria-label="Previous page"><IconChevLeft /></button>
              <span className={s.pageInfo}>Page {stdPage} of {stdTotalPages}</span>
              <button className={s.pageBtn} onClick={() => setStdPage(p => p + 1)} disabled={stdPage === stdTotalPages} aria-label="Next page"><IconChevRight /></button>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════
           CUSTOM TOUR REQUESTS TAB
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'custom' && (
        <>
          {/* Toolbar */}
          <div className={s.toolbar}>
            <div className={s.searchWrap}>
              <span className={s.searchIcon}><IconSearch /></span>
              <input
                className={s.search}
                placeholder="Search by name, email, phone…"
                value={cusSearch}
                onChange={e => setCusSearch(e.target.value)}
              />
            </div>
            <div className={s.filters}>
              <select className={s.select} value={cusFilterStatus} onChange={e => setCusFilterStatus(e.target.value)} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Count bar */}
          {!cusLoading && (
            <div className={s.countBar}>
              <span className={s.countLabel}>
                {cusTotal} request{cusTotal !== 1 ? 's' : ''}
                {cusSearch || cusFilterStatus ? ' matching filters' : ' total'}
              </span>
              {cusNewCount > 0 && <span className={s.newBadge}>{cusNewCount} new</span>}
            </div>
          )}

          {/* Table */}
          <div className={s.tableWrap}>
            {cusLoading ? (
              <Spinner centered size="lg" />
            ) : cusRequests.length === 0 ? (
              <EmptyState
                icon={<IconCompass />}
                title="No custom tour requests"
                description={cusSearch || cusFilterStatus
                  ? 'No requests match your current filters.'
                  : 'No custom tour requests have been submitted yet.'}
              />
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.colCustomer}>Customer</th>
                    <th className={s.colSites}>Sites</th>
                    <th className={s.colPackages}>Packages</th>
                    <th className={s.colDate}>Preferred Date</th>
                    <th className={s.colDuration}>Duration</th>
                    <th className={s.colTravellers}>Travellers</th>
                    <th className={s.colStatus}>Status</th>
                    <th className={s.colActions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cusRequests.map(req => (
                    <tr key={req.id} className={s.row}>
                      <td className={s.colCustomer}>
                        <span className={s.title}>{req.customer_name}</span>
                        <span className={s.sub}>{req.customer_email}</span>
                      </td>
                      <td className={s.colSites}>
                        <span className={s.sitePills}>
                          {(req.site_names ?? []).slice(0, 2).map((name, i) => (
                            <span key={i} className={s.pill}>{name}</span>
                          ))}
                          {(req.site_names ?? []).length > 2 && (
                            <span className={s.pillMore}>+{req.site_names.length - 2}</span>
                          )}
                        </span>
                      </td>
                      <td className={s.colPackages}>
                        <span className={s.pkgPills}>
                          {(req.packages ?? []).slice(0, 2).map((p, i) => (
                            <span key={i} className={s.pkgPill}>{p}</span>
                          ))}
                          {(req.packages ?? []).length > 2 && (
                            <span className={s.pillMore}>+{req.packages.length - 2}</span>
                          )}
                        </span>
                      </td>
                      <td className={`${s.colDate} ${s.muted}`}>{fmt(req.preferred_start_date)}</td>
                      <td className={`${s.colDuration} ${s.center}`}>{req.duration_days ?? '—'}d</td>
                      <td className={`${s.colTravellers} ${s.center}`}>{totalTravellers(req)}</td>
                      <td className={s.colStatus}>
                        <Badge variant={STATUS_VARIANTS[req.status] ?? 'default'}>{STATUS_LABELS[req.status] ?? req.status}</Badge>
                      </td>
                      <td className={s.colActions}>
                        <div className={s.actionBtns}>
                          <button className={s.iconBtn} onClick={() => openCusView(req)} title="View details" aria-label="View request details"><IconEye /></button>
                          <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => openCusDelete(req)} title="Delete request" aria-label="Delete request"><IconTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {cusTotalPages > 1 && (
            <div className={s.pagination}>
              <button className={s.pageBtn} onClick={() => setCusPage(p => p - 1)} disabled={cusPage === 1} aria-label="Previous page"><IconChevLeft /></button>
              <span className={s.pageInfo}>Page {cusPage} of {cusTotalPages}</span>
              <button className={s.pageBtn} onClick={() => setCusPage(p => p + 1)} disabled={cusPage === cusTotalPages} aria-label="Next page"><IconChevRight /></button>
            </div>
          )}
        </>
      )}

      {/* ── Standard Trip View / Edit Status modal ───────────────────── */}
      <Modal
        open={modal === 'std-view'}
        title="Trip Request Details"
        onClose={closeModal}
        width={600}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>Close</Button>
              {statusVal !== selected?.status && (
                <Button variant="primary" size="sm" onClick={handleStdStatusUpdate} loading={saving}>Update Status</Button>
              )}
            </div>
          </div>
        }
      >
        {selected && (
          <div className={s.detailGrid}>
            <div className={s.detailTypeRow}>
              <span className={`${s.typeBadge} ${s.typeBadgeStd}`}>Standard Trip</span>
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

            {/* Trip Details */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Trip Details</div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Tour</span><span className={s.detailValue}>{selected.tour_title ?? '—'}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Preferred Date</span><span className={s.detailValue}>{fmt(selected.preferred_date)}</span></div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Adults</span><span className={s.detailValue}>{selected.number_of_adults ?? 0}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Children</span><span className={s.detailValue}>{selected.number_of_children ?? 0}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Infants</span><span className={s.detailValue}>{selected.number_of_infants ?? 0}</span></div>
              </div>
            </div>

            {/* Special Requests */}
            {selected.special_requests && (
              <div className={s.detailSection}>
                <div className={s.detailSectionTitle}>Special Requests</div>
                <div className={s.detailNotes}>{selected.special_requests}</div>
              </div>
            )}

            {/* Status */}
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

      {/* ── Standard Trip Delete modal ───────────────────────────────── */}
      <Modal
        open={modal === 'std-delete'}
        title="Delete Trip Request"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost"  size="sm" onClick={closeModal}     disabled={saving}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleStdDelete} loading={saving}>Delete</Button>
            </div>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>Delete trip request from <strong>{selected?.customer_name}</strong>?</p>
            <p className={s.deleteHint}>This will permanently remove this trip request. This cannot be undone.</p>
          </div>
        </div>
      </Modal>

      {/* ── Custom Tour View / Edit Status modal ─────────────────────── */}
      <Modal
        open={modal === 'cus-view'}
        title="Custom Tour Request Details"
        onClose={closeModal}
        width={600}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>Close</Button>
              {statusVal !== selected?.status && (
                <Button variant="primary" size="sm" onClick={handleCusStatusUpdate} loading={saving}>Update Status</Button>
              )}
            </div>
          </div>
        }
      >
        {selected && (
          <div className={s.detailGrid}>
            <div className={s.detailTypeRow}>
              <span className={`${s.typeBadge} ${s.typeBadgeCustom}`}>Custom Trip</span>
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

            {/* Selected Sites */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Selected Sites</div>
              <div className={s.detailPills}>
                {(selected.site_names ?? []).map((name, i) => (
                  <span key={i} className={s.detailPill}>{name}</span>
                ))}
                {(selected.site_names ?? []).length === 0 && <span className={s.detailValue}>—</span>}
              </div>
            </div>

            {/* Preferences */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Preferences</div>
              <div className={s.detailRow}>
                <div className={s.detailField}>
                  <span className={s.detailLabel}>Packages</span>
                  <div className={s.detailPkgPills}>
                    {(selected.packages ?? []).map((p, i) => (
                      <span key={i} className={s.detailPkgPill}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}>
                  <span className={s.detailLabel}>Accommodation</span>
                  <span className={s.detailValue}>{ACCOMMODATION_LABELS[selected.accommodation] ?? selected.accommodation ?? '—'}</span>
                </div>
                <div className={s.detailField}>
                  <span className={s.detailLabel}>Transport</span>
                  <span className={s.detailValue}>{TRANSPORT_LABELS[selected.transport] ?? selected.transport ?? '—'}</span>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Trip Details</div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Preferred Date</span><span className={s.detailValue}>{fmt(selected.preferred_start_date)}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Duration</span><span className={s.detailValue}>{selected.duration_days ?? '—'} day{(selected.duration_days ?? 0) !== 1 ? 's' : ''}</span></div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Adults</span><span className={s.detailValue}>{selected.number_of_adults ?? 0}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Children</span><span className={s.detailValue}>{selected.number_of_children ?? 0}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Infants</span><span className={s.detailValue}>{selected.number_of_infants ?? 0}</span></div>
              </div>
            </div>

            {/* Special Requests */}
            {selected.special_requests && (
              <div className={s.detailSection}>
                <div className={s.detailSectionTitle}>Special Requests</div>
                <div className={s.detailNotes}>{selected.special_requests}</div>
              </div>
            )}

            {/* Status */}
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

      {/* ── Custom Tour Delete modal ─────────────────────────────────── */}
      <Modal
        open={modal === 'cus-delete'}
        title="Delete Custom Tour Request"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost"  size="sm" onClick={closeModal}     disabled={saving}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleCusDelete} loading={saving}>Delete</Button>
            </div>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>Delete custom tour request from <strong>{selected?.customer_name}</strong>?</p>
            <p className={s.deleteHint}>This will permanently remove this request. This cannot be undone.</p>
          </div>
        </div>
      </Modal>

    </div>
  )
}
