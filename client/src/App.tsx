// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';
import ProtectedRoute from './components/route/protectedRoute';
import PublicRoute from './components/route/publicRoute';
import MainLayout from './components/mainLayout';

// Pages
import LoginPage from './pages/loginPage';
import SignupPage from './pages/signupPage';
import HomePage from './pages/homePage';
import ProductsPage from './pages/productsPage';
import ProductDetailPage from './pages/productDetailPage';
import GoogleAuthSuccess from './components/googleAuthSuccess';
import { CartProvider } from './contexts/cartContext';
import CartPage from './pages/cartPage';
import UserOrders from './pages/userOrdersPage';
import OrderDetails from './pages/orderDetailsPage';
import CheckoutPage from './pages/checkoutPage';
import { AdminRoutes } from './components/route/admin/adminRoutes';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public Routes - only for not connected */}
          <Route path="login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>}/>
          
          <Route path="signup" element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute> } />

          {/* Google OAuth Callback */}
          <Route path="auth/google/success" element={<GoogleAuthSuccess />} />


          {/* Nested Route for Main Layout */}
          <Route path="/" element={<MainLayout />} >

            {/* Default Route */}
            <Route index element={<Navigate to="/products" replace />} />

            {/* Public Routes - evreyone can see */}
            <Route path="products" element={ <ProductsPage />}  />

            <Route path="products/:id" element={ <ProductDetailPage /> } />

            {/* Protected Routes - only for cnnected */}
            <Route path="home" element={
                <ProtectedRoute>
                    <HomePage />
                </ProtectedRoute>  } />

            <Route path="cart" element={
                <ProtectedRoute>
                    <CartPage />
                </ProtectedRoute>  } />

            <Route path="orders" element={
                <ProtectedRoute>
                    <UserOrders />
                </ProtectedRoute>  } />
            
            <Route path="orders/:orderId" element={
                <ProtectedRoute>
                    <OrderDetails />
                </ProtectedRoute>  } />

            <Route path="checkout" element={
                <ProtectedRoute>
                    <CheckoutPage />
                </ProtectedRoute>  } />

          </Route>

          <Route path="/admin/*" element={<AdminRoutes />} />
          
          {/* 404 Not Found */}
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;