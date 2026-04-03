/**
 * Notifications — full admin page listing all notifications.
 * Accessible via bell dropdown "View all notifications" or /admin/notifications.
 */

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useNotifications } from '../context/NotificationContext'
import styles from './Notifications.module.css'

const TYPE_LABELS = {
  review:              '⭐  Review',
  trip_request:        '✈️  Trip Request',
  custom_tour_request: '🗺️  Custom Tour',
  event_request:       '🎪  Event Request',
  event_booking:       '🎟️  Event Booking',
  accommodation_req:   '🏠  Accommodation',
  car_rental_req:      '🚗  Car Rental',
  system:              '🔔  System',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function Notifications() {
  const navigate = useNavigate()
  const { refresh } = useNotifications()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | unread

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page_size: 100 }
      if (filter === 'unread') params.is_read = false
      const data = await api.notifications.list(params)
      setNotifications(data.results ?? data)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      try { await api.notifications.markRead(notif.id) } catch {}
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
      refresh()
    }
    if (notif.link) navigate(notif.link)
  }

  const handleMarkAllRead = async () => {
    try { await api.notifications.markAllRead() } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    refresh()
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try { await api.notifications.delete(id) } catch {}
    setNotifications(prev => prev.filter(n => n.id !== id))
    refresh()
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>Notifications</h2>
          <p className={styles.subtitle}>{unreadCount} unread</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.filterTabs}>
            <button
              className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
              onClick={() => setFilter('all')}
            >All</button>
            <button
              className={`${styles.tab} ${filter === 'unread' ? styles.tabActive : ''}`}
              onClick={() => setFilter('unread')}
            >Unread</button>
          </div>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>
          {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.is_read ? styles.itemUnread : ''}`}
              onClick={() => handleClick(n)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.dot}>{!n.is_read && <span />}</div>
              <div className={styles.body}>
                <div className={styles.top}>
                  <span className={styles.type}>{TYPE_LABELS[n.notification_type] ?? '🔔'}</span>
                  <span className={styles.time}>{timeAgo(n.created_at)}</span>
                </div>
                <span className={styles.itemTitle}>{n.title}</span>
                {n.message && <span className={styles.itemMsg}>{n.message}</span>}
              </div>
              <button
                className={styles.deleteBtn}
                onClick={(e) => handleDelete(e, n.id)}
                title="Delete notification"
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
