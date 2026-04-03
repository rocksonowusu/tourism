/**
 * NotificationContext
 * ─────────────────────────────────────────────────────────────────────────
 * Provides admin notifications state:
 *   - unreadCount (polled every 30s)
 *   - recent notifications list
 *   - markRead / markAllRead helpers
 *   - Browser Notification API integration (desktop push)
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../../api/client'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider')
  return ctx
}

const POLL_INTERVAL = 30_000  // 30 seconds

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const isAdmin  = user?.is_staff

  const [unreadCount, setUnreadCount]   = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]           = useState(false)
  const prevUnread = useRef(0)

  // ── Request browser notification permission on mount ─────────────────
  useEffect(() => {
    if (!isAdmin) return
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [isAdmin])

  // ── Fetch unread count ───────────────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!isAdmin) return
    try {
      const data = await api.notifications.unreadCount()
      const newCount = data.count ?? 0

      // Show browser notification if count went UP
      if (newCount > prevUnread.current && prevUnread.current >= 0) {
        const diff = newCount - prevUnread.current
        showBrowserNotification(diff)
      }

      prevUnread.current = newCount
      setUnreadCount(newCount)
    } catch {
      // silently ignore (e.g. logged-out)
    }
  }, [isAdmin])

  // ── Fetch recent notifications ───────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const data = await api.notifications.list({ page_size: 20 })
      setNotifications(data.results ?? data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  // ── Poll unread count ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return
    fetchUnreadCount()
    const id = setInterval(fetchUnreadCount, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [isAdmin, fetchUnreadCount])

  // ── Mark one as read ─────────────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    try {
      await api.notifications.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* ignore */ }
  }, [])

  // ── Mark all as read ─────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch { /* ignore */ }
  }, [])

  // ── Refresh (re-fetch list + count) ──────────────────────────────────
  const refresh = useCallback(() => {
    fetchUnreadCount()
    fetchNotifications()
  }, [fetchUnreadCount, fetchNotifications])

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      notifications,
      loading,
      fetchNotifications,
      markRead,
      markAllRead,
      refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

// ── Browser Notification helper ──────────────────────────────────────────

function showBrowserNotification(count) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const title = '1957 The Ghana Experience'
  const body  = count === 1
    ? 'You have a new notification'
    : `You have ${count} new notifications`

  try {
    new Notification(title, {
      body,
      icon: '/assets/Logo.PNG',
      badge: '/assets/Logo.PNG',
      tag: 'admin-notification',        // collapse duplicate notifications
      renotify: true,
    })
  } catch {
    // Desktop Notification API may fail in some environments
  }
}
