import { request } from './api'
import { CleaningBatch, CleaningItem, PaginatedResponse, ApiResponse } from '../types'

export interface StoreCleaningBatchRequest {
  batch_number: string
  start_date: string
  items: {
    collection_item_id: number
  }[]
}

export interface AddCleaningItemsRequest {
  items: {
    collection_item_id: number
  }[]
}

export interface CompleteCleaningBatchRequest {
  end_date: string
}

export const cleaningService = {
  getCleaningBatches: (params?: { page?: number; per_page?: number; status?: string }): Promise<PaginatedResponse<CleaningBatch>> => {
    return request.get<ApiResponse<PaginatedResponse<CleaningBatch>>>('/cleaning-batches', { params }).then(res => res.data)
  },

  getCleaningBatch: (id: number): Promise<CleaningBatch> => {
    return request.get<ApiResponse<CleaningBatch>>(`/cleaning-batches/${id}`).then(res => res.data)
  },

  createCleaningBatch: (data: StoreCleaningBatchRequest): Promise<CleaningBatch> => {
    return request.post<ApiResponse<CleaningBatch>>('/cleaning-batches', data).then(res => res.data)
  },

  updateCleaningBatch: (id: number, data: Partial<StoreCleaningBatchRequest>): Promise<CleaningBatch> => {
    return request.put<ApiResponse<CleaningBatch>>(`/cleaning-batches/${id}`, data).then(res => res.data)
  },

  deleteCleaningBatch: (id: number): Promise<void> => {
    return request.delete<void>(`/cleaning-batches/${id}`)
  },

  addCleaningItems: (id: number, data: AddCleaningItemsRequest): Promise<CleaningBatch> => {
    return request.post<ApiResponse<CleaningBatch>>(`/cleaning-batches/${id}/add-items`, data).then(res => res.data)
  },

  completeCleaningBatch: (id: number, data: CompleteCleaningBatchRequest): Promise<CleaningBatch> => {
    return request.post<ApiResponse<CleaningBatch>>(`/cleaning-batches/${id}/complete`, data).then(res => res.data)
  },

  getCleaningItems: (batchId: number): Promise<CleaningItem[]> => {
    return request.get<ApiResponse<CleaningItem[]>>(`/cleaning-batches/${batchId}/items`).then(res => res.data)
  },

  getAvailableItemsForCleaning: (): Promise<any[]> => {
    return request.get<ApiResponse<any[]>>('/cleaning-batches/available-items').then(res => res.data)
  },
}

export default cleaningService
