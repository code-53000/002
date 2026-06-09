import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Eye, Filter, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react'
import { usePaginatedApi } from '../../hooks/useApi'
import { cleaningService } from '../../services/cleaning'
import { formatDate } from '../../utils/date'
import { getStatusBadgeClass, getStatusText } from '../../utils/format'
import { CleaningBatch } from '../../types'

const CleaningList: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, loading, error, total, currentPage, lastPage, execute } = usePaginatedApi(
    cleaningService.getCleaningBatches
  )

  useEffect(() => {
    execute({ page, per_page: 10, status: statusFilter || undefined })
  }, [execute, page, statusFilter])

  const filteredData = data.filter((batch: CleaningBatch) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      batch.batch_number.toLowerCase().includes(searchLower) ||
      String(batch.id).includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">清洗批次列表</h1>
        <Link to="/cleaning/create" className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>新建清洗批次</span>
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索批次号..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full sm:w-64"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input w-full sm:w-40"
              >
                <option value="">全部状态</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">批次号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">开始日期</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">结束日期</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">数量</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
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
                    filteredData.map((batch: CleaningBatch) => (
                      <tr
                        key={batch.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{batch.batch_number}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {formatDate(batch.start_date)}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {batch.end_date ? formatDate(batch.end_date) : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{batch.total_items} 件</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                              batch.status
                            )}`}
                          >
                            {getStatusText(batch.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/cleaning/${batch.id}`}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {batch.status === 'processing' && (
                              <Link
                                to={`/cleaning/${batch.id}`}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="完成清洗"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
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

export default CleaningList
