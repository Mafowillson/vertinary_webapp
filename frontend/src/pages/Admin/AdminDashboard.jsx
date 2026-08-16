import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiFileText,
  FiArrowLeftCircle,
  FiGrid,
  FiFolder,
  FiBarChart2,
  FiDownload,
  FiTrendingUp,
  FiMoreHorizontal,
  FiAlertCircle,
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminService } from '../../services/adminService'
import ProductsManagement from './ProductsManagement'
import OrdersManagement from './OrdersManagement'
import SettingsManagement from './SettingsManagement'
import Analytics from './Analytics'
import UserManagement from './UserManagement'

const AdminDashboard = () => {
  const location = useLocation()
  const { user } = useAuth()
  const { t } = useLanguage()
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
      setError(err.message || t('errors.loadOverview', { ns: 'adminDashboard' }))
    } finally {
      setLoading(false)
    }
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
    { path: '', label: t('sidebar.dashboard', { ns: 'adminDashboard' }), icon: FiGrid, section: 'main' },
    { path: 'products', label: t('sidebar.products', { ns: 'adminDashboard' }), icon: FiFolder, section: 'management' },
    { path: 'orders', label: t('sidebar.orders', { ns: 'adminDashboard' }), icon: FiFileText, section: 'management' },
    { path: 'users', label: t('sidebar.users', { ns: 'adminDashboard' }), icon: FiUsers, section: 'management' },
    { path: 'analytics', label: t('sidebar.analytics', { ns: 'adminDashboard' }), icon: FiBarChart2, section: 'management' },
    { path: 'settings', label: t('sidebar.settings', { ns: 'adminDashboard' }), icon: FiSettings, section: 'system' },
  ]

  const mainMenuItem = menuItems.find((item) => item.section === 'main')
  const managementItems = menuItems.filter((item) => item.section === 'management')
  const systemItems = menuItems.filter((item) => item.section === 'system')

  const currentSectionLabel =
    [...menuItems].reverse().find((item) =>
      item.path
        ? location.pathname.startsWith(`/admin/${item.path}`)
        : location.pathname === '/admin' || location.pathname === '/admin/'
    )?.label || mainMenuItem.label

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  return (
    <div className="bg-gray-50">
      {/* h-16 (4rem) accounts for the sticky site header above this */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
          {/* Section badge — branding already lives in the site header above */}
          <div className="px-5 py-5 border-b border-gray-100">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-xl px-3 py-1.5">
              <FiGrid className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wide">{t('badge', { ns: 'adminDashboard' })}</span>
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
                {t('sidebar.sections.management', { ns: 'adminDashboard' })}
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
                {t('sidebar.sections.system', { ns: 'adminDashboard' })}
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

          {/* Back to site */}
          <div className="p-4 border-t border-gray-100">
            <Link
              to="/"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-500 hover:text-primary-700 hover:bg-primary-50 transition-colors"
            >
              <FiArrowLeftCircle className="w-5 h-5" />
              <span className="font-medium text-sm">{t('sidebar.backToSite', { ns: 'adminDashboard' })}</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Slim context bar: current section + who's logged in */}
          <header className="bg-white border-b border-gray-100 px-6 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {t('header.breadcrumbRoot', { ns: 'adminDashboard' })} <span className="text-gray-300 mx-1">/</span>
                <span className="text-primary-700">{currentSectionLabel}</span>
              </p>
              <div className="flex items-center space-x-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-400 leading-tight">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-700">
                    {getUserInitials(user?.name)}
                  </span>
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
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound.title', { ns: 'adminDashboard' })}</h2>
                      <p className="text-gray-600 mb-4">{t('notFound.description', { ns: 'adminDashboard' })}</p>
                      <Link
                        to="/admin"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {t('notFound.backToDashboard', { ns: 'adminDashboard' })}
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
  const { t } = useLanguage()
  const newCustomers = analytics.usersData.reduce((sum, v) => sum + v, 0)

  const metricCards = [
    {
      label: t('stats.totalSales', { ns: 'adminDashboard' }),
      value: formatCurrency(analytics.totalRevenue),
      change: `${analytics.revenueGrowth >= 0 ? '+' : ''}${analytics.revenueGrowth}%`,
      isGrowth: true,
      growthValue: analytics.revenueGrowth,
      icon: FiDollarSign,
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      label: t('stats.completedOrders', { ns: 'adminDashboard' }),
      value: analytics.totalOrders.toLocaleString(),
      change: `${analytics.ordersGrowth >= 0 ? '+' : ''}${analytics.ordersGrowth}%`,
      isGrowth: true,
      growthValue: analytics.ordersGrowth,
      icon: FiDownload,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      label: t('stats.catalogProducts', { ns: 'adminDashboard' }),
      value: analytics.totalProducts,
      change: `${analytics.productsGrowth >= 0 ? '+' : ''}${analytics.productsGrowth}%`,
      isGrowth: true,
      growthValue: analytics.productsGrowth,
      icon: FiPackage,
      iconColor: 'bg-orange-100 text-orange-600',
    },
    {
      label: t('stats.newCustomers', { ns: 'adminDashboard' }),
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
    if (status === 'completed')
      return { text: t('recentOrders.status.paid', { ns: 'adminDashboard' }), className: 'bg-green-100 text-green-700' }
    if (status === 'failed')
      return { text: t('recentOrders.status.failed', { ns: 'adminDashboard' }), className: 'bg-red-100 text-red-700' }
    return { text: t('recentOrders.status.pending', { ns: 'adminDashboard' }), className: 'bg-yellow-100 text-yellow-700' }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('overview.title', { ns: 'adminDashboard' })}</h1>
        <p className="text-gray-600">
          {t('overview.welcome', {
            ns: 'adminDashboard',
            name: user?.name?.split(' ')[0] || t('overview.defaultName', { ns: 'adminDashboard' }),
          })}
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
            <h2 className="text-lg font-semibold text-gray-900">{t('chart.title', { ns: 'adminDashboard' })}</h2>
            <div className="flex space-x-2">
              {['Weekly', 'Monthly', 'Yearly'].map((period) => {
                const periodLabels = {
                  Weekly: t('chart.periods.weekly', { ns: 'adminDashboard' }),
                  Monthly: t('chart.periods.monthly', { ns: 'adminDashboard' }),
                  Yearly: t('chart.periods.yearly', { ns: 'adminDashboard' }),
                }
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
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('summary.title', { ns: 'adminDashboard' })}</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-sm text-gray-600">{t('summary.averageOrderValue', { ns: 'adminDashboard' })}</span>
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
                <span className="text-sm text-gray-600">{t('summary.conversionRate', { ns: 'adminDashboard' })}</span>
              </div>
              <span className="font-semibold text-gray-900">
                {analytics.conversionRate}%
                <span className={analytics.conversionRateDelta >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {' '}({analytics.conversionRateDelta >= 0 ? '+' : ''}{analytics.conversionRateDelta} {t('summary.conversionRatePoints', { ns: 'adminDashboard' })})
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiTrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">{t('summary.bestProduct', { ns: 'adminDashboard' })}</span>
              </div>
              <span className="font-semibold text-gray-900 text-right">
                {topProduct ? topProduct.name : t('summary.noSales', { ns: 'adminDashboard' })}
              </span>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FiPackage className="w-5 h-5" />
            <span>{t('summary.manageProducts', { ns: 'adminDashboard' })}</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('recentOrders.title', { ns: 'adminDashboard' })}</h2>
          <Link
            to="/admin/orders"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            {t('recentOrders.viewAll', { ns: 'adminDashboard' })}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('recentOrders.columns.orderNumber', { ns: 'adminDashboard' })}
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('recentOrders.columns.customer', { ns: 'adminDashboard' })}
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('recentOrders.columns.product', { ns: 'adminDashboard' })}
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('recentOrders.columns.price', { ns: 'adminDashboard' })}
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('recentOrders.columns.status', { ns: 'adminDashboard' })}
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('recentOrders.columns.actions', { ns: 'adminDashboard' })}
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                    {t('recentOrders.empty', { ns: 'adminDashboard' })}
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
                          <span className="text-sm text-gray-900">{order.user?.name || t('recentOrders.deletedUser', { ns: 'adminDashboard' })}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{order.product?.title || t('recentOrders.noProduct', { ns: 'adminDashboard' })}</td>
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

