export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim()
  return configured || '/api'
}

export function getSocketUrl() {
  const configured = import.meta.env.VITE_SOCKET_URL?.trim()
  if (configured) return configured

  const apiUrl = import.meta.env.VITE_API_URL?.trim()
  if (!apiUrl) return null

  return apiUrl.replace(/\/api\/?$/, '')
}
