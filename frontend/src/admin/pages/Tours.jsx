import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './Tours.module.css'
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

// Step icons
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
const IconCompass = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
)

const STEPS = [
  { num: 1, label: 'Basic Info',  icon: <IconFileText /> },
  { num: 2, label: 'Settings',    icon: <IconList /> },
  { num: 3, label: 'Content',     icon: <IconList /> },
  { num: 4, label: 'Media',       icon: <IconImage /> },
]

// ── Helpers ──────────────────────────────────────────────────────────────
const MAX_MEDIA  = 10

const EMPTY_FORM = {
  title: '', description: '', location: '', duration: '',
  max_group_size: '', is_active: true, is_featured: false,
  highlights: '', inclusions: '', exclusions: '', itinerary: '',
}

// ── Component ────────────────────────────────────────────────────────────
export default function Tours() {
  const { addToast } = useToast()
  usePageTitle('Tours')
  const [tours,   setTours]   = useState([])
  const [loading, setLoading] = useState(true)
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const PAGE_SIZE = 15

  // filters
  const [search,      setSearch]      = useState('')
  const [filterFeat,  setFilterFeat]  = useState('')
  const [filterActive, setFilterActive] = useState('')

  // modal state
  const [modal,   setModal]   = useState(null)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY_FORM)
  const [saving,  setSaving]  = useState(false)
  const [formErr, setFormErr] = useState('')
  const [step,    setStep]    = useState(1)
  const [slideDir, setSlideDir] = useState('next')

  // Media upload state
  const [mediaFiles,     setMediaFiles]     = useState([])
  const [existingMedia,  setExistingMedia]  = useState([])
  const [mediaUploading, setMediaUploading] = useState(false)

  // ── Data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search)       params.search      = search
      if (filterFeat)   params.is_featured = filterFeat
      if (filterActive) params.is_active   = filterActive
      const data = await api.tours.list(params)
      setTours(data?.results ?? data ?? [])
      setTotal(data?.count ?? (data?.length ?? 0))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterFeat, filterActive])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, filterFeat, filterActive])

  // ── Form helpers ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null); setForm(EMPTY_FORM); setFormErr(''); setMediaFiles([]); setExistingMedia([]); setStep(1); setSlideDir('next'); setModal('create')
  }

  const openEdit = async (tour) => {
    setEditing(tour)
    setForm({
      title:           tour.title           ?? '',
      description:     tour.description     ?? '',
      location:        tour.location        ?? '',
      duration:        tour.duration         ?? '',
      max_group_size:  tour.max_group_size   ?? '',
      is_active:       tour.is_active        ?? true,
      is_featured:     tour.is_featured      ?? false,
      highlights:      Array.isArray(tour.highlights) ? tour.highlights.join('\n') : '',
      inclusions:      Array.isArray(tour.inclusions) ? tour.inclusions.join('\n') : '',
      exclusions:      Array.isArray(tour.exclusions) ? tour.exclusions.join('\n') : '',
      itinerary:       Array.isArray(tour.itinerary) ? tour.itinerary.join('\n') : '',
    })
    setFormErr(''); setMediaFiles([]); setStep(1); setSlideDir('next')
    try {
      const detail = await api.tours.detail(tour.id)
      setExistingMedia(detail?.media ?? [])
    } catch { setExistingMedia([]) }
    setModal('edit')
  }

  const openDelete = (tour) => { setEditing(tour); setModal('delete') }
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
      setFormErr('')
      return combined
    })
  }

  const removeNewFile = (idx) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== idx))
    setFormErr('')
  }

  const deleteExistingMedia = async (mediaId) => {
    try {
      await api.tourMedia.delete(mediaId)
      setExistingMedia(prev => prev.filter(m => m.id !== mediaId))
      addToast({ message: 'Media deleted.', type: 'success' })
    } catch (e) {
      addToast({ message: e?.message ?? 'Failed to delete media.', type: 'error' })
    }
  }

  // ── Step navigation ────────────────────────────────────────────────────
  const TOTAL_STEPS = 4

  const validateStep = (s) => {
    setFormErr('')
    if (s === 1) {
      if (!form.title.trim()) { setFormErr('Title is required.'); return false }
    }
    return true
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setSlideDir('next')
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS))
    setFormErr('')
  }

  const goBack = () => {
    setSlideDir('back')
    setStep(prev => Math.max(prev - 1, 1))
    setFormErr('')
  }

  // ── Parse newline-delimited text to JSON arrays ────────────────────────
  const toArray = (text) =>
    text.trim() ? text.split('\n').map(l => l.trim()).filter(Boolean) : []

  const handleSave = async () => {
    if (!form.title.trim()) { setFormErr('Title is required.'); setStep(1); return }
    setSaving(true); setFormErr('')
    try {
      const payload = {
        title:           form.title,
        description:     form.description,
        location:        form.location,
        duration:        form.duration,
        max_group_size:  form.max_group_size === '' ? null : Number(form.max_group_size),
        is_active:       form.is_active,
        is_featured:     form.is_featured,
        highlights:      toArray(form.highlights),
        inclusions:      toArray(form.inclusions),
        exclusions:      toArray(form.exclusions),
        itinerary:       toArray(form.itinerary),
      }

      let tourId
      if (modal === 'create') {
        const created = await api.tours.create(payload)
        tourId = created.id
      } else {
        await api.tours.update(editing.id, payload)
        tourId = editing.id
      }

      // Upload new media files
      if (mediaFiles.length > 0 && tourId) {
        setMediaUploading(true)
        const fd = new FormData()
        mediaFiles.forEach(f => fd.append('file', f))
        try {
          await api.tours.upload(tourId, fd)
        } catch (uploadErr) {
          addToast({
            message: uploadErr?.data?.detail ?? `Tour saved but media upload failed: ${uploadErr?.message}`,
            type: 'warning'
          })
        }
        setMediaUploading(false)
      }

      addToast({ message: modal === 'create' ? 'Tour created.' : 'Tour updated.', type: 'success' })
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
      await api.tours.delete(editing.id)
      addToast({ message: 'Tour deleted.', type: 'success' })
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
            placeholder="Search tours…"
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
            value={filterActive}
            onChange={e => setFilterActive(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <Button variant="primary" size="sm" icon={<IconPlus />} onClick={openCreate}>
          New Tour
        </Button>
      </div>

      {/* ── Count bar ───────────────────────────────────────────────── */}
      {!loading && (
        <div className={s.countBar}>
          <span className={s.countLabel}>
            {total} tour{total !== 1 ? 's' : ''}
            {search || filterFeat || filterActive ? ' matching filters' : ' total'}
          </span>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className={s.tableWrap}>
        {loading ? (
          <Spinner centered size="lg" />
        ) : tours.length === 0 ? (
          <EmptyState
            icon={<IconCompass />}
            title="No tours found"
            description={search || filterFeat || filterActive
              ? 'No tours match your current filters. Try adjusting your search.'
              : 'You have not created any tours yet.'}
            action={<Button variant="primary" size="sm" icon={<IconPlus />} onClick={openCreate}>New Tour</Button>}
          />
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.colTitle}>Tour</th>
                <th className={s.colLocation}>Location</th>
                <th className={s.colDuration}>Duration</th>
                <th className={s.colStatus}>Status</th>
                <th className={s.colActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map(tour => (
                <tr key={tour.id} className={s.row}>
                  <td className={s.colTitle}>
                    <span className={s.title}>{tour.title}</span>
                    {tour.description && (
                      <span className={s.sub}>
                        {tour.description.length > 60
                          ? tour.description.slice(0, 60) + '…'
                          : tour.description}
                      </span>
                    )}
                  </td>
                  <td className={`${s.colLocation} ${s.muted}`}>
                    {tour.location || <span className={s.na}>—</span>}
                  </td>
                  <td className={`${s.colDuration} ${s.muted}`}>
                    {tour.duration || <span className={s.na}>—</span>}
                  </td>
                  <td className={s.colStatus}>
                    <div className={s.badges}>
                      {tour.is_featured && <Badge variant="gold">Featured</Badge>}
                      <Badge variant={tour.is_active ? 'success' : 'default'}>
                        {tour.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </td>
                  <td className={s.colActions}>
                    <div className={s.actionBtns}>
                      <button
                        className={s.iconBtn}
                        onClick={() => openEdit(tour)}
                        title="Edit tour"
                        aria-label="Edit tour"
                      >
                        <IconEdit />
                      </button>
                      <button
                        className={`${s.iconBtn} ${s.iconBtnDanger}`}
                        onClick={() => openDelete(tour)}
                        title="Delete tour"
                        aria-label="Delete tour"
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

      {/* ── Create / Edit wizard modal ─────────────────────────────── */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        title={modal === 'create' ? 'New Tour' : 'Edit Tour'}
        onClose={closeModal}
        width={660}
        footer={
          <div className={s.wizardFooter}>
            <div className={s.wizardFooterLeft}>
              {formErr && <span className={s.err}>{formErr}</span>}
              {!formErr && <span className={s.stepCounter}>Step {step} of {TOTAL_STEPS}</span>}
            </div>
            <div className={s.wizardFooterRight}>
              {step > 1 && (
                <Button variant="ghost" size="sm" onClick={goBack} disabled={saving || mediaUploading}>
                  Back
                </Button>
              )}
              {step < TOTAL_STEPS ? (
                <Button variant="primary" size="sm" onClick={goNext}>
                  Next
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleSave} loading={saving || mediaUploading}>
                  {modal === 'create' ? 'Create Tour' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        }
      >
        {/* ── Stepper bar ──────────────────────────────────────── */}
        <div className={s.stepper}>
          {STEPS.map((st) => {
            const isDone   = step > st.num
            const isActive = step === st.num
            const cls = [s.stepItem, isDone && s.stepDone, isActive && s.stepActive].filter(Boolean).join(' ')
            return (
              <div key={st.num} className={cls}>
                <div className={s.stepCircle}>
                  {isDone ? <IconCheck /> : st.num}
                </div>
                <span className={s.stepLabel}>{st.label}</span>
              </div>
            )
          })}
        </div>

        {/* ── Step panes ─────────────────────────────────────────── */}
        <div className={s.stepSlider}>

          {/* ── Step 1: Basic Info ──────────────────────────────── */}
          {step === 1 && (
            <div className={s.stepPane} key="step-1" data-dir={slideDir === 'back' ? 'back' : undefined}>
              <div className={s.stepTitle}>
                <IconFileText /> Basic Information
              </div>
              <div className={s.form}>
                <div className={s.formGroup}>
                  <label className={s.label} htmlFor="tour-title">Title <span className={s.req}>*</span></label>
                  <input id="tour-title" className={s.input} name="title" value={form.title} onChange={handleChange} placeholder="e.g. Cape Coast Heritage Tour" autoFocus />
                </div>
                <div className={s.formGroup}>
                  <label className={s.label} htmlFor="tour-desc">Description</label>
                  <textarea id="tour-desc" className={s.textarea} name="description" rows={4} value={form.description} onChange={handleChange} placeholder="Brief description of the tour…" />
                </div>
                <div className={s.row2}>
                  <div className={s.formGroup}>
                    <label className={s.label} htmlFor="tour-loc">Location</label>
                    <input id="tour-loc" className={s.input} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Cape Coast, Ghana" />
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.label} htmlFor="tour-dur">Duration</label>
                    <input id="tour-dur" className={s.input} name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 3 Days / 2 Nights" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Settings ─────────────────────────────── */}
          {step === 2 && (
            <div className={s.stepPane} key="step-2" data-dir={slideDir === 'back' ? 'back' : undefined}>
              <div className={s.stepTitle}>
                <IconList /> Settings
              </div>
              <div className={s.form}>
                <div className={s.formGroup}>
                  <label className={s.label} htmlFor="tour-group">Max Group Size</label>
                  <input id="tour-group" className={s.input} type="number" min="1" name="max_group_size" value={form.max_group_size} onChange={handleChange} placeholder="Leave blank for unlimited" />
                  <span className={s.hint}>Maximum number of travellers per group booking.</span>
                </div>
                <div className={s.row2}>
                  <div className={s.formGroup}>
                    <label className={s.checkLabel}>
                      <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                      <span>Active (visible to public)</span>
                    </label>
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.checkLabel}>
                      <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
                      <span>Mark as featured</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Content (highlights, inclusions, exclusions, itinerary) */}
          {step === 3 && (
            <div className={s.stepPane} key="step-3" data-dir={slideDir === 'back' ? 'back' : undefined}>
              <div className={s.stepTitle}>
                <IconList /> Tour Content
              </div>
              <div className={s.form}>
                <div className={s.formGroup}>
                  <label className={s.label} htmlFor="tour-highlights">Highlights</label>
                  <textarea id="tour-highlights" className={s.textarea} name="highlights" rows={3} value={form.highlights} onChange={handleChange} placeholder={"One per line, e.g.:\nGuided tour of Cape Coast Castle\nCanopy walkway at Kakum"} autoFocus />
                  <span className={s.hint}>Key selling points — one per line.</span>
                </div>
                <div className={s.row2}>
                  <div className={s.formGroup}>
                    <label className={s.label} htmlFor="tour-inclusions">Inclusions</label>
                    <textarea id="tour-inclusions" className={s.textarea} name="inclusions" rows={3} value={form.inclusions} onChange={handleChange} placeholder={"Hotel accommodation\nBreakfast daily\nTransport"} />
                    <span className={s.hint}>What's included — one per line.</span>
                  </div>
                  <div className={s.formGroup}>
                    <label className={s.label} htmlFor="tour-exclusions">Exclusions</label>
                    <textarea id="tour-exclusions" className={s.textarea} name="exclusions" rows={3} value={form.exclusions} onChange={handleChange} placeholder={"International flights\nTravel insurance\nPersonal expenses"} />
                    <span className={s.hint}>What's NOT included — one per line.</span>
                  </div>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label} htmlFor="tour-itinerary">Itinerary</label>
                  <textarea id="tour-itinerary" className={s.textarea} name="itinerary" rows={4} value={form.itinerary} onChange={handleChange} placeholder={"Day 1: Arrive in Accra, transfer to hotel\nDay 2: Cape Coast Castle & Kakum\nDay 3: Departure"} />
                  <span className={s.hint}>Day-by-day plan — one day per line.</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Media Upload ─────────────────────────────── */}
          {step === 4 && (
            <div className={s.stepPane} key="step-4" data-dir={slideDir === 'back' ? 'back' : undefined}>
              <div className={s.stepTitle}>
                <IconImage /> Media
              </div>
              <div className={s.form}>
                <div className={s.mediaDivider}>
                  <span className={s.mediaDividerText}>Files ({existingMedia.length + mediaFiles.length} / {MAX_MEDIA})</span>
                </div>

                {/* Existing media thumbnails */}
                {existingMedia.length > 0 && (
                  <div className={s.previewGrid}>
                    {existingMedia.map(m => (
                      <div key={m.id} className={s.previewItem}>
                        {m.media_type === 'video'
                          ? <div className={s.previewVideoThumb}><IconPlay /></div>
                          : <img src={m.file_url} alt={m.caption ?? ''} className={s.previewImg} />
                        }
                        <button
                          type="button"
                          className={s.previewRemove}
                          onClick={() => deleteExistingMedia(m.id)}
                          title="Delete media"
                          aria-label="Delete media"
                        >
                          <IconX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New file previews */}
                {mediaFiles.length > 0 && (
                  <div className={s.previewGrid}>
                    {mediaFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className={`${s.previewItem} ${s.previewItemNew}`}>
                        {file.type.startsWith('video/')
                          ? <div className={s.previewVideoThumb}><IconPlay /></div>
                          : <img src={URL.createObjectURL(file)} alt={file.name} className={s.previewImg} />
                        }
                        <span className={s.previewName}>{file.name}</span>
                        <button
                          type="button"
                          className={s.previewRemove}
                          onClick={() => removeNewFile(idx)}
                          title="Remove file"
                          aria-label={`Remove ${file.name}`}
                        >
                          <IconX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                {availableSlots - mediaFiles.length > 0 && (
                  <div className={s.fileWrap}>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className={s.fileInput}
                      onChange={e => { handleMediaFiles(e.target.files); e.target.value = '' }}
                    />
                    <IconUpload />
                    <span className={s.filePlaceholder}>
                      Add up to {availableSlots - mediaFiles.length} more file{availableSlots - mediaFiles.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Delete confirmation modal ────────────────────────────────── */}
      <Modal
        open={modal === 'delete'}
        title="Delete Tour"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <Button variant="ghost"  size="sm" onClick={closeModal}   disabled={saving}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>Delete Tour</Button>
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
              This will permanently remove the tour and all associated media. This cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  )
}
