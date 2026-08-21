import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { CartProvider } from './contexts/CartContext'
import Layout from './components/Layout/Layout'
import ScrollToTop from './components/ScrollToTop'
import LandingPage from './pages/LandingPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import AboutPage from './pages/AboutPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/Auth/ResetPasswordPage'
import VerifyEmailPage from './pages/Auth/VerifyEmailPage'
import CheckoutPage from './pages/CheckoutPage'
import CartPage from './pages/CartPage'
import PurchaseConfirmationPage from './pages/PurchaseConfirmationPage'
import CoursePlayerPage from './pages/CoursePlayerPage'
import LibraryPage from './pages/LibraryPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import './styles/index.css'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <AppProvider>
            <CurrencyProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="products/:id" element={<ProductDetailPage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="services/:id" element={<ServiceDetailPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="privacy" element={<PrivacyPolicyPage />} />
                    <Route path="terms" element={<TermsOfServicePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route path="verify-email" element={<VerifyEmailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="checkout/:productId" element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="purchase-confirmation/:orderId" element={
                      <ProtectedRoute>
                        <PurchaseConfirmationPage />
                      </ProtectedRoute>
                    } />
                    <Route path="learn/:productId" element={
                      <ProtectedRoute>
                        <CoursePlayerPage />
                      </ProtectedRoute>
                    } />
                    <Route path="library" element={
                      <ProtectedRoute>
                        <LibraryPage />
                      </ProtectedRoute>
                    } />
                    <Route path="admin/*" element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                  </Route>
                </Routes>
              </Router>
            </CurrencyProvider>
            </AppProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

