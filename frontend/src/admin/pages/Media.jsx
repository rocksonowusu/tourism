import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './Media.module.css'
import { usePageTitle } from '../hooks/usePageTitle'

// ── Icons ─────────────────────────────────────────────────────────────────
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const IconPlayCircle = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
  </svg>
)
const IconImage = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IconWarning = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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

const TYPE_LABELS = { image: 'Image', video: 'Video' }
const MAX_MEDIA = 5

export default function Media() {
  const { addToast } = useToast()
  usePageTitle('Media Library')
  const [tab,     setTab]     = useState('events')   // 'events' | 'sites'
  const [items,   setItems]   = useState([])
  const [events,  setEvents]  = useState([])
  const [sites,   setSites]   = useState([])
  const [loading, setLoading] = useState(true)
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const PAGE_SIZE = 20

  const [filterType,   setFilterType]   = useState('')
  const [filterParent, setFilterParent] = useState('')

  const [uploadModal,  setUploadModal]  = useState(false)
  const [uploadFiles,  setUploadFiles]  = useState([])   // array of File objects
  const [uploadCapt,   setUploadCapt]   = useState('')
  const [uploadSite,   setUploadSite]   = useState('')
  const [uploadEvent,  setUploadEvent]  = useState('')
  const [uploading,    setUploading]    = useState(false)
  const [uploadErr,    setUploadErr]    = useState('')
  const [parentMediaCount, setParentMediaCount] = useState(0)

  const [delItem,  setDelItem]  = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ── Data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (filterType)   params.media_type = filterType
      if (filterParent) {
        if (tab === 'events') params.event = filterParent
        else                  params.tourist_site = filterParent
      }
      const fn   = tab === 'events' ? api.eventMedia.list : api.siteMedia.list
      const data = await fn(params)
      setItems(data?.results ?? data ?? [])
      setTotal(data?.count   ?? (data?.length ?? 0))
    } catch (e) { console.error(e) }
    finally      { setLoading(false) }
  }, [tab, page, filterType, filterParent])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1); setFilterParent('') }, [tab])
  useEffect(() => { setPage(1) }, [filterType, filterParent])

  useEffect(() => {
    api.events.list({ page_size: 200 }).then(d => setEvents(d?.results ?? d ?? [])).catch(() => {})
    api.sites.list({ page_size: 200 }).then(d => setSites(d?.results ?? d ?? [])).catch(() => {})
  }, [])

  // ── Upload ────────────────────────────────────────────────────────────
  const openUpload = () => {
    setUploadFiles([]); setUploadCapt(''); setUploadSite(''); setUploadEvent('')
    setUploadErr(''); setParentMediaCount(0)
    setUploadModal(true)
  }

  // Fetch existing media count when parent changes
  const handleParentChange = async (id) => {
    if (tab === 'events') setUploadEvent(id)
    else                  setUploadSite(id)
    if (!id) { setParentMediaCount(0); return }
    try {
      const fn = tab === 'events' ? api.events.detail : api.sites.detail
      const data = await fn(Number(id))
      setParentMediaCount(data?.media_count ?? data?.media?.length ?? 0)
    } catch { setParentMediaCount(0) }
  }

  const availableSlots = MAX_MEDIA - parentMediaCount

  const handleFilesSelected = (fileList) => {
    const newFiles = Array.from(fileList)
    setUploadFiles(prev => {
      const combined = [...prev, ...newFiles]
      if (combined.length > availableSlots) {
        setUploadErr(`Only ${availableSlots} slot(s) remaining. You selected ${combined.length} file(s).`)
        return combined.slice(0, Math.max(availableSlots, 0))
      }
      setUploadErr('')
      return combined
    })
  }

  const removeFile = (index) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index))
    setUploadErr('')
  }

  const handleUpload = async () => {
    if (uploadFiles.length === 0) { setUploadErr('Please select at least one file.'); return }
    const parentId = tab === 'events' ? uploadEvent : uploadSite
    if (!parentId) { setUploadErr(`Please select a ${tab === 'events' ? 'event' : 'site'}.`); return }
    if (uploadFiles.length > availableSlots) {
      setUploadErr(`Only ${availableSlots} slot(s) remaining (max ${MAX_MEDIA} per ${tab === 'events' ? 'event' : 'site'}).`)
      return
    }

    const form = new FormData()
    uploadFiles.forEach(f => form.append('file', f))
    if (uploadCapt) form.append('caption', uploadCapt)

    setUploading(true); setUploadErr('')
    try {
      const fn = tab === 'events' ? api.events.upload : api.sites.upload
      await fn(Number(parentId), form)
      addToast({ message: `${uploadFiles.length} file(s) uploaded successfully.`, type: 'success' })
      setUploadModal(false)
      load()
    } catch (e) {
      setUploadErr(e?.data?.detail ?? e?.message ?? 'Upload failed.')
    } finally { setUploading(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const fn = tab === 'events' ? api.eventMedia.delete : api.siteMedia.delete
      await fn(delItem.id)
      addToast({ message: 'Media deleted.', type: 'success' })
      setDelItem(null)
      load()
    } catch (e) { console.error(e) }
    finally     { setDeleting(false) }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const parents    = tab === 'events' ? events : sites

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={s.page}>

      {/* Tabs + toolbar */}
      <div className={s.topRow}>
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${tab === 'events' ? s.tabActive : ''}`}
            onClick={() => setTab('events')}
          >
            <IconCalendar /> Event Media
          </button>
          <button
            className={`${s.tab} ${tab === 'sites' ? s.tabActive : ''}`}
            onClick={() => setTab('sites')}
          >
            <IconMapPin /> Site Media
          </button>
        </div>
        <div className={s.filters}>
          <select className={s.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <select className={s.select} value={filterParent} onChange={e => setFilterParent(e.target.value)}>
            <option value="">All {tab === 'events' ? 'events' : 'sites'}</option>
            {parents.map(p => <option key={p.id} value={p.id}>{p.title ?? p.name}</option>)}
          </select>
        </div>
        <Button variant="primary" size="sm" icon={<IconUpload />} onClick={openUpload}>
          Upload
        </Button>
      </div>

      {/* Count */}
      {!loading && (
        <div className={s.countBar}>
          <span className={s.countLabel}>
            {total} file{total !== 1 ? 's' : ''}{filterType || filterParent ? ' matching filters' : ' total'}
          </span>
        </div>
      )}

      {/* Gallery */}
      {loading ? (
        <Spinner centered size="lg" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconImage />}
          title="No media found"
          description="Try changing your filters or upload new media."
          action={
            <Button variant="primary" size="sm" icon={<IconUpload />} onClick={openUpload}>
              Upload
            </Button>
          }
        />
      ) : (
        <div className={s.gallery}>
          {items.map(item => (
            <div key={item.id} className={s.card}>
              {item.media_type === 'video' ? (
                <div className={s.videoThumb}>
                  <video src={item.file_url} className={s.video} muted />
                  <span className={s.videoIcon}><IconPlayCircle /></span>
                </div>
              ) : (
                <img src={item.file_url} alt={item.caption ?? ''} className={s.img} loading="lazy" />
              )}
              <div className={s.cardBody}>
                <div className={s.cardMeta}>
                  <Badge variant={item.media_type === 'video' ? 'info' : 'default'}>
                    {TYPE_LABELS[item.media_type] ?? item.media_type}
                  </Badge>
                  {item.is_featured && <Badge variant="gold">Featured</Badge>}
                </div>
                {item.caption && <p className={s.caption}>{item.caption}</p>}
                <p className={s.parentName}>
                  {item[tab === 'events' ? 'event' : 'tourist_site']?.title
                    ?? item[tab === 'events' ? 'event' : 'tourist_site']?.name
                    ?? '—'}
                </p>
              </div>
              <button
                className={s.delOverlay}
                onClick={() => setDelItem(item)}
                title="Delete media"
                aria-label="Delete media"
              >
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={s.pagination}>
          <button className={s.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1} aria-label="Previous page"><IconChevLeft /></button>
          <span className={s.pageInfo}>Page {page} of {totalPages}</span>
          <button className={s.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages} aria-label="Next page"><IconChevRight /></button>
        </div>
      )}

      {/* Upload modal */}
      <Modal
        open={uploadModal}
        title={`Upload ${tab === 'events' ? 'Event' : 'Site'} Media`}
        onClose={() => setUploadModal(false)}
        width={560}
        footer={
          <div className={s.modalFooter}>
            {uploadErr && <span className={s.err}>{uploadErr}</span>}
            <Button variant="ghost"   size="sm" onClick={() => setUploadModal(false)} disabled={uploading}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleUpload} loading={uploading}>
              Upload {uploadFiles.length > 0 ? `(${uploadFiles.length})` : ''}
            </Button>
          </div>
        }
      >
        <div className={s.form}>
          <div className={s.formGroup}>
            <label className={s.label} htmlFor="m-parent">
              {tab === 'events' ? 'Event' : 'Site'} <span className={s.req}>*</span>
            </label>
            <select
              id="m-parent"
              className={s.input}
              value={tab === 'events' ? uploadEvent : uploadSite}
              onChange={e => handleParentChange(e.target.value)}
            >
              <option value="">— select —</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.title ?? p.name}</option>)}
            </select>
          </div>

          {/* Slot indicator */}
          {(uploadEvent || uploadSite) && (
            <div className={s.slotBar}>
              <span className={s.slotLabel}>
                {parentMediaCount} / {MAX_MEDIA} media slots used
              </span>
              <div className={s.slotTrack}>
                <div className={s.slotFill} style={{ width: `${(parentMediaCount / MAX_MEDIA) * 100}%` }} />
              </div>
              <span className={s.slotRemaining}>
                {availableSlots > 0
                  ? `${availableSlots} slot${availableSlots !== 1 ? 's' : ''} remaining`
                  : 'No slots available — delete existing media first'}
              </span>
            </div>
          )}

          <div className={s.formGroup}>
            <label className={s.label}>
              Files <span className={s.req}>*</span>
              <span className={s.labelHint}> (max {MAX_MEDIA} per {tab === 'events' ? 'event' : 'site'})</span>
            </label>
            <div className={`${s.fileWrap} ${availableSlots <= 0 ? s.fileWrapDisabled : ''}`}>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className={s.fileInput}
                disabled={availableSlots <= 0}
                onChange={e => { handleFilesSelected(e.target.files); e.target.value = '' }}
              />
              <IconUpload />
              <span className={s.filePlaceholder}>
                {availableSlots <= 0 ? 'Max files reached' : 'Click to browse or drag & drop (select up to ' + availableSlots + ')'}
              </span>
            </div>
          </div>

          {/* File preview grid */}
          {uploadFiles.length > 0 && (
            <div className={s.previewGrid}>
              {uploadFiles.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className={s.previewItem}>
                  {file.type.startsWith('video/')
                    ? <div className={s.previewVideoThumb}><IconPlayCircle /></div>
                    : <img src={URL.createObjectURL(file)} alt={file.name} className={s.previewImg} />
                  }
                  <span className={s.previewName}>{file.name}</span>
                  <button
                    type="button"
                    className={s.previewRemove}
                    onClick={() => removeFile(idx)}
                    title="Remove file"
                    aria-label={`Remove ${file.name}`}
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={s.formGroup}>
            <label className={s.label} htmlFor="m-capt">Caption</label>
            <input id="m-capt" className={s.input} value={uploadCapt} onChange={e => setUploadCapt(e.target.value)} placeholder="Optional caption (shared across all files)" />
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!delItem}
        title="Delete Media"
        onClose={() => setDelItem(null)}
        width={400}
        footer={
          <div className={s.modalFooter}>
            <Button variant="ghost"  size="sm" onClick={() => setDelItem(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}           loading={deleting}>Delete</Button>
          </div>
        }
      >
        <div className={s.deleteBody}>
          <div className={s.deleteIcon}><IconWarning /></div>
          <div className={s.deleteText}>
            <p className={s.deleteMsg}>Delete this {delItem?.media_type ?? 'file'}?</p>
            <p className={s.deleteHint}>This action cannot be undone.</p>
          </div>
        </div>
      </Modal>

    </div>
  )
}
