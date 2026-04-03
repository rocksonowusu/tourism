import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Button     from '../components/ui/Button'
import Badge      from '../components/ui/Badge'
import Spinner    from '../components/ui/Spinner'
import Modal      from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import s from './CommunityProjects.module.css'
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
const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconHeart = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const MAX_MEDIA = 10

const EMPTY_FORM = {
  title: '', description: '', location: '', date: '',
  impact_summary: '', beneficiaries_count: '',
  is_featured: false,
}

/* ======================================================================= */

export default function CommunityProjects() {
  usePageTitle('Community Projects')

  /* ── State ────────────────────────────────────────────────────────── */
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const PAGE_SIZE = 10

  // modals
  const [showForm, setShowForm]       = useState(false)
  const [editing, setEditing]         = useState(null)   // null = create
  const [formData, setFormData]       = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [showDelete, setShowDelete]   = useState(null)
  const [showMedia, setShowMedia]     = useState(null)
  const [mediaFiles, setMediaFiles]   = useState([])
  const [uploading, setUploading]     = useState(false)

  const toast = useToast()

  /* ── Fetch ────────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE }
      if (search) params.search = search
      const res = await api.communityProjects.list(params)
      setItems(res.results || res)
      setTotal(res.count ?? 0)
    } catch {
      toast.error('Failed to load community projects')
    } finally { setLoading(false) }
  }, [page, search, toast])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  /* ── CRUD helpers ─────────────────────────────────────────────────── */
  function openCreate() {
    setEditing(null); setFormData(EMPTY_FORM); setShowForm(true)
  }
  function openEdit(item) {
    setEditing(item)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      date: item.date || '',
      impact_summary: item.impact_summary || '',
      beneficiaries_count: item.beneficiaries_count || '',
      is_featured: item.is_featured || false,
    })
    setShowForm(true)
  }
  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...formData, beneficiaries_count: Number(formData.beneficiaries_count) || 0 }
      if (!payload.date) delete payload.date
      if (editing) {
        await api.communityProjects.update(editing.id, payload)
        toast.success('Project updated')
      } else {
        await api.communityProjects.create(payload)
        toast.success('Project created')
      }
      setShowForm(false); load()
    } catch {
      toast.error('Failed to save project')
    } finally { setSaving(false) }
  }
  async function handleDelete() {
    try {
      await api.communityProjects.delete(showDelete.id)
      toast.success('Project deleted')
      setShowDelete(null); load()
    } catch {
      toast.error('Failed to delete project')
    }
  }

  /* ── Media helpers ────────────────────────────────────────────────── */
  async function openMedia(item) {
    setShowMedia(item)
    try {
      const res = await api.communityProjects.media(item.id)
      setMediaFiles(res)
    } catch { toast.error('Failed to load media') }
  }
  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const form = new FormData()
      files.forEach(f => form.append('file', f))
      await api.communityProjects.upload(showMedia.id, form)
      toast.success('Media uploaded')
      const res = await api.communityProjects.media(showMedia.id)
      setMediaFiles(res)
      load()
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }
  async function deleteMedia(id) {
    try {
      await api.communityProjectMedia.delete(id)
      setMediaFiles(prev => prev.filter(m => m.id !== id))
      toast.success('Media deleted')
      load()
    } catch { toast.error('Failed to delete media') }
  }

  function getThumb(item) {
    if (item.media?.length) {
      const img = item.media.find(m => m.media_type === 'image')
      return img ? (img.file_url || img.file) : null
    }
    return null
  }

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className={s.page}>
      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}><IconSearch /></span>
          <input className={s.search} placeholder="Search projects…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div style={{ flex: 1 }} />
        <Button variant="primary" size="sm" onClick={openCreate}>
          <IconPlus /> New Project
        </Button>
      </div>

      {/* Count */}
      <div className={s.countBar}>
        <span className={s.countLabel}>{total} project{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState icon={<IconHeart />} title="No community projects yet" description="Create your first project to showcase community impact." />
      ) : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Beneficiaries</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const thumb = getThumb(item)
                  return (
                    <tr key={item.id} className={s.row}>
                      <td style={{ width: 56 }}>
                        {thumb ? (
                          <img src={thumb} alt="" className={s.thumb} />
                        ) : (
                          <div className={s.thumbPlaceholder}>—</div>
                        )}
                      </td>
                      <td>
                        <span className={s.title}>{item.title}</span>
                        <span className={s.sub}>{item.media_count || 0} media</span>
                      </td>
                      <td className={s.muted}>{item.location}</td>
                      <td className={s.muted}>
                        {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className={s.muted}>{item.beneficiaries_count?.toLocaleString() || 0}</td>
                      <td>
                        <div className={s.badges}>
                          {item.is_featured && <Badge variant="gold">Featured</Badge>}
                        </div>
                      </td>
                      <td>
                        <div className={s.actions}>
                          <button className={s.actionBtn} title="Media" onClick={() => openMedia(item)}><IconUpload /></button>
                          <button className={s.actionBtn} title="Edit" onClick={() => openEdit(item)}><IconEdit /></button>
                          <button className={`${s.actionBtn} ${s.danger}`} title="Delete" onClick={() => setShowDelete(item)}><IconTrash /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={s.pagination}>
              <button className={s.pageBtn} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><IconChevLeft /></button>
              <span className={s.pageInfo}>{page} / {totalPages}</span>
              <button className={s.pageBtn} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><IconChevRight /></button>
            </div>
          )}
        </>
      )}

      {/* ── Create/Edit Modal ──────────────────────────────────────── */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Project' : 'New Project'}>
        <div className={s.formGrid}>
          <div className={s.formRow}>
            <label>Title *</label>
            <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className={s.formRow}>
            <label>Location *</label>
            <input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
          </div>
          <div className={s.formRow}>
            <label>Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div className={s.formRow}>
            <label>Beneficiaries Count</label>
            <input type="number" value={formData.beneficiaries_count} onChange={e => setFormData(p => ({ ...p, beneficiaries_count: e.target.value }))} />
          </div>
          <div className={`${s.formRow} ${s.full}`}>
            <label>Description *</label>
            <textarea rows="4" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className={`${s.formRow} ${s.full}`}>
            <label>Impact Summary</label>
            <textarea rows="2" value={formData.impact_summary} onChange={e => setFormData(p => ({ ...p, impact_summary: e.target.value }))} />
          </div>
          <div className={s.formRow}>
            <label className={s.checkLabel}>
              <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData(p => ({ ...p, is_featured: e.target.checked }))} />
              Featured
            </label>
          </div>
        </div>
        <div className={s.modalActions}>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !formData.title || !formData.description || !formData.location}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>

      {/* ── Delete Modal ───────────────────────────────────────────── */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Project">
        <div className={s.deleteBody}>
          <IconWarning />
          <p>Are you sure you want to delete <strong>{showDelete?.title}</strong>? This cannot be undone.</p>
        </div>
        <div className={s.modalActions}>
          <Button variant="ghost" onClick={() => setShowDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* ── Media Modal ────────────────────────────────────────────── */}
      <Modal open={!!showMedia} onClose={() => setShowMedia(null)} title={`Media – ${showMedia?.title || ''}`}>
        <div className={s.mediaGrid}>
          {mediaFiles.map(m => (
            <div key={m.id} className={s.mediaCard}>
              {m.media_type === 'video' ? (
                <video src={m.file_url || m.file} controls className={s.mediaThumb} />
              ) : (
                <img src={m.file_url || m.file} alt={m.caption} className={s.mediaThumb} />
              )}
              <button className={s.mediaDelete} onClick={() => deleteMedia(m.id)}><IconX /></button>
            </div>
          ))}
        </div>
        {mediaFiles.length < MAX_MEDIA && (
          <div className={s.uploadArea}>
            <label className={s.uploadLabel}>
              <IconUpload /> {uploading ? 'Uploading…' : 'Upload Media'}
              <input type="file" multiple accept="image/*,video/*" onChange={handleUpload} hidden disabled={uploading} />
            </label>
          </div>
        )}
      </Modal>
    </div>
  )
}
