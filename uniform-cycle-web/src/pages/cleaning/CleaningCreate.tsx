import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, RefreshCw } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { cleaningService, StoreCleaningBatchRequest } from '../../services/cleaning'
import { getToday } from '../../utils/date'
import { generateBatchNumber } from '../../utils/format'
import { validateRequired } from '../../utils/validation'
import { CollectionItem } from '../../types'

interface CleaningItemForm {
  collection_item_id: string
  collection_item?: CollectionItem
}

const CleaningCreate: React.FC = () => {
  const navigate = useNavigate()
  const [batchNumber, setBatchNumber] = useState(generateBatchNumber('CLN'))
  const [startDate, setStartDate] = useState(getToday())
  const [items, setItems] = useState<CleaningItemForm[]>([
    { collection_item_id: '', collection_item: undefined },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    data: availableItems,
    loading: itemsLoading,
    error: itemsError,
    execute: loadAvailableItems,
  } = useApi(cleaningService.getAvailableItemsForCleaning)

  const { loading, error, execute } = useApi(cleaningService.createCleaningBatch)

  useEffect(() => {
    loadAvailableItems()
  }, [loadAvailableItems])

  const addItem = () => {
    setItems([...items, { collection_item_id: '', collection_item: undefined }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, collectionItemId: string) => {
    const newItems = [...items]
    const collectionItem = availableItems?.find(
      (item: any) => item.id === parseInt(collectionItemId)
    )
    newItems[index] = { collection_item_id: collectionItemId, collection_item: collectionItem }
    setItems(newItems)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    const batchError = validateRequired(batchNumber, '批次号')
    if (batchError) newErrors.batch_number = batchError

    const dateError = validateRequired(startDate, '开始日期')
    if (dateError) newErrors.start_date = dateError

    items.forEach((item, index) => {
      if (!item.collection_item_id) {
        newErrors[`item_${index}`] = '请选择回收物品'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const uniqueItemIds = new Set(items.map((item) => item.collection_item_id))
    if (uniqueItemIds.size !== items.length) {
      setErrors({ duplicate: '不能重复添加相同的回收物品' })
      return
    }

    const data: StoreCleaningBatchRequest = {
      batch_number: batchNumber,
      start_date: startDate,
      items: items.map((item) => ({
        collection_item_id: parseInt(item.collection_item_id),
      })),
    }

    const result = await execute(data)
    if (result) {
      navigate('/cleaning')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/cleaning" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新建清洗批次</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {error}
            </div>
          )}
          {errors.duplicate && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {errors.duplicate}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">批次号</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className={`input flex-1 ${errors.batch_number ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setBatchNumber(generateBatchNumber('CLN'))}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="重新生成"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              {errors.batch_number && (
                <p className="mt-1 text-sm text-red-600">{errors.batch_number}</p>
              )}
            </div>
            <div>
              <label className="label">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`input ${errors.start_date ? 'border-red-500' : ''}`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">清洗物品</h2>
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>添加物品</span>
            </button>
          </div>

          {itemsLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          )}

          {itemsError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {itemsError}
            </div>
          )}

          {!itemsLoading && !itemsError && (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-wrap gap-4 items-end p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-[300px]">
                    <label className="label">回收物品</label>
                    <select
                      value={item.collection_item_id}
                      onChange={(e) => updateItem(index, e.target.value)}
                      className={`input ${errors[`item_${index}`] ? 'border-red-500' : ''}`}
                    >
                      <option value="">请选择回收物品</option>
                      {availableItems?.map((availItem: any) => (
                        <option key={availItem.id} value={availItem.id}>
                          #{availItem.id} - {availItem.style?.name} / {availItem.size?.name} (数量:
                          {availItem.quantity})
                        </option>
                      ))}
                    </select>
                    {errors[`item_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`item_${index}`]}</p>
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
          )}
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link to="/cleaning" className="btn-secondary">
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

export default CleaningCreate
