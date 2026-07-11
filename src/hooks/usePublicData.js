import { useEffect, useState } from 'react'

// Lightweight fetch hook for public pages — no react-query dependency,
// so the public bundle doesn't pay for a data-fetching library the admin already needs.
export function usePublicData(path, fallback) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api${path}`)
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then((json) => { if (!cancelled) { setData(json); setError(false) } })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [path])

  return { data, loading, error }
}
