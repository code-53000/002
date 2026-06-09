import React, { useEffect } from 'react'
import { Package, Droplets, Warehouse, Calendar, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { dashboardService } from '../services/dashboard'
import { formatDate } from '../utils/date'
import { formatNumber, getStatusBadgeClass, getStatusText } from '../utils/format'

const Dashboard: React.FC = () => {
  const { data: stats, loading, error, execute } = useApi(dashboardService.getStats)

  useEffect(() => {
    execute()
  }, [execute])

  const statCards = [
    {
      label: '回收登记总数',
      value: stats?.total_collections || 0,
      icon: Package,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: '清洗批次总数',
      value: stats?.total_cleaning || 0,
      icon: Droplets,
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
    },
    {
      label: '库存总量',
      value: stats?.total_inventory || 0,
      icon: Warehouse,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: '预约领取总数',
      value: stats?.total_reservations || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ]

  const alertCards = [
    {
      label: '待质检回收',
      value: stats?.pending_inspections || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      path: '/collections?status=pending',
    },
    {
      label: '待审批预约',
      value: stats?.pending_reservations || 0,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      path: '/reservations?status=pending',
    },
    {
      label: '库存预警',
      value: stats?.low_stock_items || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      path: '/inventory',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <button onClick={() => execute()} className="btn-secondary">
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatNumber(card.value)}
                  </p>
                </div>
                <div className={`${card.lightColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {alertCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className={`${card.color} text-white rounded-lg p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <Icon className="w-8 h-8 opacity-80" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary-600" />
            <span>最近回收登记</span>
          </h2>
          <div className="space-y-3">
            {stats?.recent_collections?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无数据</p>
            ) : (
              stats?.recent_collections?.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      #{collection.id} - {collection.collector}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(collection.collection_date)} · {collection.total_quantity} 件
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                      collection.status
                    )}`}
                  >
                    {getStatusText(collection.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span>最近预约领取</span>
          </h2>
          <div className="space-y-3">
            {stats?.recent_reservations?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无数据</p>
            ) : (
              stats?.recent_reservations?.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      #{reservation.id} - {reservation.employee_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reservation.employee_department} · {reservation.total_items} 件
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                      reservation.status
                    )}`}
                  >
                    {getStatusText(reservation.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <span>库存按款式统计</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats?.inventory_by_style?.map((item) => (
            <div key={item.style_id} className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">{item.style_name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(item.total_quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
