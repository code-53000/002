export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface UniformStyle {
  id: number
  name: string
  code: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface UniformSize {
  id: number
  name: string
  code: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Collection {
  id: number
  collection_date: string
  collector: string
  total_quantity: number
  status: 'pending' | 'inspected' | 'rejected'
  inspection_notes: string | null
  inspected_by: number | null
  inspected_at: string | null
  created_at: string
  updated_at: string
  items: CollectionItem[]
  inspector?: User
}

export interface CollectionItem {
  id: number
  collection_id: number
  style_id: number
  size_id: number
  quantity: number
  quality: 'good' | 'damaged' | 'scrap' | null
  inspection_notes: string | null
  created_at: string
  updated_at: string
  style?: UniformStyle
  size?: UniformSize
}

export interface CleaningBatch {
  id: number
  batch_number: string
  start_date: string
  end_date: string | null
  status: 'processing' | 'completed'
  total_items: number
  created_at: string
  updated_at: string
  items: CleaningItem[]
}

export interface CleaningItem {
  id: number
  cleaning_batch_id: number
  collection_item_id: number
  status: 'pending' | 'cleaning' | 'completed'
  created_at: string
  updated_at: string
  collection_item?: CollectionItem
}

export interface Inventory {
  id: number
  style_id: number
  size_id: number
  quantity: number
  min_stock: number
  max_stock: number
  created_at: string
  updated_at: string
  style?: UniformStyle
  size?: UniformSize
}

export interface InventoryLog {
  id: number
  inventory_id: number
  type: 'stock_in' | 'stock_out' | 'adjustment'
  quantity: number
  reason: string
  reference_id: number | null
  reference_type: string | null
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: number
  employee_name: string
  employee_department: string
  pickup_date: string
  status: 'pending' | 'approved' | 'rejected' | 'picked_up'
  total_items: number
  approval_notes: string | null
  approved_by: number | null
  approved_at: string | null
  pickup_notes: string | null
  picked_up_by: string | null
  picked_up_at: string | null
  created_at: string
  updated_at: string
  items: ReservationItem[]
  approver?: User
}

export interface ReservationItem {
  id: number
  reservation_id: number
  style_id: number
  size_id: number
  quantity: number
  allocated_quantity: number
  created_at: string
  updated_at: string
  style?: UniformStyle
  size?: UniformSize
}

export interface ScrapRecord {
  id: number
  collection_item_id: number
  reason: string
  quantity: number
  recorded_by: number
  created_at: string
  updated_at: string
  collection_item?: CollectionItem
  recorder?: User
}

export interface SizeChange {
  id: number
  employee_name: string
  old_size_id: number
  new_size_id: number
  style_id: number
  change_date: string
  notes: string | null
  created_at: string
  updated_at: string
  old_size?: UniformSize
  new_size?: UniformSize
  style?: UniformStyle
}

export interface DashboardStats {
  total_collections: number
  total_cleaning: number
  total_inventory: number
  total_reservations: number
  pending_inspections: number
  pending_reservations: number
  low_stock_items: number
  recent_collections: Collection[]
  recent_reservations: Reservation[]
  inventory_by_style: { style_id: number; style_name: string; total_quantity: number }[]
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export type CollectionStatus = 'pending' | 'inspected' | 'rejected'
export type CleaningStatus = 'processing' | 'completed'
export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'picked_up'
export type Quality = 'good' | 'damaged' | 'scrap'
