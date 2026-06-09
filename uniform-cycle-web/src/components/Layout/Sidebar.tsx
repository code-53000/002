import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Droplets,
  Warehouse,
  Calendar,
  Settings,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    path: '/dashboard',
    label: '仪表盘',
    icon: LayoutDashboard,
  },
  {
    path: '/collections',
    label: '回收登记',
    icon: Package,
    children: [
      { path: '/collections', label: '回收列表' },
      { path: '/collections/create', label: '新建登记' },
    ],
  },
  {
    path: '/cleaning',
    label: '清洗管理',
    icon: Droplets,
    children: [
      { path: '/cleaning', label: '清洗批次' },
      { path: '/cleaning/create', label: '新建批次' },
    ],
  },
  {
    path: '/inventory',
    label: '库存管理',
    icon: Warehouse,
    children: [
      { path: '/inventory', label: '库存列表' },
      { path: '/inventory/stock-in', label: '批量入库' },
    ],
  },
  {
    path: '/reservations',
    label: '预约领取',
    icon: Calendar,
    children: [
      { path: '/reservations', label: '预约列表' },
      { path: '/reservations/create', label: '新建预约' },
    ],
  },
  {
    path: '/settings',
    label: '系统设置',
    icon: Settings,
    children: [
      { path: '/settings/styles', label: '款式管理' },
      { path: '/settings/sizes', label: '尺码管理' },
    ],
  },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const isChildActive = (children?: { path: string }[]) => {
    if (!children) return false
    return children.some(child => location.pathname === child.path)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">制服循环系统</h2>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            const childActive = isChildActive(item.children)

            return (
              <div key={item.path} className="space-y-1">
                <NavLink
                  to={item.children ? item.children[0].path : item.path}
                  onClick={onClose}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                    ${active || childActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.children && (
                    <ChevronRight className={`w-4 h-4 transition-transform ${childActive ? 'rotate-90' : ''}`} />
                  )}
                </NavLink>

                {item.children && (childActive || active) && (
                  <div className="ml-8 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={`
                          block px-3 py-2 rounded-lg text-sm transition-colors
                          ${location.pathname === child.path
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                        `}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
