const BASE = '/api'

let refreshPromise = null

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

async function request(path, { method = 'GET', body, isForm = false, retry = true } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })

  if (res.status === 401 && retry && path !== '/auth/login' && path !== '/auth/refresh') {
    const refreshRes = await refreshSession()
    if (refreshRes.ok) return request(path, { method, body, isForm, retry: false })
  }

  let data = null
  const text = await res.text()
  if (text) {
    try { data = JSON.parse(text) } catch { data = null }
  }

  if (!res.ok) {
    const error = new Error(data?.error || 'Request failed')
    error.status = res.status
    error.details = data?.details
    throw error
  }

  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  patch: (path, body, opts) => request(path, { method: 'PATCH', body, ...opts }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
