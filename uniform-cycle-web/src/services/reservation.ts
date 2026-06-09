import { request } from './api'
import { Reservation, PaginatedResponse, ApiResponse } from '../types'

export interface StoreReservationRequest {
  employee_name: string
  employee_department: string
  pickup_date: string
  items: {
    style_id: number
    size_id: number
    quantity: number
  }[]
}

export interface ApproveReservationRequest {
  approval_notes?: string
  items: {
    id: number
    allocated_quantity: number
  }[]
}

export interface RejectReservationRequest {
  approval_notes: string
}

export interface PickupReservationRequest {
  pickup_notes?: string
  picked_up_by: string
}

export const reservationService = {
  getReservations: (params?: { page?: number; per_page?: number; status?: string }): Promise<PaginatedResponse<Reservation>> => {
    return request.get<ApiResponse<PaginatedResponse<Reservation>>>('/reservations', { params }).then(res => res.data)
  },

  getReservation: (id: number): Promise<Reservation> => {
    return request.get<ApiResponse<Reservation>>(`/reservations/${id}`).then(res => res.data)
  },

  createReservation: (data: StoreReservationRequest): Promise<Reservation> => {
    return request.post<ApiResponse<Reservation>>('/reservations', data).then(res => res.data)
  },

  updateReservation: (id: number, data: Partial<StoreReservationRequest>): Promise<Reservation> => {
    return request.put<ApiResponse<Reservation>>(`/reservations/${id}`, data).then(res => res.data)
  },

  deleteReservation: (id: number): Promise<void> => {
    return request.delete<void>(`/reservations/${id}`)
  },

  approveReservation: (id: number, data: ApproveReservationRequest): Promise<Reservation> => {
    return request.post<ApiResponse<Reservation>>(`/reservations/${id}/approve`, data).then(res => res.data)
  },

  rejectReservation: (id: number, data: RejectReservationRequest): Promise<Reservation> => {
    return request.post<ApiResponse<Reservation>>(`/reservations/${id}/reject`, data).then(res => res.data)
  },

  pickupReservation: (id: number, data: PickupReservationRequest): Promise<Reservation> => {
    return request.post<ApiResponse<Reservation>>(`/reservations/${id}/pickup`, data).then(res => res.data)
  },

  getPendingReservations: (): Promise<Reservation[]> => {
    return request.get<ApiResponse<Reservation[]>>('/reservations/pending').then(res => res.data)
  },
}

export default reservationService
