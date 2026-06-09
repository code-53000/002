import React from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import { AuthProvider } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  )
}

export default App
