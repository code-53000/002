import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { inventoryService } from '../../services/inventory'
import { UniformStyle } from '../../types'
import { useApp } from '../../contexts/AppContext'

const StyleManagement: React.FC = () => {
  const { loadStyles } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editingStyle, setEditingStyle] = useState<UniformStyle | null>(null)
  const [formData, setFormData] = useState({ name: '', code: '', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    data: styles,
    loading,
    error,
    execute: loadData,
  } = useApi(inventoryService.getStyles)

  const { loading: createLoading, execute: createStyle } = useApi(inventoryService.createStyle)
  const { loading: updateLoading, execute: updateStyle } = useApi(inventoryService.updateStyle)
  const { loading: deleteLoading, execute: deleteStyle } = useApi(inventoryService.deleteStyle)

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEdit = (style: UniformStyle) => {
    setEditingStyle(style)
    setFormData({
      name: style.name,
      code: style.code,
      description: style.description || '',
    })
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingStyle(null)
    setFormData({ name: '', code: '', description: '' })
    setShowModal(true)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = '请输入款式名称'
    if (!formData.code.trim()) newErrors.code = '请输入款式编码'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    if (editingStyle) {
      const result = await updateStyle(editingStyle.id, formData)
      if (result) {
        setShowModal(false)
        loadData()
        loadStyles()
      }
    } else {
      const result = await createStyle(formData)
      if (result) {
        setShowModal(false)
        loadData()
        loadStyles()
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个款式吗？')) return
    const result = await deleteStyle(id)
    if (result !== null) {
      loadData()
      loadStyles()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">款式管理</h1>
        <button onClick={handleCreate} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>新增款式</span>
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">款式名称</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">编码</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">描述</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {styles?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  styles?.map((style: UniformStyle) => (
                    <tr
                      key={style.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{style.name}</td>
                      <td className="py-3 px-4 text-gray-700">{style.code}</td>
                      <td className="py-3 px-4 text-gray-700">{style.description || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(style)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(style.id)}
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
                {editingStyle ? '编辑款式' : '新增款式'}
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
                <label className="label">款式名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入款式名称"
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="label">款式编码</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="请输入款式编码"
                  className={`input ${errors.code ? 'border-red-500' : ''}`}
                />
                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
              </div>
              <div>
                <label className="label">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入描述（可选）"
                  rows={3}
                  className="input"
                />
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

export default StyleManagement
