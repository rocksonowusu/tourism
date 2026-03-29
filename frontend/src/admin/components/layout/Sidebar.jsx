import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Sidebar.module.css'

// ── SVG icon components ───────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconImage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconBrand = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const NAV = [
  { to: '/admin',        label: 'Dashboard', Icon: IconGrid,     exact: true },
  { to: '/admin/events', label: 'Events',    Icon: IconCalendar              },
  { to: '/admin/sites',  label: 'Sites',     Icon: IconMapPin                },
  { to: '/admin/media',  label: 'Media',     Icon: IconImage                 },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.brandIcon}><IconBrand /></span>
        <span className={styles.brandName}>Tourism<span className={styles.brandAccent}>Admin</span></span>
      </div>

      {/* Nav */}
      <nav className={styles.nav} aria-label="Main navigation">
        <ul className={styles.navList}>
          {NAV.map(({ to, label, Icon, exact }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={exact}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.active : ''].join(' ')
                }
                onClick={() => onClose && onClose()}
              >
                <span className={styles.navIcon}><Icon /></span>
                <span className={styles.navLabel}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className={styles.foot}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase() ?? 'A'}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.first_name || user?.username}</span>
            <span className={styles.userRole}>{user?.is_staff ? 'Admin' : 'Staff'}</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
          <IconLogout />
        </button>
      </div>
    </aside>
  )
}
