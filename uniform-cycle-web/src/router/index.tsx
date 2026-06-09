import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout/Layout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import CollectionList from '../pages/collections/CollectionList'
import CollectionCreate from '../pages/collections/CollectionCreate'
import CollectionDetail from '../pages/collections/CollectionDetail'
import CleaningList from '../pages/cleaning/CleaningList'
import CleaningCreate from '../pages/cleaning/CleaningCreate'
import CleaningDetail from '../pages/cleaning/CleaningDetail'
import InventoryList from '../pages/inventory/InventoryList'
import InventoryStockIn from '../pages/inventory/InventoryStockIn'
import ReservationList from '../pages/reservations/ReservationList'
import ReservationCreate from '../pages/reservations/ReservationCreate'
import ReservationDetail from '../pages/reservations/ReservationDetail'
import StyleManagement from '../pages/settings/StyleManagement'
import SizeManagement from '../pages/settings/SizeManagement'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'collections',
        children: [
          {
            index: true,
            element: <CollectionList />,
          },
          {
            path: 'create',
            element: <CollectionCreate />,
          },
          {
            path: ':id',
            element: <CollectionDetail />,
          },
        ],
      },
      {
        path: 'cleaning',
        children: [
          {
            index: true,
            element: <CleaningList />,
          },
          {
            path: 'create',
            element: <CleaningCreate />,
          },
          {
            path: ':id',
            element: <CleaningDetail />,
          },
        ],
      },
      {
        path: 'inventory',
        children: [
          {
            index: true,
            element: <InventoryList />,
          },
          {
            path: 'stock-in',
            element: <InventoryStockIn />,
          },
        ],
      },
      {
        path: 'reservations',
        children: [
          {
            index: true,
            element: <ReservationList />,
          },
          {
            path: 'create',
            element: <ReservationCreate />,
          },
          {
            path: ':id',
            element: <ReservationDetail />,
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            path: 'styles',
            element: <StyleManagement />,
          },
          {
            path: 'sizes',
            element: <SizeManagement />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
