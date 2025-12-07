import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../admin/adminLayout';
import { AdminDashboard } from '../../../pages/admin/adminDashboardPage';
import { AdminProducts } from '../../../pages/admin/adminProductsPage';
import { AdminProductForm } from '../../admin/adminProductsForm';
import { AdminOrders } from '../../../pages/admin/adminOrdersPage';
import { AdminOrderDetail } from '../../../pages/admin/adminOrderDetailPage';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  // Check if user is authenticated and is a manager (role_id = 1)
  if (!token || userRole !== '1') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="./dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* Products Routes */}
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/edit/:id" element={<AdminProductForm />} />
        
        {/* Orders Routes */}
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="./dashboard" replace />} />
      </Route>
    </Routes>
  );
};