import React, { useState, useEffect, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import s from './SiteImages.module.css'

// ── Icons ─────────────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
)
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconArrowUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
)
const IconArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>
)
const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Component ────────────────────────────────────────────────────────────

export default function SiteImages() {
  usePageTitle('Site Images')
  const { addToast } = useToast()

  // ── State ────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('hero-backgrounds') 
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  // Modal state
  const [modal, setModal] = useState(null) 
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadFiles, setUploadFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])

  // ── Load data ────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let data
      if (tab === 'hero-backgrounds') {
        const resp = await api.heroBackground.list({ page_size: 50 })
        data = resp?.results ?? resp ?? []
      } else if (tab === 'hero-mosaic') {
        const resp = await api.heroMosaic.list({ page_size: 50 })
        data = resp?.results ?? resp ?? []
      } else {
        const resp = await api.eventsSectionBackground.list({ page_size: 50 })
        data = resp?.results ?? resp ?? []
      }
      setItems(data)
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { load() }, [tab, load])

  // ── Modal Handlers ────────────────────────────────────────────────────

  const closeModal = () => {
    setModal(null)
    setEditing(null)
    setForm({})
    setFormErr('')
    setUploadFiles([])
    setFilePreviews([])
  }

  const openCreate = () => {
    setForm(getEmptyForm())
    setUploadFiles([])
    setFilePreviews([])
    setFormErr('')
    setModal('create')
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      title: item.title ?? '',
      order: item.order ?? 0,
      is_active: item.is_active ?? true,
      position: item.position ?? 'cell1',
      alt_text: item.alt_text ?? '',
    })
    setUploadFiles([])
    setFilePreviews([item.image_url])
    setFormErr('')
    setModal('edit')
  }

  const openDelete = (item) => {
    setEditing(item)
    setModal('delete')
  }

  const getEmptyForm = () => {
    if (tab === 'hero-backgrounds') return { title: '', order: 0, is_active: true }
    if (tab === 'hero-mosaic') return { position: 'cell1', alt_text: '', is_active: true }
    return { title: '', order: 0, is_active: true }
  }

  // ── File Handlers ────────────────────────────────────────────────────────

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // For mosaic, only allow 1 file at a time (since there are only 3 positions)
    if (tab === 'hero-mosaic' && files.length > 1) {
      setFormErr('Mosaic allows only one image at a time (3 positions max).')
      e.target.value = ''
      return
    }

    const newFiles = tab === 'hero-mosaic' ? files : [...uploadFiles, ...files]
    setUploadFiles(newFiles)

    // Create previews for new files
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setFilePreviews(prev => tab === 'hero-mosaic' ? [reader.result] : [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  const removeFile = (idx) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== idx))
    setFilePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  // ── Save handler ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    setFormErr('')
    setSaving(true)

    try {
      // Validate required fields
      if (tab === 'hero-backgrounds' || tab === 'events-section') {
        if (!form.title?.trim()) {
          setFormErr('Title is required.')
          setSaving(false)
          return
        }
      } else if (tab === 'hero-mosaic') {
        if (!form.alt_text?.trim()) {
          setFormErr('Alt text is required.')
          setSaving(false)
          return
        }
      }

      if (modal === 'create' && uploadFiles.length === 0) {
        setFormErr('Please select at least one image.')
        setSaving(false)
        return
      }

      // For create mode, upload each file
      if (modal === 'create') {
        for (const file of uploadFiles) {
          const formData = new FormData()
          
          if (tab === 'hero-backgrounds' || tab === 'events-section') {
            formData.append('title', form.title)
            formData.append('order', form.order ?? 0)
            formData.append('is_active', form.is_active ?? true)
          } else if (tab === 'hero-mosaic') {
            formData.append('position', form.position ?? 'cell1')
            formData.append('alt_text', form.alt_text)
            formData.append('is_active', form.is_active ?? true)
          }

          formData.append('image', file)

          if (tab === 'hero-backgrounds') {
            await api.heroBackground.create(formData)
          } else if (tab === 'hero-mosaic') {
            await api.heroMosaic.create(formData)
          } else {
            await api.eventsSectionBackground.create(formData)
          }
        }
      } else {
        // Edit mode - update only if file is provided
        const formData = new FormData()
        
        if (tab === 'hero-backgrounds' || tab === 'events-section') {
          formData.append('title', form.title)
          formData.append('order', form.order ?? 0)
          formData.append('is_active', form.is_active ?? true)
        } else if (tab === 'hero-mosaic') {
          formData.append('position', form.position ?? 'cell1')
          formData.append('alt_text', form.alt_text)
          formData.append('is_active', form.is_active ?? true)
        }

        if (uploadFiles.length > 0) {
          formData.append('image', uploadFiles[0])
        }

        if (tab === 'hero-backgrounds') {
          await api.heroBackground.update(editing.id, formData)
        } else if (tab === 'hero-mosaic') {
          await api.heroMosaic.update(editing.id, formData)
        } else {
          await api.eventsSectionBackground.update(editing.id, formData)
        }
      }

      addToast({
        message: modal === 'create' ? `${uploadFiles.length} image(s) added.` : 'Image updated.',
        type: 'success'
      })
      closeModal()
      load()
    } catch (e) {
      const msg = e?.data?.detail ?? e?.data?.[Object.keys(e.data || {})[0]]?.[0] ?? e?.message ?? 'Failed to save.'
      setFormErr(msg)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete handler ───────────────────────────────────────────────────────

  const handleDelete = async () => {
    setSaving(true)
    try {
      if (tab === 'hero-backgrounds') {
        await api.heroBackground.delete(editing.id)
      } else if (tab === 'hero-mosaic') {
        await api.heroMosaic.delete(editing.id)
      } else {
        await api.eventsSectionBackground.delete(editing.id)
      }

      addToast({ message: 'Image deleted.', type: 'success' })
      closeModal()
      load()
    } catch (e) {
      addToast({ message: e?.message ?? 'Delete failed.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // ── Reorder handlers ─────────────────────────────────────────────────────

  const moveUp = async (item, idx) => {
    if (idx === 0) return
    const prev = items[idx - 1]
    try {
      await Promise.all([
        (tab === 'hero-backgrounds') ? api.heroBackground.update(item.id, { order: prev.order }) :
        (tab === 'hero-mosaic') ? api.heroMosaic.update(item.id, { position: prev.position }) :
        api.eventsSectionBackground.update(item.id, { order: prev.order }),
        (tab === 'hero-backgrounds') ? api.heroBackground.update(prev.id, { order: item.order }) :
        (tab === 'hero-mosaic') ? api.heroMosaic.update(prev.id, { position: item.position }) :
        api.eventsSectionBackground.update(prev.id, { order: item.order })
      ])
      load()
    } catch (e) {
      addToast({ message: 'Reorder failed.', type: 'error' })
    }
  }

  const moveDown = async (item, idx) => {
    if (idx === items.length - 1) return
    const next = items[idx + 1]
    try {
      await Promise.all([
        (tab === 'hero-backgrounds') ? api.heroBackground.update(item.id, { order: next.order }) :
        (tab === 'hero-mosaic') ? api.heroMosaic.update(item.id, { position: next.position }) :
        api.eventsSectionBackground.update(item.id, { order: next.order }),
        (tab === 'hero-backgrounds') ? api.heroBackground.update(next.id, { order: item.order }) :
        (tab === 'hero-mosaic') ? api.heroMosaic.update(next.id, { position: item.position }) :
        api.eventsSectionBackground.update(next.id, { order: item.order })
      ])
      load()
    } catch (e) {
      addToast({ message: 'Reorder failed.', type: 'error' })
    }
  }

  // ── Toggle active ────────────────────────────────────────────────────────

  const toggleActive = async (item) => {
    try {
      console.log('Toggling active for:', item.id, 'Current state:', item.is_active, 'New state:', !item.is_active)
      
      if (tab === 'hero-backgrounds') {
        await api.heroBackground.update(item.id, { is_active: !item.is_active })
      } else if (tab === 'hero-mosaic') {
        await api.heroMosaic.update(item.id, { is_active: !item.is_active })
      } else {
        await api.eventsSectionBackground.update(item.id, { is_active: !item.is_active })
      }
      
      addToast({ message: `Image ${!item.is_active ? 'hidden' : 'shown'}.`, type: 'success' })
      load()
    } catch (e) {
      console.error('Toggle error:', e)
      addToast({ message: e?.message ?? 'Toggle failed.', type: 'error' })
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const tabLabel = {
    'hero-backgrounds': 'Hero Background',
    'hero-mosaic': 'Hero Mosaic',
    'events-section': 'Events Section',
  }[tab]

  return (
    <div className={s.page}>
      {/* Tabs & Toolbar */}
      <div className={s.tabs}>
        <button
          className={`${s.tab} ${tab === 'hero-backgrounds' ? s.tabActive : ''}`}
          onClick={() => setTab('hero-backgrounds')}
        >
          Hero Background
        </button>
        <button
          className={`${s.tab} ${tab === 'hero-mosaic' ? s.tabActive : ''}`}
          onClick={() => setTab('hero-mosaic')}
        >
          Hero Mosaic
        </button>
        <button
          className={`${s.tab} ${tab === 'events-section' ? s.tabActive : ''}`}
          onClick={() => setTab('events-section')}
        >
          Events Section
        </button>
      </div>

      <div className={s.toolbar}>
        <h1 className={s.title}>{tabLabel} Images</h1>
        <Button variant="primary" size="sm" icon={<IconPlus />} onClick={openCreate}>
          Add Images
        </Button>
      </div>

      {/* Content */}
      <div className={s.card}>
        {loading ? (
          <div className={s.spinner}>
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className={s.emptyState}>
            <p>No images yet</p>
            <Button variant="primary" onClick={openCreate}>Add First Image</Button>
          </div>
        ) : (
          <div className={s.imageList}>
            {items.map((item, idx) => (
              <div key={item.id} className={s.imageRow} style={{ opacity: item.is_active ? 1 : 0.6 }}>
                {/* Image */}
                <div className={s.imageThumb} style={{ textDecoration: item.is_active ? 'none' : 'line-through', opacity: item.is_active ? 1 : 0.5 }}>
                  <img src={item.image_url} alt={item.alt_text || item.title || 'Image'} style={{ opacity: item.is_active ? 1 : 0.5 }} />
                  {!item.is_active && <div className={s.badge}>Hidden</div>}
                </div>

                {/* Info */}
                <div className={s.info} style={{ textDecoration: item.is_active ? 'none' : 'line-through' }}>
                  <div className={s.infoContent}>
                    {(tab === 'hero-backgrounds' || tab === 'events-section') && (
                      <div>
                        <p className={s.title2}>{item.title}</p>
                        <p className={s.meta}>Order: {item.order}</p>
                      </div>
                    )}
                    {tab === 'hero-mosaic' && (
                      <div>
                        <p className={s.title2}>{item.position_label || `Position: ${item.position}`}</p>
                        {item.alt_text && <p className={s.meta}>{item.alt_text}</p>}
                      </div>
                    )}
                    <p className={s.meta}>{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className={s.actions}>
                  <button
                    className={s.actionBtn}
                    title={item.is_active ? 'Hide' : 'Show'}
                    onClick={() => toggleActive(item)}
                  >
                    {item.is_active ? <IconEye /> : <IconEyeOff />}
                  </button>

                  {(tab === 'hero-backgrounds' || tab === 'events-section') && (
                    <>
                      <button
                        className={s.actionBtn}
                        title="Move up"
                        disabled={idx === 0}
                        onClick={() => moveUp(item, idx)}
                      >
                        <IconArrowUp />
                      </button>
                      <button
                        className={s.actionBtn}
                        title="Move down"
                        disabled={idx === items.length - 1}
                        onClick={() => moveDown(item, idx)}
                      >
                        <IconArrowDown />
                      </button>
                    </>
                  )}

                  <button
                    className={s.actionBtn}
                    title="Edit"
                    onClick={() => openEdit(item)}
                  >
                    <IconEdit />
                  </button>

                  <button
                    className={`${s.actionBtn} ${s.danger}`}
                    title="Delete"
                    onClick={() => openDelete(item)}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        title={modal === 'create' ? `Add ${tabLabel} Images` : `Edit ${tabLabel} Image`}
        onClose={closeModal}
        width={560}
        footer={
          <div className={s.modalFooter}>
            {formErr && <span className={s.err}>{formErr}</span>}
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
              {modal === 'create' ? 'Add Images' : 'Update'}
            </Button>
          </div>
        }
      >
        <div className={s.form}>
          {/* Image upload */}
          <div className={s.formGroup}>
            <label className={s.label}>
              {modal === 'create' ? 'Images' : 'Image'} <span className={s.req}>*</span>
            </label>
            <div className={s.fileWrap}>
              <input
                type="file"
                accept="image/*"
                multiple={modal === 'create' && tab !== 'hero-mosaic'}
                className={s.fileInput}
                onChange={handleFileSelect}
              />
              <IconUpload />
              <span className={s.filePlaceholder}>
                {modal === 'create' && tab !== 'hero-mosaic' ? 'Click to browse or drag & drop multiple images' : 'Click to browse'}
              </span>
            </div>

            {/* Preview grid */}
            {filePreviews.length > 0 && (
              <div className={s.previewGrid}>
                {filePreviews.map((preview, idx) => (
                  <div key={idx} className={s.previewItem}>
                    <img src={preview} alt={`Preview ${idx}`} />
                    {modal === 'create' && (
                      <button
                        className={s.removeBtn}
                        onClick={() => removeFile(idx)}
                        title="Remove"
                      >
                        <IconX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fields based on tab */}
          {(tab === 'hero-backgrounds' || tab === 'events-section') && (
            <>
              <div className={s.formGroup}>
                <label htmlFor="title" className={s.label}>
                  Title <span className={s.req}>*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className={s.input}
                  value={form.title ?? ''}
                  onChange={e => handleFormChange('title', e.target.value)}
                  placeholder="e.g., Beach Sunset"
                />
              </div>

              <div className={s.formGroup}>
                <label htmlFor="order" className={s.label}>Order</label>
                <input
                  id="order"
                  type="number"
                  className={s.input}
                  value={form.order ?? 0}
                  onChange={e => handleFormChange('order', Number(e.target.value))}
                />
              </div>
            </>
          )}

          {tab === 'hero-mosaic' && (
            <>
              <div className={s.formGroup}>
                <label htmlFor="position" className={s.label}>
                  Position <span className={s.req}>*</span>
                </label>
                <select
                  id="position"
                  className={s.input}
                  value={form.position ?? 'cell1'}
                  onChange={e => handleFormChange('position', e.target.value)}
                >
                  <option value="cell1">Cell 1 (Tall Left)</option>
                  <option value="cell2">Cell 2 (Top Right)</option>
                  <option value="cell3">Cell 3 (Bottom Right)</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--ash-medium)', marginTop: '4px' }}>
                  💡 Upload one image per position. Each position can only have one image.
                </p>
              </div>

              <div className={s.formGroup}>
                <label htmlFor="alt_text" className={s.label}>
                  Alt Text <span className={s.req}>*</span>
                </label>
                <input
                  id="alt_text"
                  type="text"
                  className={s.input}
                  value={form.alt_text ?? ''}
                  onChange={e => handleFormChange('alt_text', e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
            </>
          )}

          <div className={s.formGroup}>
            <label className={s.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.is_active ?? true}
                onChange={e => handleFormChange('is_active', e.target.checked)}
              />
              <span>Active (visible on public site)</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={modal === 'delete'}
        title="Delete Image"
        onClose={closeModal}
        width={420}
        footer={
          <div className={s.modalFooter}>
            <Button variant="ghost" size="sm" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={saving}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this image? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
