import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Plus } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import {
  cleaningService,
  CompleteCleaningBatchRequest,
  AddCleaningItemsRequest,
} from '../../services/cleaning'
import { inventoryService } from '../../services/inventory'
import { formatDate } from '../../utils/date'
import { getStatusBadgeClass, getStatusText } from '../../utils/format'
import { CleaningItem } from '../../types'
import { getToday } from '../../utils/date'

const CleaningDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [endDate, setEndDate] = useState(getToday())
  const [showAddItems, setShowAddItems] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const {
    data: batch,
    loading,
    error,
    execute: loadBatch,
  } = useApi(cleaningService.getCleaningBatch)

  const {
    data: availableItems,
    loading: itemsLoading,
    execute: loadAvailableItems,
  } = useApi(cleaningService.getAvailableItemsForCleaning)

  const { loading: completeLoading, execute: completeBatch } = useApi(
    cleaningService.completeCleaningBatch
  )

  const { loading: addItemsLoading, execute: addItems } = useApi(cleaningService.addCleaningItems)

  const { loading: stockInLoading, execute: stockIn } = useApi(inventoryService.stockIn)

  useEffect(() => {
    if (id) {
      loadBatch(parseInt(id))
    }
  }, [id, loadBatch])

  useEffect(() => {
    if (showAddItems) {
      loadAvailableItems()
    }
  }, [showAddItems, loadAvailableItems])

  const handleComplete = async () => {
    if (!batch) return

    const data: CompleteCleaningBatchRequest = {
      end_date: endDate,
    }

    const result = await completeBatch(batch.id, data)
    if (result) {
      const stockInData = {
        items: batch.items.map((item: CleaningItem) => ({
          style_id: item.collection_item?.style_id || 0,
          size_id: item.collection_item?.size_id || 0,
          quantity: item.collection_item?.quantity || 0,
          reason: '清洗完成入库',
          cleaning_batch_id: batch.id,
        })),
      }

      await stockIn(stockInData)
      navigate('/cleaning')
    }
  }

  const handleAddItems = async () => {
    if (!batch || selectedItems.length === 0) return

    const data: AddCleaningItemsRequest = {
      items: selectedItems.map((id) => ({ collection_item_id: parseInt(id) })),
    }

    const result = await addItems(batch.id, data)
    if (result) {
      setShowAddItems(false)
      setSelectedItems([])
      loadBatch(batch.id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !batch) {
    return (
      <div className="space-y-6">
        <Link to="/cleaning" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          <span>返回列表</span>
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || '加载失败'}
        </div>
      </div>
    )
  }

  const isProcessing = batch.status === 'processing'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/cleaning" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">清洗批次详情 {batch.batch_number}</h1>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
              batch.status
            )}`}
          >
            {getStatusText(batch.status)}
          </span>
        </div>
        {isProcessing && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddItems(true)}
              disabled={addItemsLoading}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>添加物品</span>
            </button>
            <button
              onClick={handleComplete}
              disabled={completeLoading || stockInLoading}
              className="btn-success flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>完成清洗</span>
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">批次号</p>
            <p className="text-lg font-medium text-gray-900">{batch.batch_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">开始日期</p>
            <p className="text-lg font-medium text-gray-900">{formatDate(batch.start_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">结束日期</p>
            <p className="text-lg font-medium text-gray-900">
              {batch.end_date ? formatDate(batch.end_date) : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">物品总数</p>
            <p className="text-lg font-medium text-gray-900">{batch.total_items} 件</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">清洗物品明细</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">款式</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">尺码</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">数量</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
              </tr>
            </thead>
            <tbody>
              {batch.items.map((item: CleaningItem) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">
                    {item.collection_item?.style?.name}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {item.collection_item?.size?.name}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {item.collection_item?.quantity}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isProcessing && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">完成清洗</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            完成清洗后，系统将自动把清洗好的物品入库到库存中。
          </p>
        </div>
      )}

      {showAddItems && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">添加清洗物品</h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {itemsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableItems?.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">暂无可用物品</p>
                  ) : (
                    availableItems?.map((item: any) => (
                      <label
                        key={item.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          value={item.id}
                          checked={selectedItems.includes(String(item.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, String(item.id)])
                            } else {
                              setSelectedItems(selectedItems.filter((id) => id !== String(item.id)))
                            }
                          }}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.style?.name} / {item.size?.name}
                          </p>
                          <p className="text-sm text-gray-500">数量: {item.quantity}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddItems(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAddItems}
                disabled={addItemsLoading || selectedItems.length === 0}
                className="btn-primary"
              >
                {addItemsLoading ? '添加中...' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CleaningDetail
