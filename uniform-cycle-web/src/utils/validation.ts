export const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isNotEmpty = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim() !== ''
}

export const isPositiveNumber = (value: number | string): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num > 0
}

export const isNonNegativeNumber = (value: number | string): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num >= 0
}

export const minLength = (value: string, min: number): boolean => {
  return value.length >= min
}

export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max
}

export const isPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

export const validateEmail = (email: string): string | null => {
  if (!isNotEmpty(email)) return '请输入邮箱地址'
  if (!isEmail(email)) return '请输入有效的邮箱地址'
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!isNotEmpty(password)) return '请输入密码'
  if (!minLength(password, 6)) return '密码长度至少为6位'
  return null
}

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!isNotEmpty(value)) return `请输入${fieldName}`
  return null
}
