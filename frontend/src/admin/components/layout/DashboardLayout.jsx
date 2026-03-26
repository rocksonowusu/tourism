import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import Spinner from '../ui/Spinner'
import ToastStack from '../ui/Toast'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ topBarActions }) {
  const { user, loading } = useAuth()

  if (loading) return <Spinner centered size="xl" />
  if (!user)   return <Navigate to="/admin/login" replace />

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <TopBar actions={topBarActions} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
      <ToastStack />
    </div>
  )
}
