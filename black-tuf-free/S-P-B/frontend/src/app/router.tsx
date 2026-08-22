import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { RequireAuth } from '@/components/ProtectedRoute';
import { Home } from '@/features/products/pages/Home';
import { Products } from '@/features/products/pages/Products';
import { ProductDetail } from '@/features/products/pages/ProductDetail';
import { CategoryPage } from '@/features/products/pages/CategoryPage';
import { Wishlist } from '@/features/products/pages/Wishlist';
import { Search } from '@/features/products/pages/Search';
import { Cart } from '@/features/cart/pages/Cart';
import { Checkout } from '@/features/orders/pages/Checkout';
import { Orders } from '@/features/orders/pages/Orders';
import { OrderDetail } from '@/features/orders/pages/OrderDetail';
import { Account } from '@/features/account/pages/Account';
import { Returns } from '@/features/account/pages/Returns';
import { Notifications } from '@/features/account/pages/Notifications';
import { Support } from '@/features/account/pages/Support';
import { About } from '@/features/static/pages/About';
import { Contact } from '@/features/static/pages/Contact';
import { Help } from '@/features/static/pages/Help';
import { Terms } from '@/features/static/pages/Terms';
import { Privacy } from '@/features/static/pages/Privacy';
import { Shipping } from '@/features/static/pages/Shipping';
import { ReturnPolicy } from '@/features/static/pages/ReturnPolicy';
import { Login } from '@/features/auth/pages/Login';
import { Register } from '@/features/auth/pages/Register';
import { ForgotPassword } from '@/features/auth/pages/ForgotPassword';
import { VerifyEmail } from '@/features/auth/pages/VerifyEmail';
import { AdminDashboard } from '@/features/admin/pages/AdminDashboard';
import { AdminCustomers } from '@/features/admin/pages/AdminCustomers';
import { AdminSellers } from '@/features/admin/pages/AdminSellers';
import { AdminProducts } from '@/features/admin/pages/AdminProducts';
import { AdminOrders } from '@/features/admin/pages/AdminOrders';
import { AdminPayments } from '@/features/admin/pages/AdminPayments';
import { AdminPayouts } from '@/features/admin/pages/AdminPayouts';
import { AdminCoupons } from '@/features/admin/pages/AdminCoupons';
import { AdminBanners } from '@/features/admin/pages/AdminBanners';
import { AdminCategories } from '@/features/admin/pages/AdminCategories';
import { AdminReturns } from '@/features/admin/pages/AdminReturns';
import { AdminReviews } from '@/features/admin/pages/AdminReviews';
import { AdminSupport } from '@/features/admin/pages/AdminSupport';
import { AdminAuditLogs } from '@/features/admin/pages/AdminAuditLogs';
import { AdminSettings } from '@/features/admin/pages/AdminSettings';
import { SellerDashboard } from '@/features/seller/pages/SellerDashboard';
import { SellerProducts } from '@/features/seller/pages/SellerProducts';
import { ProductForm } from '@/features/seller/pages/ProductForm';
import { SellerOrders } from '@/features/seller/pages/SellerOrders';
import { SellerAnalytics } from '@/features/seller/pages/SellerAnalytics';
import { SellerEarnings } from '@/features/seller/pages/SellerEarnings';
import { SellerReturns } from '@/features/seller/pages/SellerReturns';
import { SellerReviews } from '@/features/seller/pages/SellerReviews';
import { SellerProfile } from '@/features/seller/pages/SellerProfile';

const Require = ({ roles, children }: { roles?: string[]; children: JSX.Element }) => (
  <RequireAuth allowedRoles={roles}>{children}</RequireAuth>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'product/:slug', element: <ProductDetail /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'deals', element: <Navigate to="/products?sort=-discount" replace /> },
      { path: 'wishlist', element: <Require roles={['customer']}><Wishlist /></Require> },
      { path: 'search', element: <Search /> },
      { path: 'cart', element: <Cart /> },
      { path: 'account', element: <Require roles={['customer']}><Account /></Require> },
      { path: 'orders', element: <Require roles={['customer']}><Orders /></Require> },
      { path: 'orders/:id', element: <Require roles={['customer']}><OrderDetail /></Require> },
      { path: 'checkout', element: <Require roles={['customer']}><Checkout /></Require> },
      { path: 'returns', element: <Require roles={['customer']}><Returns /></Require> },
      { path: 'notifications', element: <Require roles={['customer']}><Notifications /></Require> },
      { path: 'support', element: <Require roles={['customer']}><Support /></Require> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'help', element: <Help /> },
      { path: 'terms', element: <Terms /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'privacy-policy', element: <Navigate to="/privacy" replace /> },
      { path: 'shipping', element: <Shipping /> },
      { path: 'shipping-policy', element: <Navigate to="/shipping" replace /> },
      { path: 'return-policy', element: <ReturnPolicy /> },
      { path: 'docs', element: <Navigate to="/help" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      { path: 'verify-email/:token', element: <VerifyEmail /> },
    ],
  },
  {
    path: '/admin',
    element: <Require roles={['admin']}><Layout /></Require>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'sellers', element: <AdminSellers /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'payouts', element: <AdminPayouts /> },
      { path: 'coupons', element: <AdminCoupons /> },
      { path: 'banners', element: <AdminBanners /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'returns', element: <AdminReturns /> },
      { path: 'reviews', element: <AdminReviews /> },
      { path: 'support', element: <AdminSupport /> },
      { path: 'audit-logs', element: <AdminAuditLogs /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
  {
    path: '/seller',
    element: <Require roles={['seller']}><Layout /></Require>,
    children: [
      { index: true, element: <SellerDashboard /> },
      { path: 'products', element: <SellerProducts /> },
      { path: 'add-product', element: <ProductForm /> },
      { path: 'products/:id/edit', element: <ProductForm /> },
      { path: 'orders', element: <SellerOrders /> },
      { path: 'analytics', element: <SellerAnalytics /> },
      { path: 'earnings', element: <SellerEarnings /> },
      { path: 'returns', element: <SellerReturns /> },
      { path: 'reviews', element: <SellerReviews /> },
      { path: 'profile', element: <SellerProfile /> },
      { path: 'pending-approval', element: (
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Account Pending Approval</h1>
          <p className="text-muted-foreground">Your seller account has been submitted and is awaiting admin approval. We’ll email you once it’s ready.</p>
        </div>
      ) },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
