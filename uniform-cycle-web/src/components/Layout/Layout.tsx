import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useApp } from '../../contexts/AppContext'

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { loadAll } = useApp()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center text-sm text-gray-500">
          © 2024 制服循环管理系统. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default Layout
