import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkSession = useCallback(async () => {
    try {
      const me = await api.get('/auth/me')
      setAdmin(me)
    } catch {
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { checkSession() }, [checkSession])

  const login = async (email, password) => {
    const me = await api.post('/auth/login', { email, password })
    setAdmin(me)
    return me
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } finally { setAdmin(null) }
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, refresh: checkSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
