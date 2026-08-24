import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkSession = useCallback(async () => {
    try {
      setUser(await api.get('/auth/me'))
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { checkSession() }, [checkSession])

  const login = async (identifier, password) => {
    const me = await api.post('/auth/login', { identifier, password })
    setUser(me)
    return me
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } finally { setUser(null) }
  }

  const role = user?.role || null

  return (
    <AuthContext.Provider value={{
      user,
      admin: user,           // legacy alias — existing pages read `admin.name`
      role,
      isAdmin: role === 'admin',
      isLabour: role === 'labour',
      loading,
      login,
      logout,
      refresh: checkSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
