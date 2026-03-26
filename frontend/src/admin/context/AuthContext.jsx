import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { tokenStore } from '../../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)  // true while checking stored token

  // ── Restore session on mount ────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      if (!tokenStore.hasTokens()) { setLoading(false); return }
      try {
        const me = await api.auth.me()
        setUser(me)
      } catch {
        tokenStore.clear()
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  // ── Listen for token expiry (emitted by api client) ─────────────────
  useEffect(() => {
    const onExpired = () => { setUser(null); tokenStore.clear() }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  // ── Actions ──────────────────────────────────────────────────────────

  const login = useCallback(async (username, password) => {
    const data = await api.auth.login(username, password)
    tokenStore.set(data.access, data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    const refresh = tokenStore.getRefresh()
    try { if (refresh) await api.auth.logout(refresh) } catch { /* ignore */ }
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = { user, loading, login, logout, isAdmin: user?.is_staff ?? false }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
