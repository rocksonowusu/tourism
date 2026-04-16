import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './Apartments.module.css'
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
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const IconPlay = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
  </svg>
)
const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconFileText = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
)
const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconImage = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconHome = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const STEPS = [
  { num: 1, label: 'Basic Info',  icon: <IconFileText /> },
  { num: 2, label: 'Details',     icon: <IconList /> },
  { num: 3, label: 'Content',     icon: <IconList /> },
  { num: 4, label: 'Media',       icon: <IconImage /> },
]

const MAX_MEDIA  = 10

const EMPTY_FORM = {
  title: '', description: '', location: '', address: '',
  property_type: 'apartment', bedrooms: '', bathrooms: '', max_guests: '',
  price_per_night: '',
  amenities: '', rules: '',
  is_available: true, is_featured: false,
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house',     label: 'House' },
  { value: 'villa',     label: 'Villa' },
  { value: 'suite',     label: 'Suite' },
]

// ── Component ────────────────────────────────────────────────────────────
export default function Apartments() {
  const { addToast } = useToast()
  usePageTitle('Apartments')
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const PAGE_SIZE = 15

  const [search, setSearch]        = useState('')
  const [filterFeat, setFilterFeat] = useState('')
  const [filterType, setFilterType] = useState('')

  const [modal, setModal]       = useState(null)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [formErr, setFormErr]   = useState('')
  const [step, setStep]         = useState(1)
  const [slideDir, setSlideDir] = useState('next')

  const [mediaFiles, setMediaFiles]         = useState([])
  const [existingMedia, setExistingMedia]   = useState([])
  const [mediaUploading, setMediaUploading] = useState(false)

  // ── Data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search)     params.search       = search
      if (filterFeat) params.is_featured  = filterFeat
      if (filterType) params.property_type = filterType
      const data = await api.apartments.list(params)
      setItems(data?.results ?? data ?? [])
      setTotal(data?.count ?? (data?.length ?? 0))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, filterFeat, filterType])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, filterFeat, filterType])

  // ── Form helpers ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null); setForm(EMPTY_FORM); setFormErr(''); setMediaFiles([]); setExistingMedia([]); setStep(1); setSlideDir('next'); setModal('create')
  }

  const openEdit = async (item) => {
    setEditing(item)
    setFormErr(''); setMediaFiles([]); setStep(1); setSlideDir('next')
    
    // Fetch full apartment details (list endpoint doesn't include all fields)
    try {
      const detail = await api.apartments.detail(item.id)
      setForm({
        title:          detail.title          ?? '',
        description:    detail.description    ?? '',
        location:       detail.location       ?? '',
        address:        detail.address        ?? '',
        property_type:  detail.property_type  ?? 'apartment',
        bedrooms:       detail.bedrooms       ?? '',
        bathrooms:      detail.bathrooms      ?? '',
        max_guests:     detail.max_guests     ?? '',
        price_per_night: detail.price_per_night ?? '',
        amenities:      Array.isArray(detail.amenities) ? detail.amenities.join('\n') : '',
        rules:          Array.isArray(detail.rules) ? detail.rules.join('\n') : '',
        is_available:   detail.is_available   ?? true,
        is_featured:    detail.is_featured    ?? false,
      })
      setExistingMedia(detail?.media ?? [])
    } catch (e) {
      // Fallback to list data if detail fetch fails
      setForm({
        title:          item.title          ?? '',
        description:    item.description    ?? '',
        location:       item.location       ?? '',
        address:        item.address        ?? '',
        property_type:  item.property_type  ?? 'apartment',
        bedrooms:       item.bedrooms       ?? '',
        bathrooms:      item.bathrooms      ?? '',
        max_guests:     item.max_guests     ?? '',
        price_per_night: item.price_per_night ?? '',
        amenities:      Array.isArray(item.amenities) ? item.amenities.join('\n') : '',
        rules:          Array.isArray(item.rules) ? item.rules.join('\n') : '',
        is_available:   item.is_available   ?? true,
        is_featured:    item.is_featured    ?? false,
      })
      setExistingMedia([])
    }
    setModal('edit')
  }

  const openDelete = (item) => { setEditing(item); setModal('delete') }
  const closeModal = () => { setModal(null); setEditing(null); setMediaFiles([]); setExistingMedia([]); setStep(1); setSlideDir('next') }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  // Media helpers
  const availableSlots = MAX_MEDIA - existingMedia.length

  const handleMediaFiles = (fileList) => {
    const newFiles = Array.from(fileList)
    setMediaFiles(prev => {
      const combined = [...prev, ...newFiles]
      if (combined.length > availableSlots) {
        setFormErr(`Only ${availableSlots} slot(s) remaining for media.`)
        return combined.slice(0, Math.max(availableSlots, 0))
      }
      setFormErr(''); return combined
    })
  }

  const removeNewFile = (idx) => { setMediaFiles(prev => prev.filter((_, i) => i !== idx)); setFormErr('') }

  const deleteExistingMedia = async (mediaId) => {
    try {
      await api.apartmentMedia.delete(mediaId)
      setExistingMedia(prev => prev.filter(m => m.id !== mediaId))
      addToast({ message: 'Media deleted.', type: 'success' })
    } catch (e) { addToast({ message: e?.message ?? 'Failed to delete media.', type: 'error' }) }
  }

  // ── Step navigation ────────────────────────────────────────────────────
  const TOTAL_STEPS = 4

  const validateStep = (s) => {
    setFormErr('')
    if (s === 1 && !form.title.trim()) { setFormErr('Title is required.'); return false }
    return true
  }

  const goNext = () => { if (!validateStep(step)) return; setSlideDir('next'); setStep(p => Math.min(p + 1, TOTAL_STEPS)); setFormErr('') }
  const goBack = () => { setSlideDir('back'); setStep(p => Math.max(p - 1, 1)); setFormErr('') }

  const toArray = (text) => text.trim() ? text.split('\n').map(l => l.trim()).filter(Boolean) : []

  const handleSave = async () => {
    if (!form.title.trim()) { setFormErr('Title is required.'); setStep(1); return }
    setSaving(true); setFormErr('')
    try {
      const payload = {
        title: form.title, description: form.description,
        location: form.location, address: form.address,
        property_type: form.property_type,
        bedrooms: form.bedrooms === '' ? null : Number(form.bedrooms),
        bathrooms: form.bathrooms === '' ? null : Number(form.bathrooms),
        max_guests: form.max_guests === '' ? null : Number(form.max_guests),
        price_per_night: form.price_per_night === '' ? null : form.price_per_night,
        amenities: toArray(form.amenities),
        rules: toArray(form.rules),
        is_available: form.is_available,
        is_featured: form.is_featured,
      }

      let itemId
      if (modal === 'create') {
        const created = await api.apartments.create(payload)
        itemId = created.id
      } else {
        await api.apartments.update(editing.id, payload)
        itemId = editing.id
      }

      if (mediaFiles.length > 0 && itemId) {
        setMediaUploading(true)
        const fd = new FormData()
        mediaFiles.forEach(f => fd.append('file', f))
        try { await api.apartments.upload(itemId, fd) }
        catch (uploadErr) {
          addToast({ message: uploadErr?.data?.detail ?? `Saved but media upload failed: ${uploadErr?.message}`, type: 'warning' })
        }
        setMediaUploading(false)
      }

      addToast({ message: modal === 'create' ? 'Apartment created.' : 'Apartment updated.', type: 'success' })
      closeModal(); load()
    } catch (e) {
      const errs = e?.data
      if (errs && typeof errs === 'object' && !Array.isArray(errs)) {
        setFormErr(Object.entries(errs).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | '))
      } else {
        setFormErr(e?.data?.detail ?? e?.message ?? 'Save failed.')
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await api.apartments.delete(editing.id)
      addToast({ message: 'Apartment deleted.', type: 'success' })
      closeModal(); load()
    } catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Delete failed.') }
    finally { setSaving(false) }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className={s.page}>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}><IconSearch /></span>
          <input className={s.search} placeholder="Search apartments..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={s.filters}>
          <select className={s.select} value={filterType} onChange={e => setFilterType(e.target.value)} aria-label="Filter by type">
            <option value="">All types</option>
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className={s.select} value={filterFeat} onChange={e => setFilterFeat(e.target.value)} aria-label="Filter featured">
            <option value="">All</option>
            <option value="true">Featured</option>
            <option value="false">Standard</option>
          </select>
        </div>
        <Button variant="primary" size="sm" icon={<IconPlus />} onClick={openCreate}>New Apartment</Button>
      </div>

      {!loading && (
        <div className={s.countBar}>
          <span className={s.countLabel}>{total} apartment{total !== 1 ? 's' : ''}{search || filterFeat || filterType ? ' matching filters' : ' total'}</span>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className={s.tableWrap}>
        {loading ? (
          <Spinner centered size="lg" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<IconHome />}
            title="No apartments found"
            description={search || filterFeat || filterType ? 'No apartments match your current filters.' : 'You have not created any apartments yet.'}
            action={<Button variant="primary" size="sm" icon={<IconPlus />} onClick={openCreate}>New Apartment</Button>}
          />
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.colTitle}>Apartment</th>
                <th className={s.colLocation}>Location</th>
                <th className={s.colType}>Type</th>
                <th className={s.colBeds}>Beds</th>
                <th className={s.colPrice}>Price/Night</th>
                <th className={s.colStatus}>Status</th>
                <th className={s.colActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className={s.row}>
                  <td className={s.colTitle}>
                    <span className={s.title}>{item.title}</span>
                    {item.description && <span className={s.sub}>{item.description.length > 50 ? item.description.slice(0, 50) + '...' : item.description}</span>}
                  </td>
                  <td className={`${s.colLocation} ${s.muted}`}>{item.location || <span className={s.na}>—</span>}</td>
                  <td className={`${s.colType} ${s.muted}`}>{PROPERTY_TYPES.find(t => t.value === item.property_type)?.label ?? item.property_type}</td>
                  <td className={`${s.colBeds} ${s.muted}`}>{item.bedrooms ?? <span className={s.na}>—</span>}</td>
                  <td className={`${s.colPrice} ${s.muted}`}>{item.price_per_night ? `GH₵${Number(item.price_per_night).toLocaleString()}` : <span className={s.na}>—</span>}</td>
                  <td className={s.colStatus}>
                    <div className={s.badges}>
                      {item.is_featured && <Badge variant="gold">Featured</Badge>}
                      <Badge variant={item.is_available ? 'success' : 'default'}>{item.is_available ? 'Available' : 'Unavailable'}</Badge>
                    </div>
                  </td>
                  <td className={s.colActions}>
                    <div className={s.actionBtns}>
                      <button className={s.iconBtn} onClick={() => openEdit(item)} title="Edit" aria-label="Edit"><IconEdit /></button>
                      <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => openDelete(item)} title="Delete" aria-label="Delete"><IconTrash /></button>
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
          <button className={s.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1} aria-label="Previous"><IconChevLeft /></button>
          <span className={s.pageInfo}>Page {page} of {totalPages}</span>
          <button className={s.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages} aria-label="Next"><IconChevRight /></button>
        </div>
      )}

      {/* ── Create / Edit wizard modal ─────────────────────────────── */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        title={modal === 'create' ? 'New Apartment' : 'Edit Apartment'}
        onClose={closeModal}
        width={660}
        footer={
          <div className={s.wizardFooter}>
            <div className={s.wizardFooterLeft}>
              {formErr && <span className={s.err}>{formErr}</span>}
              {!formErr && <span className={s.stepCounter}>Step {step} of {TOTAL_STEPS}</span>}
            </div>
            <div className={s.wizardFooterRight}>
              {step > 1 && <Button variant="ghost" size="sm" onClick={goBack} disabled={saving || mediaUploading}>Back</Button>}
              {step < TOTAL_STEPS
                ? <Button variant="primary" size="sm" onClick={goNext}>Next</Button>
                : <Button variant="primary" size="sm" onClick={handleSave} loading={saving || mediaUploading}>{modal === 'create' ? 'Create' : 'Save Changes'}</Button>
              }
            </div>
          </div>
        }
      >
        <div className={s.stepper}>
          {STEPS.map(st => {
            const isDone = step > st.num, isActive = step === st.num
            return (
              <div key={st.num} className={[s.stepItem, isDone && s.stepDone, isActive && s.stepActive].filter(Boolean).join(' ')}>
                <div className={s.stepCircle}>{isDone ? <IconCheck /> : st.num}</div>
                <span className={s.stepLabel}>{st.label}</span>
              </div>
            )
          })}
        </div>

        <div className={s.stepSlider}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className={s.stepPane} key="step-1">
              <div className={s.stepTitle}><IconFileText /> Basic Information</div>
              <div className={s.form}>
                <div className={s.formGroup}>
                  <label className={s.label}>Title <span className={s.req}>*</span></label>
                  <input className={s.input} name="title" value={form.title} onChange={handleChange} placeholder="e.g. Skyline City Apartment" autoFocus />
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Description</label>
                  <textarea className={s.textarea} name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Property description..." />
                </div>
                <div className={s.row2}>
                  <div className={s.formGroup}>
                    <label className={s.label}>Location</label>
                    <input className={s.input} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Accra, Ghana" />
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.label}>Property Type</label>
                    <select className={s.input} name="property_type" value={form.property_type} onChange={handleChange}>
                      {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className={s.stepPane} key="step-2">
              <div className={s.stepTitle}><IconList /> Property Details</div>
              <div className={s.form}>
                <div className={s.formGroup}>
                  <label className={s.label}>Address</label>
                  <input className={s.input} name="address" value={form.address} onChange={handleChange} placeholder="Full street address" />
                </div>
                <div className={s.row2}>
                  <div className={s.formGroup}>
                    <label className={s.label}>Bedrooms</label>
                    <input className={s.input} type="number" min="0" name="bedrooms" value={form.bedrooms} onChange={handleChange} />
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.label}>Bathrooms</label>
                    <input className={s.input} type="number" min="0" name="bathrooms" value={form.bathrooms} onChange={handleChange} />
                  </div>
                </div>
                <div className={s.row2}>
                  <div className={s.formGroup}>
                    <label className={s.label}>Max Guests</label>
                    <input className={s.input} type="number" min="1" name="max_guests" value={form.max_guests} onChange={handleChange} />
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.label}>Price Per Night (GH₵)</label>
                    <input className={s.input} type="number" min="0" step="0.01" name="price_per_night" value={form.price_per_night} onChange={handleChange} />
                  </div>
                </div>
                <div className={s.row2}>
                  <div className={s.formGroup}>
                    <label className={s.checkLabel}><input type="checkbox" name="is_available" checked={form.is_available} onChange={handleChange} /><span>Available</span></label>
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.checkLabel}><input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} /><span>Featured</span></label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Content (amenities, rules) */}
          {step === 3 && (
            <div className={s.stepPane} key="step-3">
              <div className={s.stepTitle}><IconList /> Amenities & Rules</div>
              <div className={s.form}>
                <div className={s.formGroup}>
                  <label className={s.label}>Amenities</label>
                  <textarea className={s.textarea} name="amenities" rows={4} value={form.amenities} onChange={handleChange} placeholder={"One per line, e.g.:\nFree WiFi\nAir Conditioning\nSwimming Pool"} autoFocus />
                  <span className={s.hint}>One amenity per line.</span>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>House Rules</label>
                  <textarea className={s.textarea} name="rules" rows={4} value={form.rules} onChange={handleChange} placeholder={"One per line, e.g.:\nNo smoking\nNo pets\nCheck-in after 2 PM"} />
                  <span className={s.hint}>One rule per line.</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Media */}
          {step === 4 && (
            <div className={s.stepPane} key="step-4">
              <div className={s.stepTitle}><IconImage /> Media</div>
              <div className={s.form}>
                <div className={s.mediaDivider}><span className={s.mediaDividerText}>Files ({existingMedia.length + mediaFiles.length} / {MAX_MEDIA})</span></div>
                {existingMedia.length > 0 && (
                  <div className={s.previewGrid}>
                    {existingMedia.map(m => (
                      <div key={m.id} className={s.previewItem}>
                        {m.media_type === 'video' ? <div className={s.previewVideoThumb}><IconPlay /></div> : <img src={m.file_url} alt={m.caption ?? ''} className={s.previewImg} />}
                        <button type="button" className={s.previewRemove} onClick={() => deleteExistingMedia(m.id)} title="Delete"><IconX /></button>
                      </div>
                    ))}
                  </div>
                )}
                {mediaFiles.length > 0 && (
                  <div className={s.previewGrid}>
                    {mediaFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className={`${s.previewItem} ${s.previewItemNew}`}>
                        {file.type.startsWith('video/') ? <div className={s.previewVideoThumb}><IconPlay /></div> : <img src={URL.createObjectURL(file)} alt={file.name} className={s.previewImg} />}
                        <span className={s.previewName}>{file.name}</span>
                        <button type="button" className={s.previewRemove} onClick={() => removeNewFile(idx)} title="Remove"><IconX /></button>
                      </div>
                    ))}
                  </div>
                )}
                {availableSlots - mediaFiles.length > 0 && (
                  <div className={s.fileWrap}>
                    <input type="file" accept="image/*,video/*" multiple className={s.fileInput} onChange={e => { handleMediaFiles(e.target.files); e.target.value = '' }} />
                    <IconUpload />
                    <span className={s.filePlaceholder}>Add up to {availableSlots - mediaFiles.length} more file{availableSlots - mediaFiles.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Delete confirmation ──────────────────────────────────────── */}
      <Modal
        open={modal === 'delete'}
        title="Delete Apartment"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>Delete</Button>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>Are you sure you want to delete <strong>{editing?.title}</strong>?</p>
            <p className={s.deleteHint}>This will permanently remove the apartment and all associated media.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
