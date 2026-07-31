import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Sales from './pages/Sales';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Categories from './pages/Categories';
import DiscountConfig from './pages/DiscountConfig';
import Labels from './pages/Labels';
import Purchases from './pages/Purchases';
import PurchaseForm from './pages/PurchaseForm';
import PurchaseDetail from './pages/PurchaseDetail';
import Settings from './pages/Settings';
import ReportInventory from './pages/ReportInventory';
import ReportSales from './pages/ReportSales';
import Users from './pages/Users';
import ChangePassword from './pages/ChangePassword';
import { CircularProgress, Box } from '@mui/material';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function HomePage() {
  const { user } = useAuth();
  // Vendedor va directo a ventas
  if (user?.role === 'vendedor') {
    return <Navigate to="/sales" replace />;
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="sales" element={<Sales />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="purchases/new" element={<PurchaseForm />} />
        <Route path="purchases/:id" element={<PurchaseDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="discounts" element={<DiscountConfig />} />
        <Route path="labels" element={<Labels />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="reports/inventory" element={<ReportInventory />} />
        <Route path="reports/sales" element={<ReportSales />} />
      </Route>
    </Routes>
  );
}
