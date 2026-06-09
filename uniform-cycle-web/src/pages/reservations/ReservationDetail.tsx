import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Hand, User } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import {
  reservationService,
  ApproveReservationRequest,
  RejectReservationRequest,
  PickupReservationRequest,
} from '../../services/reservation'
import { inventoryService } from '../../services/inventory'
import { formatDate } from '../../utils/date'
import { getStatusBadgeClass, getStatusText } from '../../utils/format'
import { ReservationItem } from '../../types'

const ReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')
  const [pickupNotes, setPickupNotes] = useState('')
  const [pickedUpBy, setPickedUpBy] = useState('')
  const [allocatedQuantities, setAllocatedQuantities] = useState<Record<number, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showPickupModal, setShowPickupModal] = useState(false)

  const {
    data: reservation,
    loading,
    error,
    execute: loadReservation,
  } = useApi(reservationService.getReservation)

  const {
    data: inventory,
    execute: loadInventory,
  } = useApi(inventoryService.getInventory)

  const { loading: approveLoading, execute: approveReservation } = useApi(
    reservationService.approveReservation
  )

  const { loading: rejectLoading, execute: rejectReservation } = useApi(
    reservationService.rejectReservation
  )

  const { loading: pickupLoading, execute: pickupReservation } = useApi(
    reservationService.pickupReservation
  )

  const { loading: allocateLoading, execute: allocateInventory } = useApi(
    inventoryService.allocateInventory
  )

  useEffect(() => {
    if (id) {
      loadReservation(parseInt(id))
      loadInventory()
    }
  }, [id, loadReservation, loadInventory])

  useEffect(() => {
    if (reservation) {
      const allocations: Record<number, string> = {}
      reservation.items.forEach((item: ReservationItem) => {
        allocations[item.id] = String(item.allocated_quantity || 0)
      })
      setAllocatedQuantities(allocations)
    }
  }, [reservation])

  const getAvailableStock = (styleId: number, sizeId: number) => {
    const invItem = inventory?.data?.find(
      (inv: any) => inv.style_id === styleId && inv.size_id === sizeId
    )
    return invItem?.quantity || 0
  }

  const handleAllocationChange = (itemId: number, value: string) => {
    setAllocatedQuantities((prev) => ({ ...prev, [itemId]: value }))
  }

  const validateApproval = () => {
    if (!reservation) return false
    const newErrors: Record<string, string> = {}

    reservation.items.forEach((item: ReservationItem) => {
      const allocated = parseInt(allocatedQuantities[item.id] || '0')
      const available = getAvailableStock(item.style_id, item.size_id)
      if (allocated < 0 || allocated > item.quantity) {
        newErrors[`allocation_${item.id}`] = '分配数量不能超过申请数量'
      }
      if (allocated > available) {
        newErrors[`allocation_${item.id}`] = '分配数量不能超过库存数量'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleApprove = async () => {
    if (!reservation || !validateApproval()) return

    const data: ApproveReservationRequest = {
      approval_notes: approvalNotes,
      items: reservation.items.map((item: ReservationItem) => ({
        id: item.id,
        allocated_quantity: parseInt(allocatedQuantities[item.id] || '0'),
      })),
    }

    const result = await approveReservation(reservation.id, data)
    if (result) {
      const allocateData = {
        items: reservation.items
          .filter((item: ReservationItem) => parseInt(allocatedQuantities[item.id] || '0') > 0)
          .map((item: ReservationItem) => {
            const invItem = inventory?.data?.find(
              (inv: any) => inv.style_id === item.style_id && inv.size_id === item.size_id
            )
            return {
              inventory_id: invItem?.id || 0,
              quantity: parseInt(allocatedQuantities[item.id] || '0'),
            }
          }),
      }

      await allocateInventory(allocateData)
      navigate('/reservations')
    }
  }

  const handleReject = async () => {
    if (!reservation || !rejectNotes.trim()) {
      setErrors({ reject: '请输入拒绝原因' })
      return
    }

    const data: RejectReservationRequest = {
      approval_notes: rejectNotes,
    }

    const result = await rejectReservation(reservation.id, data)
    if (result) {
      setShowRejectModal(false)
      navigate('/reservations')
    }
  }

  const handlePickup = async () => {
    if (!reservation || !pickedUpBy.trim()) {
      setErrors({ pickup: '请输入领取人' })
      return
    }

    const data: PickupReservationRequest = {
      pickup_notes: pickupNotes,
      picked_up_by: pickedUpBy,
    }

    const result = await pickupReservation(reservation.id, data)
    if (result) {
      setShowPickupModal(false)
      navigate('/reservations')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="space-y-6">
        <Link to="/reservations" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          <span>返回列表</span>
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || '加载失败'}
        </div>
      </div>
    )
  }

  const isPending = reservation.status === 'pending'
  const isApproved = reservation.status === 'approved'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/reservations" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">预约详情 #{reservation.id}</h1>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
              reservation.status
            )}`}
          >
            {getStatusText(reservation.status)}
          </span>
        </div>
        {isPending && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={rejectLoading}
              className="btn-danger flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>拒绝</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={approveLoading || allocateLoading}
              className="btn-success flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>批准</span>
            </button>
          </div>
        )}
        {isApproved && (
          <button
            onClick={() => setShowPickupModal(true)}
            disabled={pickupLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <Hand className="w-4 h-4" />
            <span>核销领取</span>
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">员工姓名</p>
            <p className="text-lg font-medium text-gray-900">{reservation.employee_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">部门</p>
            <p className="text-lg font-medium text-gray-900">{reservation.employee_department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">领取日期</p>
            <p className="text-lg font-medium text-gray-900">
              {formatDate(reservation.pickup_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">物品总数</p>
            <p className="text-lg font-medium text-gray-900">{reservation.total_items} 件</p>
          </div>
          {reservation.approver && (
            <>
              <div>
                <p className="text-sm text-gray-500">审批人</p>
                <p className="text-lg font-medium text-gray-900">{reservation.approver.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">审批时间</p>
                <p className="text-lg font-medium text-gray-900">
                  {reservation.approved_at ? formatDate(reservation.approved_at) : '-'}
                </p>
              </div>
            </>
          )}
          {reservation.picked_up_at && (
            <>
              <div>
                <p className="text-sm text-gray-500">领取人</p>
                <p className="text-lg font-medium text-gray-900">{reservation.picked_up_by}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">领取时间</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(reservation.picked_up_at)}
                </p>
              </div>
            </>
          )}
        </div>
        {reservation.approval_notes && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">审批备注</p>
            <p className="text-gray-900">{reservation.approval_notes}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">预约明细</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">款式</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">尺码</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">申请数量</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">可用库存</th>
                {isPending && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    分配数量
                  </th>
                )}
                {!isPending && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    已分配数量
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {reservation.items.map((item: ReservationItem) => {
                const available = getAvailableStock(item.style_id, item.size_id)
                return (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{item.style?.name}</td>
                    <td className="py-3 px-4 text-gray-700">{item.size?.name}</td>
                    <td className="py-3 px-4 text-gray-700">{item.quantity}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          available < item.quantity ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {available}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isPending ? (
                        <input
                          type="number"
                          min="0"
                          max={Math.min(item.quantity, available)}
                          value={allocatedQuantities[item.id] || '0'}
                          onChange={(e) => handleAllocationChange(item.id, e.target.value)}
                          className={`input w-24 ${
                            errors[`allocation_${item.id}`] ? 'border-red-500' : ''
                          }`}
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{item.allocated_quantity}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isPending && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">审批备注</h2>
          <textarea
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            rows={3}
            placeholder="请输入审批备注（可选）"
            className="input"
          />
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">拒绝预约</h3>
            </div>
            <div className="p-6">
              {errors.reject && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                  {errors.reject}
                </div>
              )}
              <div>
                <label className="label">拒绝原因</label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  rows={4}
                  placeholder="请输入拒绝原因"
                  className="input"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={rejectLoading}
                className="btn-danger"
              >
                {rejectLoading ? '处理中...' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPickupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">核销领取</h3>
            </div>
            <div className="p-6 space-y-4">
              {errors.pickup && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.pickup}
                </div>
              )}
              <div>
                <label className="label">领取人</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={pickedUpBy}
                    onChange={(e) => setPickedUpBy(e.target.value)}
                    placeholder="请输入领取人姓名"
                    className={`input pl-10 ${errors.pickup ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
              <div>
                <label className="label">领取备注</label>
                <textarea
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  rows={3}
                  placeholder="请输入领取备注（可选）"
                  className="input"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowPickupModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handlePickup}
                disabled={pickupLoading}
                className="btn-primary"
              >
                {pickupLoading ? '处理中...' : '确认领取'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservationDetail
