import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import FloatingChat from '../FloatingChat/FloatingChat'

const Layout = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Admin keeps the site header for a consistent shell, but skips the
  // marketing footer/chat widget — it manages its own scroll area below.
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <FloatingChat />
    </div>
  )
}

export default Layout

