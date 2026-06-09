import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { UniformStyle, UniformSize } from '../types'
import { inventoryService } from '../services/inventory'

interface AppState {
  styles: UniformStyle[]
  sizes: UniformSize[]
  sidebarCollapsed: boolean
  loading: boolean
  error: string | null
}

interface AppContextType {
  state: AppState
  setSidebarCollapsed: (collapsed: boolean) => void
  loadStyles: () => Promise<void>
  loadSizes: () => Promise<void>
  loadAll: () => Promise<void>
  setError: (error: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

const initialState: AppState = {
  styles: [],
  sizes: [],
  sidebarCollapsed: false,
  loading: false,
  error: null,
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState)

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState(prev => ({ ...prev, sidebarCollapsed: collapsed }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const loadStyles = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const styles = await inventoryService.getStyles()
      setState(prev => ({ ...prev, styles, error: null }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : '加载款式失败' }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const loadSizes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const sizes = await inventoryService.getSizes()
      setState(prev => ({ ...prev, sizes, error: null }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : '加载尺码失败' }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const loadAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const [styles, sizes] = await Promise.all([
        inventoryService.getStyles(),
        inventoryService.getSizes(),
      ])
      setState(prev => ({ ...prev, styles, sizes, error: null }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : '加载数据失败' }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const value: AppContextType = {
    state,
    setSidebarCollapsed,
    loadStyles,
    loadSizes,
    loadAll,
    setError,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContext
