import React, { useEffect, useState, useCallback, useMemo } from 'react'
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

  // standard trip requests
  const [stdRequests,    setStdRequests]    = useState([])
  const [stdTotal,       setStdTotal]       = useState(0)
  // custom tour requests
  const [customRequests, setCustomRequests] = useState([])
  const [customTotal,    setCustomTotal]    = useState(0)

  const [tours,    setTours]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [newCount, setNewCount] = useState(0)
  const [page,     setPage]     = useState(1)
  const PAGE_SIZE = 15

  // filters
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterTour,   setFilterTour]   = useState('')
  const [filterType,   setFilterType]   = useState('')   // '' | 'standard' | 'custom'

  // modal state
  const [modal,    setModal]    = useState(null)  // null | 'view' | 'delete'
  const [selected, setSelected] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [formErr,  setFormErr]  = useState('')
  const [statusVal, setStatusVal] = useState('')

  // ── Data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page_size: 200, ordering: '-created_at' }
      if (search)       params.search = search
      if (filterStatus) params.status = filterStatus

      // Fetch both in parallel
      const stdParams = { ...params }
      if (filterTour) stdParams.tour = filterTour
      const customParams = { ...params }

      const [stdData, customData] = await Promise.all([
        filterType !== 'custom' ? api.tripRequests.list(stdParams) : Promise.resolve({ results: [], count: 0 }),
        filterType !== 'standard' ? api.customTourRequests.list(customParams) : Promise.resolve({ results: [], count: 0 }),
      ])

      const stdArr = (stdData?.results ?? stdData ?? []).map(r => ({ ...r, _type: 'standard' }))
      const cusArr = (customData?.results ?? customData ?? []).map(r => ({ ...r, _type: 'custom' }))

      setStdRequests(stdArr)
      setStdTotal(stdData?.count ?? stdArr.length)
      setCustomRequests(cusArr)
      setCustomTotal(customData?.count ?? cusArr.length)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, filterTour, filterType])

  // Merge & sort & paginate client-side
  const merged = useMemo(() => {
    const all = [...stdRequests, ...customRequests]
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return all
  }, [stdRequests, customRequests])

  const total = merged.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return merged.slice(start, start + PAGE_SIZE)
  }, [merged, page])

  const loadNewCount = useCallback(async () => {
    try {
      const [stdC, cusC] = await Promise.all([
        api.tripRequests.newCount(),
        api.customTourRequests.newCount(),
      ])
      setNewCount((stdC?.count ?? 0) + (cusC?.count ?? 0))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadNewCount() }, [loadNewCount])
  useEffect(() => { setPage(1) }, [search, filterStatus, filterTour, filterType])

  // Load tours for filter dropdown
  useEffect(() => {
    api.tours.list({ page_size: 100 })
      .then(d => setTours(d?.results ?? d ?? []))
      .catch(() => {})
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────
  const getApi = (req) => req?._type === 'custom' ? api.customTourRequests : api.tripRequests

  const openView = async (req) => {
    try {
      const detail = await getApi(req).detail(req.id)
      setSelected({ ...detail, _type: req._type })
      setStatusVal(detail.status)
    } catch {
      setSelected(req)
      setStatusVal(req.status)
    }
    setFormErr('')
    setModal('view')
  }

  const openDelete = (req) => { setSelected(req); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null); setFormErr('') }

  const handleStatusUpdate = async () => {
    if (!selected || statusVal === selected.status) return
    setSaving(true); setFormErr('')
    try {
      await getApi(selected).update(selected.id, { status: statusVal })
      addToast({ message: `Status updated to "${STATUS_LABELS[statusVal]}".`, type: 'success' })
      closeModal()
      load()
      loadNewCount()
    } catch (e) {
      setFormErr(e?.data?.detail ?? e?.message ?? 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await getApi(selected).delete(selected.id)
      addToast({ message: 'Trip request deleted.', type: 'success' })
      closeModal(); load(); loadNewCount()
    } catch (e) {
      setFormErr(e?.data?.detail ?? e?.message ?? 'Delete failed.')
    } finally {
      setSaving(false)
    }
  }

  const totalTravellers = (req) => {
    return (req.number_of_adults ?? 0) + (req.number_of_children ?? 0) + (req.number_of_infants ?? 0)
  }

  const getTourOrSites = (req) => {
    if (req._type === 'custom') {
      const names = req.site_names ?? []
      if (names.length === 0) return '—'
      if (names.length <= 2) return names.join(', ')
      return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
    }
    return req.tour_title ?? req.tour?.title ?? '—'
  }

  const getPreferredDate = (req) => {
    return req._type === 'custom' ? fmt(req.preferred_start_date) : fmt(req.preferred_date)
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={s.page}>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}><IconSearch /></span>
          <input
            className={s.search}
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={s.filters}>
          <select
            className={s.select}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            <option value="standard">Standard Trip</option>
            <option value="custom">Custom Trip</option>
          </select>
          <select
            className={s.select}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {filterType !== 'custom' && (
            <select
              className={s.select}
              value={filterTour}
              onChange={e => setFilterTour(e.target.value)}
              aria-label="Filter by tour"
            >
              <option value="">All tours</option>
              {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* ── Count bar ───────────────────────────────────────────────── */}
      {!loading && (
        <div className={s.countBar}>
          <span className={s.countLabel}>
            {total} request{total !== 1 ? 's' : ''}
            {search || filterStatus || filterTour || filterType ? ' matching filters' : ' total'}
          </span>
          {newCount > 0 && (
            <span className={s.newBadge}>
              {newCount} new
            </span>
          )}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className={s.tableWrap}>
        {loading ? (
          <Spinner centered size="lg" />
        ) : paged.length === 0 ? (
          <EmptyState
            icon={<IconInbox />}
            title="No trip requests"
            description={search || filterStatus || filterTour || filterType
              ? 'No requests match your current filters.'
              : 'No trip requests have been submitted yet.'}
          />
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.colCustomer}>Customer</th>
                <th className={s.colType}>Type</th>
                <th className={s.colTour}>Tour / Sites</th>
                <th className={s.colDate}>Preferred Date</th>
                <th className={s.colTravellers}>Travellers</th>
                <th className={s.colStatus}>Status</th>
                <th className={s.colActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(req => (
                <tr key={`${req._type}-${req.id}`} className={s.row}>
                  <td className={s.colCustomer}>
                    <span className={s.title}>{req.customer_name}</span>
                    <span className={s.sub}>{req.customer_email}</span>
                  </td>
                  <td className={s.colType}>
                    <span className={`${s.typeBadge} ${req._type === 'custom' ? s.typeBadgeCustom : s.typeBadgeStd}`}>
                      {req._type === 'custom' ? 'Custom' : 'Standard'}
                    </span>
                  </td>
                  <td className={`${s.colTour} ${s.muted}`}>
                    {getTourOrSites(req)}
                  </td>
                  <td className={`${s.colDate} ${s.muted}`}>
                    {getPreferredDate(req)}
                  </td>
                  <td className={`${s.colTravellers} ${s.center}`}>
                    {totalTravellers(req)}
                  </td>
                  <td className={s.colStatus}>
                    <Badge variant={STATUS_VARIANTS[req.status] ?? 'default'}>
                      {STATUS_LABELS[req.status] ?? req.status}
                    </Badge>
                  </td>
                  <td className={s.colActions}>
                    <div className={s.actionBtns}>
                      <button
                        className={s.iconBtn}
                        onClick={() => openView(req)}
                        title="View details"
                        aria-label="View request details"
                      >
                        <IconEye />
                      </button>
                      <button
                        className={`${s.iconBtn} ${s.iconBtnDanger}`}
                        onClick={() => openDelete(req)}
                        title="Delete request"
                        aria-label="Delete request"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className={s.pagination}>
          <button
            className={s.pageBtn}
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <IconChevLeft />
          </button>
          <span className={s.pageInfo}>Page {page} of {totalPages}</span>
          <button
            className={s.pageBtn}
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <IconChevRight />
          </button>
        </div>
      )}

      {/* ── View / Edit Status modal ─────────────────────────────────── */}
      <Modal
        open={modal === 'view'}
        title={selected?._type === 'custom' ? 'Custom Trip Request Details' : 'Trip Request Details'}
        onClose={closeModal}
        width={600}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>
                Close
              </Button>
              {statusVal !== selected?.status && (
                <Button variant="primary" size="sm" onClick={handleStatusUpdate} loading={saving}>
                  Update Status
                </Button>
              )}
            </div>
          </div>
        }
      >
        {selected && (
          <div className={s.detailGrid}>
            {/* Type badge */}
            <div className={s.detailTypeRow}>
              <span className={`${s.typeBadge} ${selected._type === 'custom' ? s.typeBadgeCustom : s.typeBadgeStd}`}>
                {selected._type === 'custom' ? 'Custom Trip' : 'Standard Trip'}
              </span>
            </div>

            {/* Customer Info */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Customer Information</div>
              <div className={s.detailRow}>
                <div className={s.detailField}>
                  <span className={s.detailLabel}>Name</span>
                  <span className={s.detailValue}>{selected.customer_name}</span>
                </div>
                <div className={s.detailField}>
                  <span className={s.detailLabel}>Email</span>
                  <span className={s.detailValue}>{selected.customer_email}</span>
                </div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}>
                  <span className={s.detailLabel}>Phone</span>
                  <span className={s.detailValue}>{selected.customer_phone || '—'}</span>
                </div>
                <div className={s.detailField}>
                  <span className={s.detailLabel}>Submitted</span>
                  <span className={s.detailValue}>{fmt(selected.created_at)}</span>
                </div>
              </div>
            </div>

            {/* ── Standard Trip Details ─── */}
            {selected._type === 'standard' && (
              <div className={s.detailSection}>
                <div className={s.detailSectionTitle}>Trip Details</div>
                <div className={s.detailRow}>
                  <div className={s.detailField}>
                    <span className={s.detailLabel}>Tour</span>
                    <span className={s.detailValue}>{selected.tour_title ?? '—'}</span>
                  </div>
                  <div className={s.detailField}>
                    <span className={s.detailLabel}>Preferred Date</span>
                    <span className={s.detailValue}>{fmt(selected.preferred_date)}</span>
                  </div>
                </div>
                <div className={s.detailRow}>
                  <div className={s.detailField}>
                    <span className={s.detailLabel}>Adults</span>
                    <span className={s.detailValue}>{selected.number_of_adults ?? 0}</span>
                  </div>
                  <div className={s.detailField}>
                    <span className={s.detailLabel}>Children</span>
                    <span className={s.detailValue}>{selected.number_of_children ?? 0}</span>
                  </div>
                  <div className={s.detailField}>
                    <span className={s.detailLabel}>Infants</span>
                    <span className={s.detailValue}>{selected.number_of_infants ?? 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Custom Trip: Selected Sites ─── */}
            {selected._type === 'custom' && (
              <>
                <div className={s.detailSection}>
                  <div className={s.detailSectionTitle}>Selected Sites</div>
                  <div className={s.detailPills}>
                    {(selected.site_names ?? []).map((name, i) => (
                      <span key={i} className={s.detailPill}>{name}</span>
                    ))}
                    {(selected.site_names ?? []).length === 0 && (
                      <span className={s.detailValue}>—</span>
                    )}
                  </div>
                </div>

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
                      <span className={s.detailValue}>
                        {ACCOMMODATION_LABELS[selected.accommodation] ?? selected.accommodation ?? '—'}
                      </span>
                    </div>
                    <div className={s.detailField}>
                      <span className={s.detailLabel}>Transport</span>
                      <span className={s.detailValue}>
                        {TRANSPORT_LABELS[selected.transport] ?? selected.transport ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={s.detailSection}>
                  <div className={s.detailSectionTitle}>Trip Details</div>
                  <div className={s.detailRow}>
                    <div className={s.detailField}>
                      <span className={s.detailLabel}>Preferred Date</span>
                      <span className={s.detailValue}>{fmt(selected.preferred_start_date)}</span>
                    </div>
                    <div className={s.detailField}>
                      <span className={s.detailLabel}>Duration</span>
                      <span className={s.detailValue}>{selected.duration_days ?? '—'} day{(selected.duration_days ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className={s.detailRow}>
                    <div className={s.detailField}>
                      <span className={s.detailLabel}>Adults</span>
                      <span className={s.detailValue}>{selected.number_of_adults ?? 0}</span>
                    </div>
                    <div className={s.detailField}>
                      <span className={s.detailLabel}>Children</span>
                      <span className={s.detailValue}>{selected.number_of_children ?? 0}</span>
                    </div>
                    <div className={s.detailField}>
                      <span className={s.detailLabel}>Infants</span>
                      <span className={s.detailValue}>{selected.number_of_infants ?? 0}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

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
              <select
                className={s.statusSelect}
                value={statusVal}
                onChange={e => setStatusVal(e.target.value)}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete confirmation modal ────────────────────────────────── */}
      <Modal
        open={modal === 'delete'}
        title="Delete Trip Request"
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
            <p className={s.deleteMsg}>
              Delete request from <strong>{selected?.customer_name}</strong>?
            </p>
            <p className={s.deleteHint}>
              This will permanently remove this trip request. This cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  )
}
