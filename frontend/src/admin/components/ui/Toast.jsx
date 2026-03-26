import React from 'react'
import { useToast } from '../../context/ToastContext'
import s from './Toast.module.css'

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const ICONS = { success: IconCheck, error: IconX, info: IconInfo }

export default function ToastStack() {
  const { toasts, dismiss } = useToast()

  if (!toasts.length) return null

  return (
    <div className={s.stack} role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(t => {
        const Icon = ICONS[t.type] ?? IconInfo
        return (
          <div key={t.id} className={`${s.toast} ${s[t.type]}`}>
            <span className={s.icon}><Icon /></span>
            <span className={s.message}>{t.message}</span>
            <button className={s.close} onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <IconClose />
            </button>
          </div>
        )
      })}
    </div>
  )
}
