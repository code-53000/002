import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { inventoryService } from '../../services/inventory'
import { UniformSize } from '../../types'
import { useApp } from '../../contexts/AppContext'

const SizeManagement: React.FC = () => {
  const { loadSizes } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editingSize, setEditingSize] = useState<UniformSize | null>(null)
  const [formData, setFormData] = useState({ name: '', code: '', sort_order: '0' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    data: sizes,
    loading,
    error,
    execute: loadData,
  } = useApi(inventoryService.getSizes)

  const { loading: createLoading, execute: createSize } = useApi(inventoryService.createSize)
  const { loading: updateLoading, execute: updateSize } = useApi(inventoryService.updateSize)
  const { loading: deleteLoading, execute: deleteSize } = useApi(inventoryService.deleteSize)

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEdit = (size: UniformSize) => {
    setEditingSize(size)
    setFormData({
      name: size.name,
      code: size.code,
      sort_order: String(size.sort_order),
    })
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingSize(null)
    setFormData({ name: '', code: '', sort_order: '0' })
    setShowModal(true)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = '请输入尺码名称'
    if (!formData.code.trim()) newErrors.code = '请输入尺码编码'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const data = {
      ...formData,
      sort_order: parseInt(formData.sort_order) || 0,
    }

    if (editingSize) {
      const result = await updateSize(editingSize.id, data)
      if (result) {
        setShowModal(false)
        loadData()
        loadSizes()
      }
    } else {
      const result = await createSize(data)
      if (result) {
        setShowModal(false)
        loadData()
        loadSizes()
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个尺码吗？')) return
    const result = await deleteSize(id)
    if (result !== null) {
      loadData()
      loadSizes()
    }
  }

  const moveSize = async (index: number, direction: 'up' | 'down') => {
    if (!sizes) return
    const sortedSizes = [...sizes].sort((a, b) => a.sort_order - b.sort_order)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sortedSizes.length) return

    const current = sortedSizes[index]
    const target = sortedSizes[targetIndex]

    await Promise.all([
      updateSize(current.id, { ...current, sort_order: target.sort_order }),
      updateSize(target.id, { ...target, sort_order: current.sort_order }),
    ])

    loadData()
    loadSizes()
  }

  const sortedSizes = sizes ? [...sizes].sort((a, b) => a.sort_order - b.sort_order) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">尺码管理</h1>
        <button onClick={handleCreate} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>新增尺码</span>
        </button>
      </div>

      <div className="card">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">排序</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">尺码名称</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">编码</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedSizes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  sortedSizes.map((size: UniformSize, index: number) => (
                    <tr
                      key={size.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveSize(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveSize(index, 'down')}
                            disabled={index === sortedSizes.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-gray-500 ml-2">{size.sort_order}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{size.name}</td>
                      <td className="py-3 px-4 text-gray-700">{size.code}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(size)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(size.id)}
                            disabled={deleteLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSize ? '编辑尺码' : '新增尺码'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">尺码名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入尺码名称，如：S、M、L"
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="label">尺码编码</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="请输入尺码编码"
                  className={`input ${errors.code ? 'border-red-500' : ''}`}
                />
                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
              </div>
              <div>
                <label className="label">排序</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  placeholder="0"
                  className="input"
                />
                <p className="mt-1 text-xs text-gray-500">数字越小排序越靠前</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={createLoading || updateLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {createLoading || updateLoading ? (
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
          </div>
        </div>
      )}
    </div>
  )
}

export default SizeManagement
