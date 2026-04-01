import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { APIError } from '../../api/client'
import styles from './Login.module.css'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/admin', { replace: true })
    } catch (err) {
      if (err instanceof APIError && err.status === 401) {
        setError('Invalid username or password.')
      } else {
        setError('Unable to connect. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Full-bleed background */}
      <div className={styles.bg} aria-hidden="true">
        <img src="/assets/brush-stroke.svg" alt="" className={styles.strokeTR} />
        <img src="/assets/brush-stroke-2.svg" alt="" className={styles.strokeBL} />
      </div>

      {/* Back to public site */}
      <Link to="/" className={styles.backLink}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to site
      </Link>

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.brand}>
          <img src="/assets/Logo.PNG" alt="The Ghana Experience" className={styles.brandLogo} />
          <div>
            <div className={styles.brandName}>The Ghana<span> Experience</span></div>
            <div className={styles.brandSub}>Admin Portal</div>
          </div>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your admin account</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && (
            <div className={styles.alert} role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className={styles.input}
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" size="lg" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>
      </div>

      <p className={styles.footer}>© {new Date().getFullYear()} 1957 The Ghana Experience LBG</p>
    </div>
  )
}
