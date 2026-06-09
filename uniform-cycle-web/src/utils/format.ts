export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export const formatCurrency = (amount: number, currency: string = 'CNY'): string => {
  return amount.toLocaleString('zh-CN', {
    style: 'currency',
    currency,
  })
}

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const padZero = (num: number, length: number = 2): string => {
  return String(num).padStart(length, '0')
}

export const generateBatchNumber = (prefix: string = 'BATCH'): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = padZero(now.getMonth() + 1)
  const day = padZero(now.getDate())
  const random = Math.floor(Math.random() * 10000)
  return `${prefix}-${year}${month}${day}-${padZero(random, 4)}`
}

export const getStatusBadgeClass = (status: string): string => {
  const statusClasses: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    inspected: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    picked_up: 'bg-purple-100 text-purple-800',
    good: 'bg-green-100 text-green-800',
    damaged: 'bg-yellow-100 text-yellow-800',
    scrap: 'bg-red-100 text-red-800',
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    pending: '待处理',
    inspected: '已质检',
    approved: '已批准',
    rejected: '已拒绝',
    processing: '处理中',
    completed: '已完成',
    picked_up: '已领取',
    good: '良好',
    damaged: '损坏',
    scrap: '报废',
  }
  return statusTexts[status] || status
}
