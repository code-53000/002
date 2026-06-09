import { request } from './api'
import { Collection, CollectionItem, PaginatedResponse, ApiResponse, Quality } from '../types'

export interface StoreCollectionRequest {
  collection_date: string
  collector: string
  items: {
    style_id: number
    size_id: number
    quantity: number
  }[]
}

export interface InspectCollectionRequest {
  inspection_notes?: string
  items: {
    id: number
    quality: Quality
    inspection_notes?: string
  }[]
}

export const collectionService = {
  getCollections: (params?: { page?: number; per_page?: number; status?: string }): Promise<PaginatedResponse<Collection>> => {
    return request.get<ApiResponse<PaginatedResponse<Collection>>>('/collections', { params }).then(res => res.data)
  },

  getCollection: (id: number): Promise<Collection> => {
    return request.get<ApiResponse<Collection>>(`/collections/${id}`).then(res => res.data)
  },

  createCollection: (data: StoreCollectionRequest): Promise<Collection> => {
    return request.post<ApiResponse<Collection>>('/collections', data).then(res => res.data)
  },

  updateCollection: (id: number, data: Partial<StoreCollectionRequest>): Promise<Collection> => {
    return request.put<ApiResponse<Collection>>(`/collections/${id}`, data).then(res => res.data)
  },

  deleteCollection: (id: number): Promise<void> => {
    return request.delete<void>(`/collections/${id}`)
  },

  inspectCollection: (id: number, data: InspectCollectionRequest): Promise<Collection> => {
    return request.post<ApiResponse<Collection>>(`/collections/${id}/inspect`, data).then(res => res.data)
  },

  getCollectionItems: (collectionId: number): Promise<CollectionItem[]> => {
    return request.get<ApiResponse<CollectionItem[]>>(`/collections/${collectionId}/items`).then(res => res.data)
  },

  getPendingCollections: (): Promise<Collection[]> => {
    return request.get<ApiResponse<Collection[]>>('/collections/pending').then(res => res.data)
  },
}

export default collectionService
