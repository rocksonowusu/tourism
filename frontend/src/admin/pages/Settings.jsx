import React, { useEffect, useState, useCallback } from 'react'
import api from '../../api/client'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import { usePageTitle } from '../hooks/usePageTitle'
import s from './Settings.module.css'

// ── Icons ─────────────────────────────────────────────────────────────────

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const IconBuilding = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/>
    <line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/>
    <line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/>
    <rect x="9" y="18" width="6" height="4"/>
  </svg>
)
const IconWhatsApp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
)
const IconShare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)
const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

// Social platform icons
const IconFB = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
)
const IconIG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const IconTW = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
)
const IconTikTok = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.8.1v-3.5a6.37 6.37 0 0 0-.8-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 10.86 4.43A6.3 6.3 0 0 0 15.86 15V8.74a8.26 8.26 0 0 0 4.85 1.56V6.86a4.83 4.83 0 0 1-1.12-.17z"/></svg>
)
const IconYT = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
)
const IconLI = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
)

// ── Initial form state ───────────────────────────────────────────────────

const EMPTY = {
  company_name: '',
  phone: '',
  email: '',
  address: '',
  about_text: '',
  whatsapp_number: '',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  tiktok_url: '',
  youtube_url: '',
  linkedin_url: '',
}

// ── Component ────────────────────────────────────────────────────────────

export default function Settings() {
  usePageTitle('Settings')

  const { addToast } = useToast()
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [dirty, setDirty]     = useState(false)
  const [error, setError]     = useState(null)
  const [lastSaved, setLastSaved] = useState(null)

  // ── Load settings ──────────────────────────────────────────────────

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.siteSettings.get()
      setForm({
        company_name:    data.company_name    || '',
        phone:           data.phone           || '',
        email:           data.email           || '',
        address:         data.address         || '',
        about_text:      data.about_text      || '',
        whatsapp_number: data.whatsapp_number || '',
        facebook_url:    data.facebook_url    || '',
        instagram_url:   data.instagram_url   || '',
        twitter_url:     data.twitter_url     || '',
        tiktok_url:      data.tiktok_url      || '',
        youtube_url:     data.youtube_url     || '',
        linkedin_url:    data.linkedin_url    || '',
      })
      if (data.updated_at) {
        setLastSaved(new Date(data.updated_at))
      }
      setDirty(false)
    } catch (err) {
      setError(err.message || 'Failed to load settings')
      addToast({ message: 'Failed to load settings', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { loadSettings() }, [loadSettings])

  // ── Handlers ───────────────────────────────────────────────────────

  const handleChange = useCallback((field, e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setDirty(true)
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = await api.siteSettings.update(form)
      addToast({ message: 'Settings saved successfully!', type: 'success' })
      setDirty(false)
      if (data.updated_at) setLastSaved(new Date(data.updated_at))
    } catch (err) {
      addToast({ message: err.message || 'Failed to save settings', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // ── Render helpers ─────────────────────────────────────────────────

  const renderField = (label, field, placeholder, { hint, type = 'text', full = false, textarea = false } = {}) => (
    <div className={`${s.field} ${full ? s.fieldFull : ''}`} key={field}>
      <label className={s.label}>
        {label}
        {hint && <span className={s.labelHint}>({hint})</span>}
      </label>
      {textarea ? (
        <textarea
          className={`${s.input} ${s.textarea}`}
          value={form[field]}
          onChange={e => handleChange(field, e)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          className={s.input}
          type={type}
          value={form[field]}
          onChange={e => handleChange(field, e)}
          placeholder={placeholder}
        />
      )}
    </div>
  )

  const renderSocialField = (Icon, label, field, placeholder) => (
    <div className={s.socialRow} key={field}>
      <div className={s.socialIcon}><Icon /></div>
      <div className={`${s.field} ${s.socialInput}`}>
        <label className={s.label}>{label}</label>
        <input
          className={s.input}
          type="url"
          value={form[field]}
          onChange={e => handleChange(field, e)}
          placeholder={placeholder}
        />
      </div>
    </div>
  )

  // ── Loading / Error ────────────────────────────────────────────────

  if (loading) {
    return <div className={s.loading}><Spinner size={32} /></div>
  }

  if (error && !form.company_name) {
    return (
      <div className={s.error}>
        <p>{error}</p>
        <button className={s.saveBtn} onClick={loadSettings}>Retry</button>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <div className={s.titleRow}>
            <div className={s.titleIcon}><IconSettings /></div>
            <h1 className={s.title}>Settings</h1>
          </div>
          <p className={s.subtitle}>Manage your company information, social media links, and WhatsApp settings</p>
        </div>
        {lastSaved && (
          <span className={s.lastSaved}>
            Last saved: {lastSaved.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' '}at{' '}
            {lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Sections */}
      <div className={s.sections}>

        {/* ── Company Information ──────────────────────────────────── */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <div className={s.cardIcon}><IconBuilding /></div>
            <h2 className={s.cardTitle}>Company Information</h2>
          </div>
          <div className={s.fieldsGrid}>
            {renderField('Company Name', 'company_name', '1957 The Ghana Experience LBG')}
            {renderField('Email Address', 'email', 'info@theghanaexperience.com', { type: 'email' })}
            {renderField('Phone Number', 'phone', '+233 XX XXX XXXX')}
            {renderField('Address', 'address', 'Accra, Ghana')}
            {renderField('About / Tagline', 'about_text', 'A short description about your company…', { full: true, textarea: true })}
          </div>
        </div>

        {/* ── WhatsApp ────────────────────────────────────────────── */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <div className={s.cardIcon}><IconWhatsApp /></div>
            <h2 className={s.cardTitle}>WhatsApp Integration</h2>
          </div>
          <div className={s.fieldsGrid}>
            {renderField('WhatsApp Number', 'whatsapp_number', '233XXXXXXXXX', { hint: 'international format without +', full: true })}
          </div>
          <p style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            This number will be used for the floating WhatsApp button on your public website.
            Visitors can click it to start a chat with pre-filled messages.
          </p>
        </div>

        {/* ── Social Media Links ──────────────────────────────────── */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <div className={s.cardIcon}><IconShare /></div>
            <h2 className={s.cardTitle}>Social Media Links</h2>
          </div>
          <div className={s.fieldsGrid}>
            {renderSocialField(IconFB,     'Facebook',    'facebook_url',  'https://facebook.com/yourpage')}
            {renderSocialField(IconIG,     'Instagram',   'instagram_url', 'https://instagram.com/yourprofile')}
            {renderSocialField(IconTW,     'Twitter / X', 'twitter_url',   'https://twitter.com/yourhandle')}
            {renderSocialField(IconTikTok, 'TikTok',      'tiktok_url',    'https://tiktok.com/@yourhandle')}
            {renderSocialField(IconYT,     'YouTube',     'youtube_url',   'https://youtube.com/@yourchannel')}
            {renderSocialField(IconLI,     'LinkedIn',    'linkedin_url',  'https://linkedin.com/company/yourcompany')}
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className={s.saveBar}>
        {dirty && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Unsaved changes</span>}
        <button className={s.saveBtn} onClick={handleSave} disabled={saving || !dirty}>
          {saving ? <Spinner size={14} /> : <IconSave />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
