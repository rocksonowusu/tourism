import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './Sites.module.css'
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
const IconMapPin = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
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

const MAX_MEDIA = 5

const EMPTY_FORM = {
  name: '', description: '', location: '', is_featured: false,
}

export default function Sites() {
  const { addToast } = useToast()
  usePageTitle('Tourist Sites')
  const [sites,   setSites]   = useState([])
  const [loading, setLoading] = useState(true)
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const PAGE_SIZE = 15

  const [search,     setSearch]     = useState('')
  const [filterFeat, setFilterFeat] = useState('')

  const [modal,   setModal]   = useState(null)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY_FORM)
  const [saving,  setSaving]  = useState(false)
  const [formErr, setFormErr] = useState('')

  // Media upload state
  const [mediaFiles,      setMediaFiles]      = useState([])   // File objects to upload
  const [existingMedia,   setExistingMedia]    = useState([])   // already uploaded media
  const [mediaUploading,  setMediaUploading]   = useState(false)

  // ── Data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search)     params.search      = search
      if (filterFeat) params.is_featured = filterFeat
      const data = await api.sites.list(params)
      setSites(data?.results ?? data ?? [])
      setTotal(data?.count   ?? (data?.length ?? 0))
    } catch (e) { console.error(e) }
    finally      { setLoading(false) }
  }, [page, search, filterFeat])

  useEffect(() => { load() },     [load])
  useEffect(() => { setPage(1) }, [search, filterFeat])

  // ── Form helpers ──────────────────────────────────────────────────────
  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormErr(''); setMediaFiles([]); setExistingMedia([]); setModal('create') }
  const openEdit   = async (st) => {
    setEditing(st)
    setFormErr(''); setMediaFiles([])
    
    // Fetch full site details (list endpoint doesn't include all fields like description)
    try {
      const detail = await api.sites.detail(st.id)
      setForm({ name: detail.name ?? '', description: detail.description ?? '', location: detail.location ?? '', is_featured: detail.is_featured ?? false })
      setExistingMedia(detail?.media ?? [])
    } catch (e) {
      // Fallback to list data if detail fetch fails
      setForm({ name: st.name ?? '', description: st.description ?? '', location: st.location ?? '', is_featured: st.is_featured ?? false })
      setExistingMedia([])
    }
    setModal('edit')
  }
  const openDelete = (st) => { setEditing(st); setFormErr(''); setModal('delete') }
  const closeModal = () => { setModal(null); setEditing(null); setMediaFiles([]); setExistingMedia([]) }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  // Media helpers
  const totalMediaCount = existingMedia.length + mediaFiles.length
  const availableSlots  = MAX_MEDIA - existingMedia.length

  const handleMediaFiles = (fileList) => {
    const newFiles = Array.from(fileList)
    setMediaFiles(prev => {
      const combined = [...prev, ...newFiles]
      const maxNew = Math.max(availableSlots - prev.length, 0)
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
      await api.siteMedia.delete(mediaId)
      setExistingMedia(prev => prev.filter(m => m.id !== mediaId))
      addToast({ message: 'Media deleted.', type: 'success' })
    } catch (e) {
      addToast({ message: e?.message ?? 'Failed to delete media.', type: 'error' })
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setFormErr('Name is required.'); return }
    setSaving(true); setFormErr('')
    try {
      let siteId
      if (modal === 'create') {
        const created = await api.sites.create(form)
        siteId = created.id
      } else {
        await api.sites.update(editing.id, form)
        siteId = editing.id
      }

      // Upload new media files if any
      if (mediaFiles.length > 0 && siteId) {
        setMediaUploading(true)
        const fd = new FormData()
        mediaFiles.forEach(f => fd.append('file', f))
        try {
          await api.sites.upload(siteId, fd)
        } catch (uploadErr) {
          addToast({
            message: uploadErr?.data?.detail ?? `Site saved but media upload failed: ${uploadErr?.message}`,
            type: 'warning'
          })
        }
        setMediaUploading(false)
      }

      addToast({ message: modal === 'create' ? 'Site created.' : 'Site updated.', type: 'success' })
      closeModal(); load()
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
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await api.sites.delete(editing.id)
      addToast({ message: 'Site deleted.', type: 'success' })
      closeModal(); load() }
    catch (e) { setFormErr(e?.data?.detail ?? e?.message ?? 'Delete failed.') }
    finally { setSaving(false) }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={s.page}>

      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}><IconSearch /></span>
          <input
            className={s.search}
            placeholder="Search sites…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={s.filters}>
          <select className={s.select} value={filterFeat} onChange={e => setFilterFeat(e.target.value)}>
            <option value="">All types</option>
            <option value="true">Featured</option>
            <option value="false">Standard</option>
          </select>
        </div>
        <Button variant="primary" size="sm" icon={<IconPlus />} onClick={openCreate}>
          New Site
        </Button>
      </div>

      {/* Count */}
      {!loading && (
        <div className={s.countBar}>
          <span className={s.countLabel}>
            {total} site{total !== 1 ? 's' : ''}{search || filterFeat ? ' matching filters' : ' total'}
          </span>
        </div>
      )}

      {/* Table */}
      <div className={s.tableWrap}>
        {loading ? (
          <Spinner centered size="lg" />
        ) : sites.length === 0 ? (
          <EmptyState
            icon={<IconMapPin />}
            title="No sites found"
            description={search || filterFeat
              ? 'No sites match your current filters.'
              : 'You have not added any tourist sites yet.'}
            action={<Button variant="primary" size="sm" icon={<IconPlus />} onClick={openCreate}>New Site</Button>}
          />
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.colName}>Name</th>
                <th className={s.colLoc}>Location</th>
                <th className={s.colCount}>Events</th>
                <th className={s.colCount}>Media</th>
                <th className={s.colStatus}>Status</th>
                <th className={s.colActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(st => (
                <tr key={st.id} className={s.row}>
                  <td className={s.colName}>
                    <span className={s.title}>{st.name}</span>
                    {st.description && (
                      <span className={s.sub}>
                        {st.description.slice(0, 70)}{st.description.length > 70 ? '…' : ''}
                      </span>
                    )}
                  </td>
                  <td className={`${s.colLoc} ${s.muted}`}>{st.location ?? <span className={s.na}>—</span>}</td>
                  <td className={`${s.colCount} ${s.muted}`}>{st.upcoming_events_count ?? 0}</td>
                  <td className={`${s.colCount} ${s.muted}`}>{st.media_count ?? 0}</td>
                  <td className={s.colStatus}>
                    {st.is_featured
                      ? <Badge variant="gold">Featured</Badge>
                      : <Badge variant="default">Standard</Badge>}
                  </td>
                  <td className={s.colActions}>
                    <div className={s.actionBtns}>
                      <button className={s.iconBtn}                         onClick={() => openEdit(st)}   title="Edit site"   aria-label="Edit site">   <IconEdit />  </button>
                      <button className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => openDelete(st)} title="Delete site" aria-label="Delete site"> <IconTrash /> </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={s.pagination}>
          <button className={s.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1} aria-label="Previous page"><IconChevLeft /></button>
          <span className={s.pageInfo}>Page {page} of {totalPages}</span>
          <button className={s.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages} aria-label="Next page"><IconChevRight /></button>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        title={modal === 'create' ? 'New Tourist Site' : 'Edit Site'}
        onClose={closeModal}
        width={560}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <Button variant="ghost"   size="sm" onClick={closeModal}  disabled={saving || mediaUploading}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}  loading={saving || mediaUploading}>
              {modal === 'create' ? 'Create Site' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <div className={s.form}>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="st-name">Name <span className={s.req}>*</span></label>
            <input id="st-name" className={s.input} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Kakum National Park" />
          </div>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="st-desc">Description</label>
            <textarea id="st-desc" className={s.textarea} name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Brief overview of the site…" />
          </div>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="st-loc">Location</label>
            <input id="st-loc" className={s.input} name="location" value={form.location} onChange={handleChange} placeholder="Region, city or address" />
          </div>
          <label className={s.checkLabel}>
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
            <span>Mark as featured</span>
          </label>

          {/* ── Media section ──────────────────────────────────────── */}
          <div className={s.mediaDivider}>
            <span className={s.mediaDividerText}>Media ({existingMedia.length + mediaFiles.length} / {MAX_MEDIA})</span>
          </div>

          {/* Existing media thumbnails (edit mode) */}
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
      </Modal>

      {/* Delete modal */}
      <Modal
        open={modal === 'delete'}
        title="Delete Site"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <Button variant="ghost"  size="sm" onClick={closeModal}   disabled={saving}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>Delete Site</Button>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>Delete <strong>{editing?.name}</strong>?</p>
            <p className={s.deleteHint}>
              All associated events and media records will be affected. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  )
}

