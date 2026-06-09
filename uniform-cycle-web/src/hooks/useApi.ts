import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean
}

export function useApi<T, P extends any[]>(
  apiFunction: (...params: P) => Promise<T>,
  _options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await apiFunction(...params)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : '请求失败'
        setState(prev => ({ ...prev, loading: false, error: message }))
        return null
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setData,
  }
}

export function usePaginatedApi<T, P extends any[]>(
  apiFunction: (...params: P) => Promise<{ data: T[]; total: number; current_page: number; last_page: number }>,
  _options: UseApiOptions = {}
) {
  const [state, setState] = useState<{
    data: T[]
    loading: boolean
    error: string | null
    total: number
    currentPage: number
    lastPage: number
  }>({
    data: [],
    loading: false,
    error: null,
    total: 0,
    currentPage: 1,
    lastPage: 1,
  })

  const execute = useCallback(
    async (...params: P) => {
      setState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const result = await apiFunction(...params)
        setState({
          data: result.data,
          loading: false,
          error: null,
          total: result.total,
          currentPage: result.current_page,
          lastPage: result.last_page,
        })
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : '请求失败'
        setState(prev => ({ ...prev, loading: false, error: message }))
        return null
      }
    },
    [apiFunction]
  )

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      total: 0,
      currentPage: 1,
      lastPage: 1,
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

export default useApi
