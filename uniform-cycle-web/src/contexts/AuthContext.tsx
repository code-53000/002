import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginRequest, LoginResponse } from '../types'
import { authService } from '../services/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStoredAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }

  const saveAuth = (authData: LoginResponse) => {
    setToken(authData.token)
    setUser(authData.user)
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify(authData.user))
  }

  const clearAuth = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await authService.login(credentials)
      saveAuth(response)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      setIsLoading(false)
    }
  }

  const checkAuth = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      clearAuth()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStoredAuth()
    if (token) {
      checkAuth()
    } else {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
