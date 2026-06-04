import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCart } from '../../contexts/CartContext'
import {
  FiMenu, FiX, FiUser, FiShoppingCart, FiLogOut
} from 'react-icons/fi'
import CurrencySelector from '../CurrencySelector/CurrencySelector'
import LanguageSwitcher from '../LanguageSwitcher'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const { t } = useLanguage()
  const { getCartItemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const cartItemCount = getCartItemCount()
  const tc = (key) => t(key, { ns: 'common' })

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const handleSectionClick = (sectionId, e) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const navLinks = [
    { label: tc('nav.home'),       to: '/',         type: 'link' },
    { label: tc('nav.catalogue'),  to: '/products', type: 'link' },
    { label: tc('nav.categories'), hash: 'categories', type: 'hash' },
    { label: tc('nav.resources'),  hash: 'resources',  type: 'hash' },
    { label: tc('nav.services'),   to: '/services', type: 'link' },
    { label: tc('nav.about'),      hash: 'about',   type: 'hash' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/academydeseleveurs.png"
              alt="Académie des Éleveurs"
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const active = link.type === 'link' && isActive(link.to)
              if (link.type === 'hash') {
                return (
                  <a
                    key={link.hash}
                    href={`#${link.hash}`}
                    onClick={(e) => handleSectionClick(link.hash, e)}
                    className="relative px-3 py-2 text-sm font-semibold text-gray-600 hover:text-[#1A7A6E] hover:bg-green-50 rounded-lg transition-all cursor-pointer"
                  >
                    {link.label}
                  </a>
                )
              }
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                    active
                      ? 'text-[#1A7A6E] bg-green-50'
                      : 'text-gray-600 hover:text-[#1A7A6E] hover:bg-green-50'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-[#1A7A6E] rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher />
            <CurrencySelector />

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 pl-3 ml-1 border-l border-gray-200">
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="text-sm font-semibold text-gray-700 hover:text-[#1A7A6E] hover:bg-green-50 px-3 py-2 rounded-lg transition-all"
                  >
                    {tc('nav.admin')}
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="relative p-2.5 text-gray-600 hover:text-[#1A7A6E] hover:bg-green-50 rounded-xl transition-all"
                  title={tc('nav.cart')}
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#1A7A6E] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 leading-none">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-1 pl-1 border-l border-gray-200">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center" title={user?.email}>
                    <FiUser className="w-4 h-4 text-[#1A7A6E]" />
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title={tc('nav.logout')}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200">
                <Link
                  to="/login"
                  className="text-sm font-bold text-gray-700 hover:text-[#1A7A6E] hover:bg-green-50 px-4 py-2 rounded-xl transition-all"
                >
                  {tc('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-[#1A7A6E] hover:bg-[#155f55] text-white px-5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  {tc('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="lg:hidden flex items-center gap-1">
            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-[#1A7A6E] hover:bg-green-50 rounded-xl transition-all"
              >
                <FiShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#1A7A6E] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-[#1A7A6E] hover:bg-green-50 rounded-xl transition-all"
              aria-label={tc('nav.toggleMenu')}
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
            {navLinks.map((link) => {
              const active = link.type === 'link' && isActive(link.to)
              if (link.type === 'hash') {
                return (
                  <a
                    key={link.hash}
                    href={`#${link.hash}`}
                    onClick={(e) => handleSectionClick(link.hash, e)}
                    className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#1A7A6E] hover:bg-green-50 rounded-xl transition-all cursor-pointer"
                  >
                    {link.label}
                  </a>
                )
              }
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    active
                      ? 'text-[#1A7A6E] bg-green-50'
                      : 'text-gray-700 hover:text-[#1A7A6E] hover:bg-green-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {/* Language + Currency */}
            <div className="flex flex-wrap items-center gap-3 px-4 pt-3 pb-2 border-t border-gray-100 !mt-3">
              <LanguageSwitcher />
              <CurrencySelector />
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="px-4 pt-3 pb-2 border-t border-gray-100 !mt-3 space-y-2">
                {isAdmin() && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-[#1A7A6E] hover:bg-green-50 rounded-xl transition-all"
                  >
                    {tc('nav.admin')}
                  </Link>
                )}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-4 h-4 text-[#1A7A6E]" />
                    </div>
                    <span className="text-sm text-gray-600 truncate max-w-[180px]">{user?.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
                  >
                    <FiLogOut className="w-4 h-4" />
                    {tc('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 pt-3 pb-2 border-t border-gray-100 !mt-3 flex gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-bold text-gray-700 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all"
                >
                  {tc('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-bold bg-[#1A7A6E] hover:bg-[#155f55] text-white rounded-xl transition-all shadow-sm"
                >
                  {tc('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
