import { useCallback, useState } from 'react'
import { useAuth as useAuthContext } from '../contexts/AuthContext'
import { LoginRequest } from '../types'

export const useAuth = () => {
  const auth = useAuthContext()
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setError(null)
      try {
        await auth.login(credentials)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : '登录失败'
        setError(message)
        return false
      }
    },
    [auth]
  )

  const logout = useCallback(async () => {
    setError(null)
    try {
      await auth.logout()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : '登出失败'
      setError(message)
      return false
    }
  }, [auth])

  return {
    ...auth,
    error,
    login,
    logout,
    clearError: () => setError(null),
  }
}

export default useAuth
