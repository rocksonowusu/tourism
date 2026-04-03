import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './ServiceRequests.module.css'
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
const IconHome = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconTruck = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
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

const PURPOSE_LABELS = {
  vacation: 'Vacation',
  business: 'Business',
  event:    'Event',
  other:    'Other',
}

// ── Component ────────────────────────────────────────────────────────────
export default function ServiceRequests() {
  const { addToast } = useToast()
  usePageTitle('Service Requests')

  // ── Tab state ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('accommodation') // 'accommodation' | 'car-rental'

  // ── Accommodation requests state ──────────────────────────────────
  const [accRequests, setAccRequests]       = useState([])
  const [accTotal, setAccTotal]             = useState(0)
  const [accLoading, setAccLoading]         = useState(true)
  const [accNewCount, setAccNewCount]       = useState(0)
  const [accPage, setAccPage]               = useState(1)
  const [accSearch, setAccSearch]           = useState('')
  const [accFilterStatus, setAccFilterStatus] = useState('')

  // ── Car rental requests state ─────────────────────────────────────
  const [carRequests, setCarRequests]       = useState([])
  const [carTotal, setCarTotal]             = useState(0)
  const [carLoading, setCarLoading]         = useState(true)
  const [carNewCount, setCarNewCount]       = useState(0)
  const [carPage, setCarPage]               = useState(1)
  const [carSearch, setCarSearch]           = useState('')
  const [carFilterStatus, setCarFilterStatus] = useState('')

  // ── Shared modal state ────────────────────────────────────────────
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')
  const [statusVal, setStatusVal] = useState('')

  const PAGE_SIZE = 15

  // ── Load accommodation requests ───────────────────────────────────
  const loadAcc = useCallback(async () => {
    setAccLoading(true)
    try {
      const params = { page: accPage, page_size: PAGE_SIZE, ordering: '-created_at' }
      if (accSearch)       params.search = accSearch
      if (accFilterStatus) params.status = accFilterStatus
      const data = await api.accommodationRequests.list(params)
      setAccRequests(data?.results ?? data ?? [])
      setAccTotal(data?.count ?? 0)
    } catch (e) { console.error(e) }
    finally { setAccLoading(false) }
  }, [accSearch, accFilterStatus, accPage])

  const loadAccNewCount = useCallback(async () => {
    try { const res = await api.accommodationRequests.newCount(); setAccNewCount(res?.count ?? 0) }
    catch { /* ignore */ }
  }, [])

  useEffect(() => { loadAcc() }, [loadAcc])
  useEffect(() => { loadAccNewCount() }, [loadAccNewCount])
  useEffect(() => { setAccPage(1) }, [accSearch, accFilterStatus])

  const accTotalPages = Math.ceil(accTotal / PAGE_SIZE)

  // ── Load car rental requests ──────────────────────────────────────
  const loadCar = useCallback(async () => {
    setCarLoading(true)
    try {
      const params = { page: carPage, page_size: PAGE_SIZE, ordering: '-created_at' }
      if (carSearch)       params.search = carSearch
      if (carFilterStatus) params.status = carFilterStatus
      const data = await api.carRentalRequests.list(params)
      setCarRequests(data?.results ?? data ?? [])
      setCarTotal(data?.count ?? 0)
    } catch (e) { console.error(e) }
    finally { setCarLoading(false) }
  }, [carSearch, carFilterStatus, carPage])

  const loadCarNewCount = useCallback(async () => {
    try { const res = await api.carRentalRequests.newCount(); setCarNewCount(res?.count ?? 0) }
    catch { /* ignore */ }
  }, [])

  useEffect(() => { loadCar() }, [loadCar])
  useEffect(() => { loadCarNewCount() }, [loadCarNewCount])
  useEffect(() => { setCarPage(1) }, [carSearch, carFilterStatus])

  const carTotalPages = Math.ceil(carTotal / PAGE_SIZE)

  // ── Accommodation handlers ────────────────────────────────────────
  const openAccView = async (req) => {
    try {
      const detail = await api.accommodationRequests.detail(req.id)
      setSelected(detail); setStatusVal(detail.status)
    } catch { setSelected(req); setStatusVal(req.status) }
    setFormErr(''); setModal('acc-view')
  }
  const openAccDelete = (req) => { setSelected(req); setModal('acc-delete') }

  const handleAccStatusUpdate = async () => {
    if (!selected || statusVal === selected.status) return
    setSaving(true); setFormErr('')
    try {
      await api.accommodationRequests.update(selected.id, { status: statusVal })
      addToast({ message: `Status updated to "${STATUS_LABELS[statusVal]}".`, type: 'success' })
      closeModal(); loadAcc(); loadAccNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Update failed.') }
    finally { setSaving(false) }
  }

  const handleAccDelete = async () => {
    setSaving(true)
    try {
      await api.accommodationRequests.delete(selected.id)
      addToast({ message: 'Accommodation request deleted.', type: 'success' })
      closeModal(); loadAcc(); loadAccNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Delete failed.') }
    finally { setSaving(false) }
  }

  // ── Car rental handlers ───────────────────────────────────────────
  const openCarView = async (req) => {
    try {
      const detail = await api.carRentalRequests.detail(req.id)
      setSelected(detail); setStatusVal(detail.status)
    } catch { setSelected(req); setStatusVal(req.status) }
    setFormErr(''); setModal('car-view')
  }
  const openCarDelete = (req) => { setSelected(req); setModal('car-delete') }

  const handleCarStatusUpdate = async () => {
    if (!selected || statusVal === selected.status) return
    setSaving(true); setFormErr('')
    try {
      await api.carRentalRequests.update(selected.id, { status: statusVal })
      addToast({ message: `Status updated to "${STATUS_LABELS[statusVal]}".`, type: 'success' })
      closeModal(); loadCar(); loadCarNewCount()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Update failed.') }
    finally { setSaving(false) }
  }

  const handleCarDelete = async () => {
    setSaving(true)
    try {
      await api.carRentalRequests.delete(selected.id)
      addToast({ message: 'Car rental request deleted.', type: 'success' })
      closeModal(); loadCar(); loadCarNewCount()
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
          className={`${s.tab} ${activeTab === 'accommodation' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('accommodation')}
        >
          Accommodation Requests
          {accNewCount > 0 && <span className={s.tabBadge}>{accNewCount}</span>}
        </button>
        <button
          className={`${s.tab} ${activeTab === 'car-rental' ? s.tabActive : ''}`}
          onClick={() => setActiveTab('car-rental')}
        >
          Car Rental Requests
          {carNewCount > 0 && <span className={s.tabBadge}>{carNewCount}</span>}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
           ACCOMMODATION REQUESTS TAB
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'accommodation' && (
        <>
          {/* Toolbar */}
          <div className={s.toolbar}>
            <div className={s.searchWrap}>
              <span className={s.searchIcon}><IconSearch /></span>
              <input
                className={s.search}
                placeholder="Search by name, email, phone..."
                value={accSearch}
                onChange={e => setAccSearch(e.target.value)}
              />
            </div>
            <div className={s.filters}>
              <select className={s.select} value={accFilterStatus} onChange={e => setAccFilterStatus(e.target.value)} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Count bar */}
          {!accLoading && (
            <div className={s.countBar}>
              <span className={s.countLabel}>
                {accTotal} request{accTotal !== 1 ? 's' : ''}
                {accSearch || accFilterStatus ? ' matching filters' : ' total'}
              </span>
              {accNewCount > 0 && <span className={s.newBadge}>{accNewCount} new</span>}
            </div>
          )}

          {/* Table */}
          <div className={s.tableWrap}>
            {accLoading ? (
              <Spinner centered size="lg" />
            ) : accRequests.length === 0 ? (
              <EmptyState
                icon={<IconHome />}
                title="No accommodation requests"
                description={accSearch || accFilterStatus
                  ? 'No requests match your current filters.'
                  : 'No accommodation requests have been submitted yet.'}
              />
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.colCustomer}>Customer</th>
                    <th className={s.colProperty}>Property</th>
                    <th className={s.colDate}>Check-in</th>
                    <th className={s.colDate}>Check-out</th>
                    <th className={s.colGuests}>Guests</th>
                    <th className={s.colStatus}>Status</th>
                    <th className={s.colActions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accRequests.map(req => (
                    <tr key={req.id} className={s.row}>
                      <td className={s.colCustomer}>
                        <span className={s.title}>{req.customer_name}</span>
                        <span className={s.sub}>{req.customer_email}</span>
                      </td>
                      <td className={`${s.colProperty} ${s.muted}`}>{req.apartment_title ?? '—'}</td>
                      <td className={`${s.colDate} ${s.muted}`}>{fmt(req.check_in_date)}</td>
                      <td className={`${s.colDate} ${s.muted}`}>{fmt(req.check_out_date)}</td>
                      <td className={`${s.colGuests} ${s.center}`}>{req.number_of_guests ?? '—'}</td>
                      <td className={s.colStatus}>
                        <Badge variant={STATUS_VARIANTS[req.status] ?? 'default'}>{STATUS_LABELS[req.status] ?? req.status}</Badge>
                      </td>
                      <td className={s.colActions}>
                        <div className={s.actionBtns}>
                          <button className={s.iconBtn} onClick={() => openAccView(req)} title="View details" aria-label="View request details"><IconEye /></button>
                          <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => openAccDelete(req)} title="Delete request" aria-label="Delete request"><IconTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {accTotalPages > 1 && (
            <div className={s.pagination}>
              <button className={s.pageBtn} onClick={() => setAccPage(p => p - 1)} disabled={accPage === 1} aria-label="Previous page"><IconChevLeft /></button>
              <span className={s.pageInfo}>Page {accPage} of {accTotalPages}</span>
              <button className={s.pageBtn} onClick={() => setAccPage(p => p + 1)} disabled={accPage === accTotalPages} aria-label="Next page"><IconChevRight /></button>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════
           CAR RENTAL REQUESTS TAB
         ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'car-rental' && (
        <>
          {/* Toolbar */}
          <div className={s.toolbar}>
            <div className={s.searchWrap}>
              <span className={s.searchIcon}><IconSearch /></span>
              <input
                className={s.search}
                placeholder="Search by name, email, phone..."
                value={carSearch}
                onChange={e => setCarSearch(e.target.value)}
              />
            </div>
            <div className={s.filters}>
              <select className={s.select} value={carFilterStatus} onChange={e => setCarFilterStatus(e.target.value)} aria-label="Filter by status">
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Count bar */}
          {!carLoading && (
            <div className={s.countBar}>
              <span className={s.countLabel}>
                {carTotal} request{carTotal !== 1 ? 's' : ''}
                {carSearch || carFilterStatus ? ' matching filters' : ' total'}
              </span>
              {carNewCount > 0 && <span className={s.newBadge}>{carNewCount} new</span>}
            </div>
          )}

          {/* Table */}
          <div className={s.tableWrap}>
            {carLoading ? (
              <Spinner centered size="lg" />
            ) : carRequests.length === 0 ? (
              <EmptyState
                icon={<IconTruck />}
                title="No car rental requests"
                description={carSearch || carFilterStatus
                  ? 'No requests match your current filters.'
                  : 'No car rental requests have been submitted yet.'}
              />
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.colCustomer}>Customer</th>
                    <th className={s.colVehicle}>Vehicle</th>
                    <th className={s.colDate}>Pickup</th>
                    <th className={s.colDate}>Return</th>
                    <th className={s.colDriver}>Driver</th>
                    <th className={s.colStatus}>Status</th>
                    <th className={s.colActions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carRequests.map(req => (
                    <tr key={req.id} className={s.row}>
                      <td className={s.colCustomer}>
                        <span className={s.title}>{req.customer_name}</span>
                        <span className={s.sub}>{req.customer_email}</span>
                      </td>
                      <td className={`${s.colVehicle} ${s.muted}`}>{req.vehicle_name ?? '—'}</td>
                      <td className={`${s.colDate} ${s.muted}`}>{fmt(req.pickup_date)}</td>
                      <td className={`${s.colDate} ${s.muted}`}>{fmt(req.return_date)}</td>
                      <td className={`${s.colDriver} ${s.center}`}>{req.with_driver ? 'Yes' : 'No'}</td>
                      <td className={s.colStatus}>
                        <Badge variant={STATUS_VARIANTS[req.status] ?? 'default'}>{STATUS_LABELS[req.status] ?? req.status}</Badge>
                      </td>
                      <td className={s.colActions}>
                        <div className={s.actionBtns}>
                          <button className={s.iconBtn} onClick={() => openCarView(req)} title="View details" aria-label="View request details"><IconEye /></button>
                          <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => openCarDelete(req)} title="Delete request" aria-label="Delete request"><IconTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {carTotalPages > 1 && (
            <div className={s.pagination}>
              <button className={s.pageBtn} onClick={() => setCarPage(p => p - 1)} disabled={carPage === 1} aria-label="Previous page"><IconChevLeft /></button>
              <span className={s.pageInfo}>Page {carPage} of {carTotalPages}</span>
              <button className={s.pageBtn} onClick={() => setCarPage(p => p + 1)} disabled={carPage === carTotalPages} aria-label="Next page"><IconChevRight /></button>
            </div>
          )}
        </>
      )}

      {/* ── Accommodation View / Edit Status modal ───────────────────── */}
      <Modal
        open={modal === 'acc-view'}
        title="Accommodation Request Details"
        onClose={closeModal}
        width={600}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>Close</Button>
              {statusVal !== selected?.status && (
                <Button variant="primary" size="sm" onClick={handleAccStatusUpdate} loading={saving}>Update Status</Button>
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

            {/* Accommodation Details */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Accommodation Details</div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Property</span><span className={s.detailValue}>{selected.apartment_title ?? '—'}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Purpose</span><span className={s.detailValue}>{PURPOSE_LABELS[selected.purpose] ?? selected.purpose ?? '—'}</span></div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Check-in</span><span className={s.detailValue}>{fmt(selected.check_in_date)}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Check-out</span><span className={s.detailValue}>{fmt(selected.check_out_date)}</span></div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Number of Guests</span><span className={s.detailValue}>{selected.number_of_guests ?? '—'}</span></div>
              </div>
            </div>

            {/* Message */}
            {selected.message && (
              <div className={s.detailSection}>
                <div className={s.detailSectionTitle}>Message</div>
                <div className={s.detailNotes}>{selected.message}</div>
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

      {/* ── Accommodation Delete modal ───────────────────────────────── */}
      <Modal
        open={modal === 'acc-delete'}
        title="Delete Accommodation Request"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost"  size="sm" onClick={closeModal}      disabled={saving}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleAccDelete} loading={saving}>Delete</Button>
            </div>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>Delete accommodation request from <strong>{selected?.customer_name}</strong>?</p>
            <p className={s.deleteHint}>This will permanently remove this request. This cannot be undone.</p>
          </div>
        </div>
      </Modal>

      {/* ── Car Rental View / Edit Status modal ──────────────────────── */}
      <Modal
        open={modal === 'car-view'}
        title="Car Rental Request Details"
        onClose={closeModal}
        width={600}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>Close</Button>
              {statusVal !== selected?.status && (
                <Button variant="primary" size="sm" onClick={handleCarStatusUpdate} loading={saving}>Update Status</Button>
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

            {/* Rental Details */}
            <div className={s.detailSection}>
              <div className={s.detailSectionTitle}>Rental Details</div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Vehicle</span><span className={s.detailValue}>{selected.vehicle_name ?? '—'}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>With Driver</span><span className={s.detailValue}>{selected.with_driver ? 'Yes' : 'No'}</span></div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Pickup Date</span><span className={s.detailValue}>{fmt(selected.pickup_date)}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Return Date</span><span className={s.detailValue}>{fmt(selected.return_date)}</span></div>
              </div>
              <div className={s.detailRow}>
                <div className={s.detailField}><span className={s.detailLabel}>Pickup Location</span><span className={s.detailValue}>{selected.pickup_location || '—'}</span></div>
                <div className={s.detailField}><span className={s.detailLabel}>Return Location</span><span className={s.detailValue}>{selected.return_location || '—'}</span></div>
              </div>
            </div>

            {/* Purpose & Message */}
            {selected.purpose && (
              <div className={s.detailSection}>
                <div className={s.detailSectionTitle}>Purpose</div>
                <div className={s.detailNotes}>{selected.purpose}</div>
              </div>
            )}

            {selected.message && (
              <div className={s.detailSection}>
                <div className={s.detailSectionTitle}>Message</div>
                <div className={s.detailNotes}>{selected.message}</div>
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

      {/* ── Car Rental Delete modal ──────────────────────────────────── */}
      <Modal
        open={modal === 'car-delete'}
        title="Delete Car Rental Request"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <div className={s.footerRight}>
              <Button variant="ghost"  size="sm" onClick={closeModal}      disabled={saving}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleCarDelete} loading={saving}>Delete</Button>
            </div>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>Delete car rental request from <strong>{selected?.customer_name}</strong>?</p>
            <p className={s.deleteHint}>This will permanently remove this request. This cannot be undone.</p>
          </div>
        </div>
      </Modal>

    </div>
  )
}
