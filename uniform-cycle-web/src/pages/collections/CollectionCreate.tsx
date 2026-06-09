import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { collectionService, StoreCollectionRequest } from '../../services/collection'
import { useApp } from '../../contexts/AppContext'
import { getToday } from '../../utils/date'
import { validateRequired } from '../../utils/validation'

interface CollectionItemForm {
  style_id: string
  size_id: string
  quantity: string
}

const CollectionCreate: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useApp()
  const [collectionDate, setCollectionDate] = useState(getToday())
  const [collector, setCollector] = useState('')
  const [items, setItems] = useState<CollectionItemForm[]>([
    { style_id: '', size_id: '', quantity: '' },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { loading, error, execute } = useApi(collectionService.createCollection)

  const addItem = () => {
    setItems([...items, { style_id: '', size_id: '', quantity: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof CollectionItemForm, value: string) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    const collectorError = validateRequired(collector, '回收人')
    if (collectorError) newErrors.collector = collectorError

    const dateError = validateRequired(collectionDate, '回收日期')
    if (dateError) newErrors.collection_date = dateError

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
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const data: StoreCollectionRequest = {
      collection_date: collectionDate,
      collector,
      items: items.map((item) => ({
        style_id: parseInt(item.style_id),
        size_id: parseInt(item.size_id),
        quantity: parseInt(item.quantity),
      })),
    }

    const result = await execute(data)
    if (result) {
      navigate('/collections')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/collections" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新建回收登记</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">回收日期</label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className={`input ${errors.collection_date ? 'border-red-500' : ''}`}
              />
              {errors.collection_date && (
                <p className="mt-1 text-sm text-red-600">{errors.collection_date}</p>
              )}
            </div>
            <div>
              <label className="label">回收人</label>
              <input
                type="text"
                value={collector}
                onChange={(e) => setCollector(e.target.value)}
                placeholder="请输入回收人姓名"
                className={`input ${errors.collector ? 'border-red-500' : ''}`}
              />
              {errors.collector && (
                <p className="mt-1 text-sm text-red-600">{errors.collector}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">回收明细</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>添加明细</span>
            </button>
          </div>

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
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`item_${index}_style`]}
                    </p>
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`item_${index}_quantity`]}
                    </p>
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
          <Link to="/collections" className="btn-secondary">
            取消
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>保存</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CollectionCreate
