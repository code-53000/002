import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { collectionService, InspectCollectionRequest } from '../../services/collection'
import { formatDate } from '../../utils/date'
import { getStatusBadgeClass, getStatusText } from '../../utils/format'
import { CollectionItem, Quality } from '../../types'

const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [inspectionNotes, setInspectionNotes] = useState('')
  const [itemQualities, setItemQualities] = useState<Record<number, Quality>>({})
  const [itemNotes, setItemNotes] = useState<Record<number, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    data: collection,
    loading,
    error,
    execute: loadCollection,
  } = useApi(collectionService.getCollection)

  const { loading: inspectLoading, execute: inspectCollection } = useApi(
    collectionService.inspectCollection
  )

  useEffect(() => {
    if (id) {
      loadCollection(parseInt(id))
    }
  }, [id, loadCollection])

  useEffect(() => {
    if (collection) {
      const qualities: Record<number, Quality> = {}
      const notes: Record<number, string> = {}
      collection.items.forEach((item: CollectionItem) => {
        if (item.quality) {
          qualities[item.id] = item.quality
        }
        if (item.inspection_notes) {
          notes[item.id] = item.inspection_notes
        }
      })
      setItemQualities(qualities)
      setItemNotes(notes)
      if (collection.inspection_notes) {
        setInspectionNotes(collection.inspection_notes)
      }
    }
  }, [collection])

  const handleQualityChange = (itemId: number, quality: Quality) => {
    setItemQualities((prev) => ({ ...prev, [itemId]: quality }))
  }

  const handleNoteChange = (itemId: number, note: string) => {
    setItemNotes((prev) => ({ ...prev, [itemId]: note }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!collection) return false

    collection.items.forEach((item: CollectionItem) => {
      if (!itemQualities[item.id]) {
        newErrors[`quality_${item.id}`] = '请选择质检结果'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInspect = async (_status: 'inspected' | 'rejected') => {
    if (!collection || !validate()) return

    const data: InspectCollectionRequest = {
      inspection_notes: inspectionNotes,
      items: collection.items.map((item: CollectionItem) => ({
        id: item.id,
        quality: itemQualities[item.id] || 'good',
        inspection_notes: itemNotes[item.id],
      })),
    }

    const result = await inspectCollection(collection.id, data)
    if (result) {
      navigate('/collections')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="space-y-6">
        <Link to="/collections" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          <span>返回列表</span>
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || '加载失败'}
        </div>
      </div>
    )
  }

  const isPending = collection.status === 'pending'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/collections" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">回收登记详情 #{collection.id}</h1>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
              collection.status
            )}`}
          >
            {getStatusText(collection.status)}
          </span>
        </div>
        {isPending && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleInspect('rejected')}
              disabled={inspectLoading}
              className="btn-danger flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>拒绝</span>
            </button>
            <button
              onClick={() => handleInspect('inspected')}
              disabled={inspectLoading}
              className="btn-success flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>通过质检</span>
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">回收人</p>
            <p className="text-lg font-medium text-gray-900">{collection.collector}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">回收日期</p>
            <p className="text-lg font-medium text-gray-900">
              {formatDate(collection.collection_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">总数量</p>
            <p className="text-lg font-medium text-gray-900">{collection.total_quantity} 件</p>
          </div>
          {collection.inspected_at && (
            <>
              <div>
                <p className="text-sm text-gray-500">质检人</p>
                <p className="text-lg font-medium text-gray-900">
                  {collection.inspector?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">质检时间</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(collection.inspected_at)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">回收明细</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">款式</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">尺码</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">数量</th>
                {!isPending && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">质检结果</th>
                )}
                {isPending && (
                  <>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      质检结果
                      <span className="text-red-500">*</span>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">备注</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {collection.items.map((item: CollectionItem) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">{item.style?.name}</td>
                  <td className="py-3 px-4 text-gray-700">{item.size?.name}</td>
                  <td className="py-3 px-4 text-gray-700">{item.quantity}</td>
                  {isPending ? (
                    <>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <select
                            value={itemQualities[item.id] || ''}
                            onChange={(e) =>
                              handleQualityChange(item.id, e.target.value as Quality)
                            }
                            className={`input w-32 text-sm ${
                              errors[`quality_${item.id}`] ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="">请选择</option>
                            <option value="good">良好</option>
                            <option value="damaged">损坏</option>
                            <option value="scrap">报废</option>
                          </select>
                          {errors[`quality_${item.id}`] && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={itemNotes[item.id] || ''}
                          onChange={(e) => handleNoteChange(item.id, e.target.value)}
                          placeholder="质检备注"
                          className="input text-sm w-40"
                        />
                      </td>
                    </>
                  ) : (
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                            item.quality || ''
                          )}`}
                        >
                          {getStatusText(item.quality || '')}
                        </span>
                        {item.inspection_notes && (
                          <span className="text-sm text-gray-500">
                            ({item.inspection_notes})
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPending && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">质检备注</h2>
          <textarea
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
            rows={3}
            placeholder="请输入质检备注（可选）"
            className="input"
          />
        </div>
      )}

      {isPending && (
        <div className="flex items-center justify-end space-x-4">
          <Link to="/collections" className="btn-secondary">
            取消
          </Link>
          <button
            onClick={() => handleInspect('rejected')}
            disabled={inspectLoading}
            className="btn-danger flex items-center space-x-2"
          >
            {inspectLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>处理中...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>拒绝</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleInspect('inspected')}
            disabled={inspectLoading}
            className="btn-success flex items-center space-x-2"
          >
            {inspectLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>处理中...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>通过质检</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default CollectionDetail
