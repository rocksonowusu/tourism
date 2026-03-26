import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './Events.module.css'
import { usePageTitle } from '../hooks/usePageTitle'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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

// ── Helpers ──────────────────────────────────────────────────────────────
const fmt        = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const EMPTY_FORM = {
  title: '', description: '', location: '', date: '',
  price: '', is_featured: false, tourist_site_id: '',
}

// ── Component ────────────────────────────────────────────────────────────
export default function Events() {
  const { addToast } = useToast()
  usePageTitle('Events')
  const [events,  setEvents]  = useState([])
  const [sites,   setSites]   = useState([])
  const [loading, setLoading] = useState(true)
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const PAGE_SIZE = 15

  // filters
  const [search,     setSearch]     = useState('')
  const [filterFeat, setFilterFeat] = useState('')
  const [filterSite, setFilterSite] = useState('')

  // modal state
  const [modal,   setModal]   = useState(null)  // null | 'create' | 'edit' | 'delete'
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY_FORM)
  const [saving,  setSaving]  = useState(false)
  const [formErr, setFormErr] = useState('')

  // ── Data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search)     params.search       = search
      if (filterFeat) params.is_featured  = filterFeat
      if (filterSite) params.tourist_site = filterSite
      const data = await api.events.list(params)
      setEvents(data?.results ?? data ?? [])
      setTotal(data?.count ?? (data?.length ?? 0))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterFeat, filterSite])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    api.sites.list({ page_size: 100 })
      .then(d => setSites(d?.results ?? d ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => { setPage(1) }, [search, filterFeat, filterSite])

  // ── Form helpers ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null); setForm(EMPTY_FORM); setFormErr(''); setModal('create')
  }
  const openEdit = (ev) => {
    setEditing(ev)
    setForm({
      title:          ev.title        ?? '',
      description:    ev.description  ?? '',
      location:       ev.location     ?? '',
      date:           ev.date         ? ev.date.slice(0, 16) : '',
      price:          ev.price        ?? '',
      is_featured:    ev.is_featured  ?? false,
      tourist_site_id: ev.tourist_site?.id ?? ev.tourist_site ?? '',
    })
    setFormErr('')
    setModal('edit')
  }
  const openDelete = (ev) => { setEditing(ev); setModal('delete') }
  const closeModal = () => { setModal(null); setEditing(null) }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setFormErr('Title is required.'); return }
    setSaving(true); setFormErr('')
    try {
      const payload = {
        title:           form.title,
        description:     form.description,
        location:        form.location,
        date:            form.date || null,
        price:           form.price === '' ? 0 : Number(form.price),
        is_featured:     form.is_featured,
        tourist_site_id: form.tourist_site_id === '' ? null : Number(form.tourist_site_id),
      }
      if (modal === 'create') await api.events.create(payload)
      else                    await api.events.update(editing.id, payload)
      addToast({ message: modal === 'create' ? 'Event created.' : 'Event updated.', type: 'success' })
      closeModal()
      load()
    } catch (e) {
      const errs = e?.data
      if (errs && typeof errs === 'object' && !Array.isArray(errs)) {
        const msgs = Object.entries(errs)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
        setFormErr(msgs)
      } else {
        setFormErr(e?.data?.detail ?? e?.message ?? 'Save failed.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await api.events.delete(editing.id)
      addToast({ message: 'Event deleted.', type: 'success' })
      closeModal(); load()
    } catch (e) {
      setFormErr(e?.data?.detail ?? e?.message ?? 'Delete failed.')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={s.page}>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}><IconSearch /></span>
          <input
            className={s.search}
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={s.filters}>
          <select
            className={s.select}
            value={filterFeat}
            onChange={e => setFilterFeat(e.target.value)}
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            <option value="true">Featured</option>
            <option value="false">Standard</option>
          </select>
          <select
            className={s.select}
            value={filterSite}
            onChange={e => setFilterSite(e.target.value)}
            aria-label="Filter by site"
          >
            <option value="">All sites</option>
            {sites.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
          </select>
        </div>
        <Button variant="primary" size="sm" icon={<IconPlus />} onClick={openCreate}>
          New Event
        </Button>
      </div>

      {/* ── Count bar ───────────────────────────────────────────────── */}
      {!loading && (
        <div className={s.countBar}>
          <span className={s.countLabel}>
            {total} event{total !== 1 ? 's' : ''}
            {search || filterFeat || filterSite ? ' matching filters' : ' total'}
          </span>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className={s.tableWrap}>
        {loading ? (
          <Spinner centered size="lg" />
        ) : events.length === 0 ? (
          <EmptyState
            icon={
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            }
            title="No events found"
            description={search || filterFeat || filterSite
              ? 'No events match your current filters. Try adjusting your search.'
              : 'You have not created any events yet.'}
            action={<Button variant="primary" size="sm" icon={<IconPlus />} onClick={openCreate}>New Event</Button>}
          />
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.colTitle}>Event</th>
                <th className={s.colSite}>Site</th>
                <th className={s.colDate}>Start Date</th>
                <th className={s.colPrice}>Price</th>
                <th className={s.colStatus}>Status</th>
                <th className={s.colActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} className={s.row}>
                  <td className={s.colTitle}>
                    <span className={s.title}>{ev.title}</span>
                    {ev.location && <span className={s.sub}>{ev.location}</span>}
                  </td>
                  <td className={`${s.colSite} ${s.muted}`}>
                    {ev.tourist_site?.name ?? <span className={s.na}>—</span>}
                  </td>
                  <td className={`${s.colDate} ${s.muted}`}>{fmt(ev.date)}</td>
                  <td className={`${s.colPrice} ${s.muted}`}>
                    {ev.price != null && Number(ev.price) > 0
                      ? `$${Number(ev.price).toFixed(2)}`
                      : <span className={s.free}>Free</span>}
                  </td>
                  <td className={s.colStatus}>
                    <div className={s.badges}>
                      {ev.is_featured && <Badge variant="gold">Featured</Badge>}
                      <Badge variant={ev.is_upcoming ? 'success' : 'default'}>
                        {ev.is_upcoming ? 'Upcoming' : 'Past'}
                      </Badge>
                    </div>
                  </td>
                  <td className={s.colActions}>
                    <div className={s.actionBtns}>
                      <button
                        className={s.iconBtn}
                        onClick={() => openEdit(ev)}
                        title="Edit event"
                        aria-label="Edit event"
                      >
                        <IconEdit />
                      </button>
                      <button
                        className={`${s.iconBtn} ${s.iconBtnDanger}`}
                        onClick={() => openDelete(ev)}
                        title="Delete event"
                        aria-label="Delete event"
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

      {/* ── Create / Edit modal ──────────────────────────────────────── */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        title={modal === 'create' ? 'New Event' : 'Edit Event'}
        onClose={closeModal}
        width={580}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <Button variant="ghost"   size="sm" onClick={closeModal}  disabled={saving}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}  loading={saving}>
              {modal === 'create' ? 'Create Event' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <div className={s.form}>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="ev-title">Title <span className={s.req}>*</span></label>
            <input id="ev-title" className={s.input} name="title" value={form.title} onChange={handleChange} placeholder="e.g. Annual Beach Festival" />
          </div>

          <div className={s.formGroup}>
            <label className={s.label} htmlFor="ev-desc">Description</label>
            <textarea id="ev-desc" className={s.textarea} name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Brief description of the event…" />
          </div>

          <div className={s.row2}>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="ev-loc">Location</label>
              <input id="ev-loc" className={s.input} name="location" value={form.location} onChange={handleChange} placeholder="City, venue…" />
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="ev-site">Tourist Site</label>
              <select id="ev-site" className={s.input} name="tourist_site_id" value={form.tourist_site_id} onChange={handleChange}>
                <option value="">— none —</option>
                {sites.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
            </div>
          </div>

          <div className={s.row2}>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="ev-date">Event Date &amp; Time <span className={s.req}>*</span></label>
              <input id="ev-date" className={s.input} type="datetime-local" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div className={s.formGroup}>
              <label className={s.label} htmlFor="ev-price">Price (USD)</label>
              <input id="ev-price" className={s.input} type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} placeholder="0 for free" />
            </div>
          </div>

          <div className={s.formGroup}>
            <label className={s.checkLabel}>
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
              <span>Mark as featured</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* ── Delete confirmation modal ────────────────────────────────── */}
      <Modal
        open={modal === 'delete'}
        title="Delete Event"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <Button variant="ghost"  size="sm" onClick={closeModal}   disabled={saving}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>Delete Event</Button>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>
              Are you sure you want to delete <strong>{editing?.title}</strong>?
            </p>
            <p className={s.deleteHint}>
              This will permanently remove the event and cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  )
}

