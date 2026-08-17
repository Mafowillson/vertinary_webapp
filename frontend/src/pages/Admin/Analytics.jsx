import { useState, useEffect, useCallback } from 'react'
import {
  FiDollarSign,
  FiPackage,
  FiUsers,
  FiTrendingUp,
  FiBarChart2,
  FiActivity,
  FiArrowUpRight,
  FiArrowDownRight,
  FiAlertCircle,
} from 'react-icons/fi'
import { adminService } from '../../services/adminService'
import { useLanguage } from '../../contexts/LanguageContext'

const Analytics = () => {
  const { t } = useLanguage()
  const [timeframe, setTimeframe] = useState('monthly') // 'weekly', 'monthly', 'yearly'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
    conversionRate: 0,
    conversionRateDelta: 0,
    averageOrderValue: 0,
    labels: [],
    revenueData: [],
    ordersData: [],
    usersData: [],
    topProducts: [],
  })

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminService.getAnalytics(timeframe)
      setAnalytics(data)
    } catch (err) {
      setError(err.message || t('errors.loadFailed', { ns: 'adminAnalytics' }))
    } finally {
      setLoading(false)
    }
  }, [timeframe, t])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FCFA`
    }
    return formatCurrency(amount)
  }

  const statCards = [
    {
      label: t('stats.totalRevenue', { ns: 'adminAnalytics' }),
      value: formatCompactCurrency(analytics.totalRevenue),
      icon: FiDollarSign,
      iconColor: 'bg-green-100 text-green-600',
      growth: analytics.revenueGrowth,
      trend: analytics.revenueGrowth >= 0 ? 'up' : 'down',
    },
    {
      label: t('stats.totalOrders', { ns: 'adminAnalytics' }),
      value: analytics.totalOrders.toLocaleString(),
      icon: FiPackage,
      iconColor: 'bg-blue-100 text-blue-600',
      growth: analytics.ordersGrowth,
      trend: analytics.ordersGrowth >= 0 ? 'up' : 'down',
    },
    {
      label: t('stats.totalUsers', { ns: 'adminAnalytics' }),
      value: analytics.totalUsers.toLocaleString(),
      icon: FiUsers,
      iconColor: 'bg-purple-100 text-purple-600',
      growth: analytics.usersGrowth,
      trend: analytics.usersGrowth >= 0 ? 'up' : 'down',
    },
    {
      label: t('stats.conversionRate', { ns: 'adminAnalytics' }),
      value: `${analytics.conversionRate}%`,
      icon: FiTrendingUp,
      iconColor: 'bg-orange-100 text-orange-600',
      growth: analytics.conversionRateDelta,
      trend: analytics.conversionRateDelta >= 0 ? 'up' : 'down',
      suffix: t('stats.pointsSuffix', { ns: 'adminAnalytics' }),
    },
  ]

  const maxRevenue = Math.max(...analytics.revenueData, 1)
  const maxOrders = Math.max(...analytics.ordersData, 1)
  const maxUsers = Math.max(...analytics.usersData, 1)
  const getLabels = () => analytics.labels

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('header.title', { ns: 'adminAnalytics' })}</h1>
          <p className="text-gray-600">{t('header.subtitle', { ns: 'adminAnalytics' })}</p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          {['weekly', 'monthly', 'yearly'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                timeframe === period
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t(`timeframe.${period}`, { ns: 'adminAnalytics' })}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          const TrendIcon = card.trend === 'up' ? FiArrowUpRight : FiArrowDownRight
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.iconColor} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div
                  className={`flex items-center space-x-1 text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span>{Math.abs(card.growth)}{card.suffix || '%'}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('charts.revenue.title', { ns: 'adminAnalytics' })}</h2>
              <p className="text-sm text-gray-600">{t('charts.revenue.subtitle', { ns: 'adminAnalytics' })}</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <FiTrendingUp className="w-4 h-4" />
              <span className="font-medium">+{analytics.revenueGrowth}%</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-64 space-x-2">
            {analytics.revenueData.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center mb-2 relative group">
                  <div
                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all duration-300 hover:from-primary-700 hover:to-primary-500"
                    style={{ height: `${(value / maxRevenue) * 100}%` }}
                  />
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {formatCompactCurrency(value)}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{getLabels()[index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('charts.orders.title', { ns: 'adminAnalytics' })}</h2>
              <p className="text-sm text-gray-600">{t('charts.orders.subtitle', { ns: 'adminAnalytics' })}</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <FiTrendingUp className="w-4 h-4" />
              <span className="font-medium">+{analytics.ordersGrowth}%</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-64 space-x-2">
            {analytics.ordersData.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center mb-2 relative group">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                    style={{ height: `${(value / maxOrders) * 100}%` }}
                  />
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {t('charts.orders.tooltipSales', { ns: 'adminAnalytics', count: value })}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{getLabels()[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('charts.users.title', { ns: 'adminAnalytics' })}</h2>
              <p className="text-sm text-gray-600">{t('charts.users.subtitle', { ns: 'adminAnalytics' })}</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-purple-600">
              <FiTrendingUp className="w-4 h-4" />
              <span className="font-medium">+{analytics.usersGrowth}%</span>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 space-x-1">
            {analytics.usersData.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center mb-1">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-300"
                    style={{ height: `${(value / maxUsers) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{getLabels()[index]?.slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('performance.title', { ns: 'adminAnalytics' })}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiActivity className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('performance.averageOrderValue', { ns: 'adminAnalytics' })}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCompactCurrency(analytics.averageOrderValue)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiBarChart2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('performance.conversionRate', { ns: 'adminAnalytics' })}</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.conversionRate}%</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('performance.activeProducts', { ns: 'adminAnalytics' })}</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.totalProducts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('topProducts.title', { ns: 'adminAnalytics' })}</h2>
          {analytics.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">{t('topProducts.empty', { ns: 'adminAnalytics' })}</p>
          ) : (
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{t('topProducts.salesCount', { ns: 'adminAnalytics', count: product.sales })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary-600">
                    {formatCompactCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics

