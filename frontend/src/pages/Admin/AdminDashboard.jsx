import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiFileText,
  FiSearch,
  FiBell,
  FiHelpCircle,
  FiLogOut,
  FiGrid,
  FiFolder,
  FiBarChart2,
  FiDownload,
  FiTrendingUp,
  FiMoreHorizontal,
  FiAlertCircle,
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { adminService } from '../../services/adminService'
import ProductsManagement from './ProductsManagement'
import OrdersManagement from './OrdersManagement'
import SettingsManagement from './SettingsManagement'
import Analytics from './Analytics'
import UserManagement from './UserManagement'

const AdminDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [timeframe, setTimeframe] = useState('weekly')
  const [analytics, setAnalytics] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadOverview()
  }, [timeframe])

  const loadOverview = async () => {
    setLoading(true)
    setError('')
    try {
      const [analyticsData, ordersData] = await Promise.all([
        adminService.getAnalytics(timeframe),
        adminService.getOrders({ limit: 5 }),
      ])
      setAnalytics(analyticsData)
      setRecentOrders(ordersData)
    } catch (err) {
      setError(err.message || 'Impossible de charger le tableau de bord.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'AD'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const menuItems = [
    { path: '', label: 'Tableau de bord', icon: FiGrid, section: 'main' },
    { path: 'products', label: 'Gestion du contenu', icon: FiFolder, section: 'management' },
    { path: 'orders', label: 'Commandes & Paiements', icon: FiFileText, section: 'management' },
    { path: 'users', label: 'Gestion des utilisateurs', icon: FiUsers, section: 'management' },
    { path: 'analytics', label: 'Analytique', icon: FiBarChart2, section: 'management' },
    { path: 'settings', label: 'Paramètres', icon: FiSettings, section: 'system' },
  ]

  const mainMenuItem = menuItems.find((item) => item.section === 'main')
  const managementItems = menuItems.filter((item) => item.section === 'management')
  const systemItems = menuItems.filter((item) => item.section === 'system')

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">ACADÉMIE DES ÉLEVEURS</h2>
                <p className="text-xs text-gray-500">TABLEAU DE BORD</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Dashboard Overview */}
            {mainMenuItem && (() => {
              const isActive = location.pathname === '/admin' || location.pathname === '/admin/'
              return (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <mainMenuItem.icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-primary-600' : 'text-gray-500'
                    }`}
                  />
                  <span className="font-medium text-sm">{mainMenuItem.label}</span>
                </Link>
              )
            })()}

            {/* MANAGEMENT Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
                GESTION
              </h3>
              <div className="space-y-1">
                {managementItems.map((item) => {
                  const Icon = item.icon
                  // Check if current path matches the menu item path
                  const isActive =
                    location.pathname === `/admin/${item.path}` ||
                    location.pathname.startsWith(`/admin/${item.path}/`)
                  return (
                    <Link
                      key={item.path}
                      to={`/admin/${item.path}`}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`}
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* SYSTEM Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
                SYSTÈME
              </h3>
              <div className="space-y-1">
                {systemItems.map((item) => {
                  const Icon = item.icon
                  // Check if current path matches the menu item path
                  const isActive =
                    location.pathname === `/admin/${item.path}` ||
                    location.pathname.startsWith(`/admin/${item.path}/`)
                  return (
                    <Link
                      key={item.path}
                      to={`/admin/${item.path}`}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`}
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher commandes, clients ou contenu..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Side Icons and User */}
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiBell className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiHelpCircle className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'Jean Dupont'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.role || 'Super Administrateur'}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-amber-800">
                      {getUserInitials(user?.name || 'Jean Dupont')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <Routes>
              <Route
                index
                element={
                  loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                  ) : error ? (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : (
                    <DashboardOverview
                      analytics={analytics}
                      timeframe={timeframe}
                      setTimeframe={setTimeframe}
                      recentOrders={recentOrders}
                      formatCurrency={formatCurrency}
                      user={user}
                    />
                  )
                }
              />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<SettingsManagement />} />
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page non trouvée</h2>
                      <p className="text-gray-600 mb-4">La page que vous recherchez n'existe pas.</p>
                      <Link
                        to="/admin"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Retour au tableau de bord
                      </Link>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

// Dashboard Overview Component
const DashboardOverview = ({
  analytics,
  timeframe,
  setTimeframe,
  recentOrders,
  formatCurrency,
  user,
}) => {
  const newCustomers = analytics.usersData.reduce((sum, v) => sum + v, 0)

  const metricCards = [
    {
      label: 'Ventes totales',
      value: formatCurrency(analytics.totalRevenue),
      change: `${analytics.revenueGrowth >= 0 ? '+' : ''}${analytics.revenueGrowth}%`,
      isGrowth: true,
      growthValue: analytics.revenueGrowth,
      icon: FiDollarSign,
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      label: 'Commandes complétées',
      value: analytics.totalOrders.toLocaleString(),
      change: `${analytics.ordersGrowth >= 0 ? '+' : ''}${analytics.ordersGrowth}%`,
      isGrowth: true,
      growthValue: analytics.ordersGrowth,
      icon: FiDownload,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Produits au catalogue',
      value: analytics.totalProducts,
      change: `${analytics.productsGrowth >= 0 ? '+' : ''}${analytics.productsGrowth}%`,
      isGrowth: true,
      growthValue: analytics.productsGrowth,
      icon: FiPackage,
      iconColor: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Nouveaux clients',
      value: newCustomers,
      change: `${analytics.usersGrowth >= 0 ? '+' : ''}${analytics.usersGrowth}%`,
      isGrowth: true,
      growthValue: analytics.usersGrowth,
      icon: FiUsers,
      iconColor: 'bg-purple-100 text-purple-600',
    },
  ]

  const salesData = { labels: analytics.labels, data: analytics.revenueData }
  const currentMaxSales = Math.max(...salesData.data, 1)
  const topProduct = analytics.topProducts[0]

  const statusLabel = (status) => {
    if (status === 'completed') return { text: 'PAYÉ', className: 'bg-green-100 text-green-700' }
    if (status === 'failed') return { text: 'ÉCHOUÉ', className: 'bg-red-100 text-red-700' }
    return { text: 'EN ATTENTE', className: 'bg-yellow-100 text-yellow-700' }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Title and Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue, {user?.name?.split(' ')[0] || 'Jean'}. Voici ce qui se passe aujourd'hui à
          l'académie.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.iconColor} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    card.growthValue > 0
                      ? 'text-green-600'
                      : card.growthValue < 0
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {card.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts and Progress Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Over Time Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Ventes au fil du temps</h2>
            <div className="flex space-x-2">
              {['Weekly', 'Monthly', 'Yearly'].map((period) => {
                const periodLabels = { Weekly: 'Hebdo', Monthly: 'Mensuel', Yearly: 'Annuel' }
                return (
                <button
                  key={period}
                  onClick={() => setTimeframe(period.toLowerCase())}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    timeframe === period.toLowerCase()
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {periodLabels[period]}
                </button>
                )
              })}
            </div>
          </div>
          <div className="relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-52 flex flex-col justify-between text-xs text-gray-500 pr-3 pointer-events-none">
              <span className="font-semibold text-gray-700">{formatCurrency(currentMaxSales)}</span>
              <span>{formatCurrency(Math.round(currentMaxSales / 2))}</span>
              <span className="font-semibold">0</span>
            </div>
            {/* Chart Container - Fixed height with bottom alignment */}
            <div className="flex items-end justify-between h-52 space-x-2 pb-10 pl-10">
              {salesData.data.map((sales, index) => {
                const barHeight = currentMaxSales > 0 ? (sales / currentMaxSales) * 100 : 0
                const isHighlighted = sales > 0 && sales === currentMaxSales
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center group relative h-full"
                  >
                    {/* Tooltip - positioned above the bar */}
                    <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20">
                      <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
                        <div className="font-semibold text-white">{salesData.labels[index]}</div>
                        <div className="text-primary-300 mt-0.5 font-medium">
                          {formatCurrency(sales)}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                    {/* Bar - grows from bottom */}
                    <div className="w-full h-full flex items-end justify-center relative">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-90 cursor-pointer relative ${
                          isHighlighted
                            ? 'bg-primary-600 shadow-md'
                            : 'bg-primary-200 hover:bg-primary-300'
                        }`}
                        style={{
                          height: `${Math.max(barHeight, 3)}%`,
                          minHeight: barHeight > 0 ? '6px' : '0px',
                        }}
                      />
                    </div>
                    {/* Day Label */}
                    <span
                      className={`text-xs mt-3 font-medium whitespace-nowrap transition-colors ${
                        isHighlighted ? 'text-primary-600 font-semibold' : 'text-gray-500'
                      }`}
                    >
                      {salesData.labels[index]}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Grid lines for better readability */}
            <div className="absolute inset-0 pl-10 pb-10 pointer-events-none">
              <div className="h-full flex flex-col justify-between">
                <div className="border-t border-gray-100"></div>
                <div className="border-t border-gray-100"></div>
                <div className="border-t border-gray-200"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Period Summary Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Résumé de la période</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-sm text-gray-600">Valeur moyenne des commandes</span>
              </div>
              <span className="font-semibold text-gray-900">
                {formatCurrency(analytics.averageOrderValue)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiBarChart2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-600">Taux de conversion</span>
              </div>
              <span className="font-semibold text-gray-900">
                {analytics.conversionRate}%
                <span className={analytics.conversionRateDelta >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {' '}({analytics.conversionRateDelta >= 0 ? '+' : ''}{analytics.conversionRateDelta} pts)
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiTrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">Meilleur produit</span>
              </div>
              <span className="font-semibold text-gray-900 text-right">
                {topProduct ? topProduct.name : 'Aucune vente'}
              </span>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FiPackage className="w-5 h-5" />
            <span>Gérer les produits</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
          <Link
            to="/admin/orders"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Voir toutes les commandes
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  N° COMMANDE
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  CLIENT
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PRODUIT
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PRIX
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  STATUT
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    Aucune commande pour le moment.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const status = statusLabel(order.status)
                  return (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="text-primary-600 font-medium">#{order.orderNumber || order.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary-700">
                              {getInitials(order.user?.name)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{order.user?.name || 'Utilisateur supprimé'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{order.product?.title || '—'}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{formatCurrency(order.amount)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-gray-400 hover:text-gray-600">
                          <FiMoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

