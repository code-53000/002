import { request } from './api'
import { Inventory, InventoryLog, UniformStyle, UniformSize, PaginatedResponse, ApiResponse } from '../types'

export interface StockInRequest {
  items: {
    style_id: number
    size_id: number
    quantity: number
    reason: string
    cleaning_batch_id?: number
  }[]
}

export interface StoreInventoryRequest {
  style_id: number
  size_id: number
  quantity: number
  min_stock: number
  max_stock: number
}

export interface AllocateInventoryRequest {
  items: {
    inventory_id: number
    quantity: number
  }[]
}

export const inventoryService = {
  getInventory: (params?: { page?: number; per_page?: number; style_id?: number; size_id?: number }): Promise<PaginatedResponse<Inventory>> => {
    return request.get<ApiResponse<PaginatedResponse<Inventory>>>('/inventory', { params }).then(res => res.data)
  },

  getInventoryItem: (id: number): Promise<Inventory> => {
    return request.get<ApiResponse<Inventory>>(`/inventory/${id}`).then(res => res.data)
  },

  createInventory: (data: StoreInventoryRequest): Promise<Inventory> => {
    return request.post<ApiResponse<Inventory>>('/inventory', data).then(res => res.data)
  },

  updateInventory: (id: number, data: Partial<StoreInventoryRequest>): Promise<Inventory> => {
    return request.put<ApiResponse<Inventory>>(`/inventory/${id}`, data).then(res => res.data)
  },

  deleteInventory: (id: number): Promise<void> => {
    return request.delete<void>(`/inventory/${id}`)
  },

  stockIn: (data: StockInRequest): Promise<Inventory[]> => {
    return request.post<ApiResponse<Inventory[]>>('/inventory/stock-in', data).then(res => res.data)
  },

  allocateInventory: (data: AllocateInventoryRequest): Promise<Inventory[]> => {
    return request.post<ApiResponse<Inventory[]>>('/inventory/allocate', data).then(res => res.data)
  },

  getInventoryLogs: (inventoryId?: number): Promise<InventoryLog[]> => {
    const url = inventoryId ? `/inventory/${inventoryId}/logs` : '/inventory/logs'
    return request.get<ApiResponse<InventoryLog[]>>(url).then(res => res.data)
  },

  getLowStockItems: (): Promise<Inventory[]> => {
    return request.get<ApiResponse<Inventory[]>>('/inventory/low-stock').then(res => res.data)
  },

  getStyles: (): Promise<UniformStyle[]> => {
    return request.get<ApiResponse<UniformStyle[]>>('/styles').then(res => res.data)
  },

  createStyle: (data: Partial<UniformStyle>): Promise<UniformStyle> => {
    return request.post<ApiResponse<UniformStyle>>('/styles', data).then(res => res.data)
  },

  updateStyle: (id: number, data: Partial<UniformStyle>): Promise<UniformStyle> => {
    return request.put<ApiResponse<UniformStyle>>(`/styles/${id}`, data).then(res => res.data)
  },

  deleteStyle: (id: number): Promise<void> => {
    return request.delete<void>(`/styles/${id}`)
  },

  getSizes: (): Promise<UniformSize[]> => {
    return request.get<ApiResponse<UniformSize[]>>('/sizes').then(res => res.data)
  },

  createSize: (data: Partial<UniformSize>): Promise<UniformSize> => {
    return request.post<ApiResponse<UniformSize>>('/sizes', data).then(res => res.data)
  },

  updateSize: (id: number, data: Partial<UniformSize>): Promise<UniformSize> => {
    return request.put<ApiResponse<UniformSize>>(`/sizes/${id}`, data).then(res => res.data)
  },

  deleteSize: (id: number): Promise<void> => {
    return request.delete<void>(`/sizes/${id}`)
  },
}

export default inventoryService
