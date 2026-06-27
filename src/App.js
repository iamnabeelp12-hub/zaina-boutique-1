import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SiteProvider } from './context/SiteContext';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { LoginPage, RegisterPage } from './pages/LoginPage'; // Clean, direct named imports
import AccountPage from './pages/AccountPage';
import ReferralPage from './pages/ReferralPage';

// Admin Pages
import AdminGuard from './admin/AdminGuard';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AdminProductForm from './admin/pages/AdminProductForm';
import AdminCategories from './admin/pages/AdminCategories';
import AdminOrders from './admin/pages/AdminOrders';
import AdminBanners from './admin/pages/AdminBanners';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminCustomize from './admin/pages/AdminCustomize';
import AdminSEO from './admin/pages/AdminSEO';
import AdminReferrals from './admin/pages/AdminReferrals';
import AdminLogin from './admin/AdminLogin';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const ADMIN_PATH = process.env.REACT_APP_ADMIN_SECRET_PATH || 'zainab-secure-admin-2024';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <SiteProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <ToastContainer position="top-right" autoClose={3000} />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
                <Route path="/products/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
                <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
                <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
                <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
                <Route path="/order-success" element={<PublicLayout><OrderSuccessPage /></PublicLayout>} />
                <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
                <Route path="/account" element={<PublicLayout><AccountPage /></PublicLayout>} />
                <Route path="/ref/:code" element={<PublicLayout><ReferralPage /></PublicLayout>} />

                {/* Admin Routes - Hidden */}
                <Route path={`/${ADMIN_PATH}/login`} element={<AdminLogin />} />
                <Route path={`/${ADMIN_PATH}/*`} element={
                  <AdminGuard>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/products" element={<AdminProducts />} />
                        <Route path="/products/new" element={<AdminProductForm />} />
                        <Route path="/products/edit/:id" element={<AdminProductForm />} />
                        <Route path="/categories" element={<AdminCategories />} />
                        <Route path="/orders" element={<AdminOrders />} />
                        <Route path="/banners" element={<AdminBanners />} />
                        <Route path="/customers" element={<AdminCustomers />} />
                        <Route path="/customize" element={<AdminCustomize />} />
                        <Route path="/seo" element={<AdminSEO />} />
                        <Route path="/referrals" element={<AdminReferrals />} />
                      </Routes>
                    </AdminLayout>
                  </AdminGuard>
                } />
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </SiteProvider>
    </HelmetProvider>
  );
}

export default App;
