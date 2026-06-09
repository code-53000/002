import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, AlertTriangle, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePaginatedApi } from '../../hooks/useApi'
import { inventoryService } from '../../services/inventory'
import { getStatusBadgeClass } from '../../utils/format'
import { Inventory, UniformSize } from '../../types'
import { useApp } from '../../contexts/AppContext'

const InventoryList: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [styleFilter, setStyleFilter] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')
  const { state: appState } = useApp()

  const { data, loading, error, total, currentPage, lastPage, execute } = usePaginatedApi(
    inventoryService.getInventory
  )

  useEffect(() => {
    execute({
      page,
      per_page: 10,
      style_id: styleFilter ? parseInt(styleFilter) : undefined,
      size_id: sizeFilter ? parseInt(sizeFilter) : undefined,
    })
  }, [execute, page, styleFilter, sizeFilter])

  const filteredData = data.filter((item: Inventory) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      item.style?.name.toLowerCase().includes(searchLower) ||
      item.size?.name.toLowerCase().includes(searchLower)
    )
  })

  const getStockStatus = (item: Inventory) => {
    if (item.quantity <= item.min_stock) return 'low'
    if (item.quantity >= item.max_stock) return 'high'
    return 'normal'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">库存列表</h1>
        <Link to="/inventory/stock-in" className="btn-primary flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>批量入库</span>
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索款式或尺码..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full sm:w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                className="input w-full sm:w-32"
              >
                <option value="">全部款式</option>
                {appState.styles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="input w-full sm:w-32"
              >
                <option value="">全部尺码</option>
                {appState.sizes.map((size: UniformSize) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

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
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">款式</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">尺码</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">当前库存</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">最低库存</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">最高库存</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item: Inventory) => {
                      const stockStatus = getStockStatus(item)
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-700">{item.style?.name}</td>
                          <td className="py-3 px-4 text-gray-700">{item.size?.name}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-medium ${
                                stockStatus === 'low'
                                  ? 'text-red-600'
                                  : stockStatus === 'high'
                                  ? 'text-blue-600'
                                  : 'text-gray-900'
                              }`}
                            >
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{item.min_stock}</td>
                          <td className="py-3 px-4 text-gray-700">{item.max_stock}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {stockStatus === 'low' && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                  stockStatus === 'low'
                                    ? 'scrap'
                                    : stockStatus === 'high'
                                    ? 'processing'
                                    : 'good'
                                )}`}
                              >
                                {stockStatus === 'low'
                                  ? '库存不足'
                                  : stockStatus === 'high'
                                  ? '库存充足'
                                  : '正常'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {lastPage > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  共 {total} 条记录，第 {currentPage} / {lastPage} 页
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                    let pageNum: number
                    if (lastPage <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= lastPage - 2) {
                      pageNum = lastPage - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={currentPage === lastPage}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default InventoryList
