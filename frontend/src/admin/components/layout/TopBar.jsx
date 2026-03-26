import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import styles from './TopBar.module.css'

const PAGE_TITLES = {
  '/admin':        'Dashboard',
  '/admin/events': 'Events',
  '/admin/sites':  'Tourist Sites',
  '/admin/media':  'Media Library',
}

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function TopBar({ actions }) {
  const location      = useLocation()
  const title         = PAGE_TITLES[location.pathname] ?? 'Admin'
  const { user, logout } = useAuth()
  const { addToast }  = useToast()

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

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>
      <div className={styles.right}>
        {actions && <div className={styles.actions}>{actions}</div>}
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{displayName.charAt(0).toUpperCase() || 'A'}</div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>{role}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Sign out">
          <IconLogout />
        </button>
      </div>
    </header>
  )
}
