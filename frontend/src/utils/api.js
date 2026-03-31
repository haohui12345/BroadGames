import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { getApiBaseUrl } from '@/utils/network'

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
})

// Tự động gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Tự động logout khi token hết hạn
// Lưu ý: KHÔNG redirect khi đang gọi các route auth public (login/register)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      return Promise.reject({
        message: 'Không thể kết nối server. Hãy kiểm tra backend đang chạy và cấu hình frontend.',
      })
    }

    const url = err.config?.url || ''
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register')

    if (err.response?.status === 401 && !isAuthRoute) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data || { message: err.message })
  }
)

export default api
