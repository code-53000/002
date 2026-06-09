import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { inventoryService, StockInRequest } from '../../services/inventory'
import { useApp } from '../../contexts/AppContext'

interface StockInItemForm {
  style_id: string
  size_id: string
  quantity: string
  reason: string
  cleaning_batch_id: string
}

const InventoryStockIn: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useApp()
  const [items, setItems] = useState<StockInItemForm[]>([
    { style_id: '', size_id: '', quantity: '', reason: '手动入库', cleaning_batch_id: '' },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { loading, error, execute } = useApi(inventoryService.stockIn)

  const addItem = () => {
    setItems([...items, { style_id: '', size_id: '', quantity: '', reason: '手动入库', cleaning_batch_id: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof StockInItemForm, value: string) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    items.forEach((item, index) => {
      if (!item.style_id) {
        newErrors[`item_${index}_style`] = '请选择款式'
      }
      if (!item.size_id) {
        newErrors[`item_${index}_size`] = '请选择尺码'
      }
      if (!item.quantity || parseInt(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = '请输入有效数量'
      }
      if (!item.reason) {
        newErrors[`item_${index}_reason`] = '请输入入库原因'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const data: StockInRequest = {
      items: items.map((item) => ({
        style_id: parseInt(item.style_id),
        size_id: parseInt(item.size_id),
        quantity: parseInt(item.quantity),
        reason: item.reason,
        cleaning_batch_id: item.cleaning_batch_id ? parseInt(item.cleaning_batch_id) : undefined,
      })),
    }

    const result = await execute(data)
    if (result) {
      navigate('/inventory')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">批量入库</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">入库明细</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>添加明细</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-wrap gap-4 items-end p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-[150px]">
                  <label className="label">款式</label>
                  <select
                    value={item.style_id}
                    onChange={(e) => updateItem(index, 'style_id', e.target.value)}
                    className={`input ${errors[`item_${index}_style`] ? 'border-red-500' : ''}`}
                  >
                    <option value="">请选择款式</option>
                    {state.styles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                  {errors[`item_${index}_style`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_style`]}</p>
                  )}
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="label">尺码</label>
                  <select
                    value={item.size_id}
                    onChange={(e) => updateItem(index, 'size_id', e.target.value)}
                    className={`input ${errors[`item_${index}_size`] ? 'border-red-500' : ''}`}
                  >
                    <option value="">请选择尺码</option>
                    {state.sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                  {errors[`item_${index}_size`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_size`]}</p>
                  )}
                </div>
                <div className="w-32">
                  <label className="label">数量</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    placeholder="0"
                    className={`input ${errors[`item_${index}_quantity`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`item_${index}_quantity`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                  )}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="label">入库原因</label>
                  <input
                    type="text"
                    value={item.reason}
                    onChange={(e) => updateItem(index, 'reason', e.target.value)}
                    placeholder="请输入入库原因"
                    className={`input ${errors[`item_${index}_reason`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`item_${index}_reason`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_reason`]}</p>
                  )}
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link to="/inventory" className="btn-secondary">
            取消
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>入库中...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>确认入库</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default InventoryStockIn
