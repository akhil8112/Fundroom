import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetail from './pages/customers/CustomerDetail';

import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductDetail from './pages/products/ProductDetail';

import StockLog from './pages/stock/StockLog';
import StockMovement from './pages/stock/StockMovement';

import ChallanList from './pages/challans/ChallanList';
import ChallanCreate from './pages/challans/ChallanCreate';
import ChallanDetail from './pages/challans/ChallanDetail';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Customers */}
        <Route path="customers" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><CustomerList /></ProtectedRoute>} />
        <Route path="customers/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']}><CustomerForm /></ProtectedRoute>} />
        <Route path="customers/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><CustomerDetail /></ProtectedRoute>} />
        <Route path="customers/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']}><CustomerForm /></ProtectedRoute>} />
        
        {/* Products */}
        <Route path="products" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><ProductList /></ProtectedRoute>} />
        <Route path="products/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><ProductForm /></ProtectedRoute>} />
        <Route path="products/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><ProductDetail /></ProtectedRoute>} />
        <Route path="products/:id/edit" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><ProductForm /></ProtectedRoute>} />
        
        {/* Stock */}
        <Route path="stock/log" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><StockLog /></ProtectedRoute>} />
        <Route path="stock/movement" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}><StockMovement /></ProtectedRoute>} />
        
        {/* Challans */}
        <Route path="challans" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><ChallanList /></ProtectedRoute>} />
        <Route path="challans/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']}><ChallanCreate /></ProtectedRoute>} />
        <Route path="challans/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><ChallanDetail /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
