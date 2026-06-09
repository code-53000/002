import { request } from './api'
import { DashboardStats, ApiResponse } from '../types'

export const dashboardService = {
  getStats: (): Promise<DashboardStats> => {
    return request.get<ApiResponse<DashboardStats>>('/dashboard/stats').then(res => res.data)
  },
}

export default dashboardService
