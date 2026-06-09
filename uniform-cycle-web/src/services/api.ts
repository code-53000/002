import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      const message = error.response.data?.message || '请求失败'
      return Promise.reject(new Error(message))
    }
    if (error.request) {
      return Promise.reject(new Error('网络错误，请检查网络连接'))
    }
    return Promise.reject(error)
  }
)

export const request = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.get(url, config)
  },
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.post(url, data, config)
  },
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.put(url, data, config)
  },
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.delete(url, config)
  },
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.patch(url, data, config)
  },
}

export default api
