import { request } from './api'
import { LoginRequest, LoginResponse, User, ApiResponse } from '../types'

export const authService = {
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return request.post<LoginResponse>('/auth/login', data)
  },

  logout: (): Promise<void> => {
    return request.post<void>('/auth/logout')
  },

  getCurrentUser: (): Promise<User> => {
    return request.get<ApiResponse<User>>('/auth/user').then(res => res.data)
  },

  updateProfile: (data: Partial<User>): Promise<User> => {
    return request.put<ApiResponse<User>>('/auth/profile', data).then(res => res.data)
  },
}

export default authService
