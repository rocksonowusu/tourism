import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useNotifications } from '../../context/NotificationContext'
import styles from './TopBar.module.css'

const PAGE_TITLES = {
  '/admin':             'Dashboard',
  '/admin/events':      'Events',
  '/admin/sites':       'Tourist Sites',
  '/admin/media':       'Media Library',
  '/admin/tours':       'Tours',
  '/admin/apartments':  'Accommodations',
  '/admin/vehicles':    'Car Rentals',
  '/admin/reviews':     'Reviews',
  '/admin/settings':    'Settings',
  '/admin/notifications': 'Notifications',
}

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

export default function TopBar({ actions, onMenuToggle }) {
  const location      = useLocation()
  const navigate      = useNavigate()
  const title         = PAGE_TITLES[location.pathname] ?? 'Admin'
  const { user, logout } = useAuth()
  const { addToast }  = useToast()
  const { unreadCount, notifications, fetchNotifications, markRead, markAllRead } = useNotifications()

  /* ── Profile dropdown ──────────────────────────────────────────────────── */
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  /* ── Notification dropdown ─────────────────────────────────────────────── */
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notifOpen) fetchNotifications()
  }, [notifOpen, fetchNotifications])

  // Listen for session-expiry event dispatched by api/client.js
  useEffect(() => {
    const onExpired = () => {
      addToast({ message: 'Session expired. Please log in again.', type: 'error', duration: 6000 })
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [addToast])

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user?.username ?? ''
  const role        = user?.is_staff ? 'Admin' : 'Staff'

  const handleNotifClick = (notif) => {
    markRead(notif.id)
    setNotifOpen(false)
    if (notif.link) navigate(notif.link)
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="Toggle menu">
          <IconMenu />
        </button>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>
      <div className={styles.right}>
        {actions && <div className={styles.actions}>{actions}</div>}

        {/* ── Notification bell ─────────────────────────────────────────── */}
        <div className={styles.notifWrapper} ref={notifRef}>
          <button
            className={styles.notifBtn}
            onClick={() => setNotifOpen(p => !p)}
            aria-label="Notifications"
            title="Notifications"
          >
            <IconBell />
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                {unreadCount > 0 && (
                  <button className={styles.notifMarkAll} onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.notifEmpty}>No notifications yet</div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <button
                      key={n.id}
                      className={`${styles.notifItem} ${!n.is_read ? styles.notifUnread : ''}`}
                      onClick={() => handleNotifClick(n)}
                    >
                      <div className={styles.notifDot}>{!n.is_read && <span />}</div>
                      <div className={styles.notifContent}>
                        <span className={styles.notifItemTitle}>{n.title}</span>
                        {n.message && <span className={styles.notifItemMsg}>{n.message}</span>}
                        <span className={styles.notifTime}>{timeAgo(n.created_at)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  className={styles.notifViewAll}
                  onClick={() => { setNotifOpen(false); navigate('/admin/notifications') }}
                >
                  View all notifications
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Profile wrapper with dropdown ────────────────────────────── */}
        <div className={styles.profileWrapper} ref={profileRef}>
          <button
            className={styles.profileToggle}
            onClick={() => setProfileOpen(p => !p)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className={styles.avatar}>{displayName.charAt(0).toUpperCase() || 'A'}</div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userRole}>{role}</span>
            </div>
            <span className={`${styles.chevron} ${profileOpen ? styles.chevronOpen : ''}`}>
              <IconChevron />
            </span>
          </button>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <button
                className={styles.profileDropdownItem}
                onClick={() => { setProfileOpen(false); navigate('/admin/settings') }}
              >
                <IconSettings /> Settings
              </button>
              <div className={styles.profileDropdownDivider} />
              <button
                className={`${styles.profileDropdownItem} ${styles.profileDropdownDanger}`}
                onClick={() => { setProfileOpen(false); logout() }}
              >
                <IconLogout /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
