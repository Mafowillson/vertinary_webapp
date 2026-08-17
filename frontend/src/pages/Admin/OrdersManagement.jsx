import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  FiEye,
  FiSearch,
  FiX,
  FiDollarSign,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiCreditCard,
  FiMoreVertical,
} from 'react-icons/fi'

const OrdersManagement = () => {
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'pending', 'completed', 'failed'
  const [sortBy, setSortBy] = useState('recent') // 'recent', 'amount', 'date'
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [viewMode] = useState('cards') // 'cards' or 'timeline'

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminService.getOrders({ limit: 200 })
      setOrders(data)
    } catch (err) {
      setError(err.message || t('loadError', { ns: 'adminOrders' }))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const filterAndSortOrders = useCallback(() => {
    let filtered = [...orders]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(query) ||
          o.product?.title?.toLowerCase().includes(query) ||
          o.user?.name?.toLowerCase().includes(query) ||
          o.user?.email?.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'recent':
        default:
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })

    setFilteredOrders(filtered)
  }, [orders, searchQuery, statusFilter, sortBy])

  useEffect(() => {
    filterAndSortOrders()
  }, [filterAndSortOrders])

  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: t('statusLabels.completed', { ns: 'adminOrders' }),
          color: 'bg-green-100 text-green-700',
          icon: FiCheckCircle,
          iconColor: 'text-green-600',
        }
      case 'pending':
        return {
          label: t('statusLabels.pending', { ns: 'adminOrders' }),
          color: 'bg-yellow-100 text-yellow-700',
          icon: FiClock,
          iconColor: 'text-yellow-600',
        }
      case 'failed':
        return {
          label: t('statusLabels.failed', { ns: 'adminOrders' }),
          color: 'bg-red-100 text-red-700',
          icon: FiAlertCircle,
          iconColor: 'text-red-600',
        }
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-700',
          icon: FiClock,
          iconColor: 'text-gray-600',
        }
    }
  }

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'mobile_money':
        return t('paymentLabels.mobileMoney', { ns: 'adminOrders' })
      case 'orange_money':
        return t('paymentLabels.orangeMoney', { ns: 'adminOrders' })
      case 'bank_transfer':
        return t('paymentLabels.bankTransfer', { ns: 'adminOrders' })
      case 'online':
        return t('paymentLabels.online', { ns: 'adminOrders' })
      default:
        return t('paymentLabels.unpaid', { ns: 'adminOrders' })
    }
  }

  // Calculate statistics
  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    totalRevenue: orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + (o.amount || 0), 0),
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('header.title', { ns: 'adminOrders' })}</h1>
        <p className="text-gray-600">{t('header.subtitle', { ns: 'adminOrders' })}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('stats.total', { ns: 'adminOrders' })}
          value={stats.total}
          icon={FiPackage}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label={t('stats.completed', { ns: 'adminOrders' })}
          value={stats.completed}
          icon={FiCheckCircle}
          color="bg-green-100 text-green-600"
          change={stats.total > 0 ? `${((stats.completed / stats.total) * 100).toFixed(1)}%` : undefined}
        />
        <StatCard
          label={t('stats.pending', { ns: 'adminOrders' })}
          value={stats.pending}
          icon={FiClock}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          label={t('stats.totalRevenue', { ns: 'adminOrders' })}
          value={formatCurrency(stats.totalRevenue)}
          icon={FiDollarSign}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('filters.searchPlaceholder', { ns: 'adminOrders' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            {['all', 'pending', 'completed', 'failed'].map((status) => {
              const config = getStatusConfig(status)
              const Icon = config.icon
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    statusFilter === status
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="capitalize">{status === 'all' ? t('statusLabels.all', { ns: 'adminOrders' }) : config.label}</span>
                </button>
              )
            })}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="recent">{t('filters.sortRecent', { ns: 'adminOrders' })}</option>
            <option value="date">{t('filters.sortDate', { ns: 'adminOrders' })}</option>
            <option value="amount">{t('filters.sortAmount', { ns: 'adminOrders' })}</option>
          </select>
        </div>
      </div>

      {/* Orders Display */}
      {filteredOrders.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status)
              const StatusIcon = statusConfig.icon
              return (
                <OrderCard
                  key={order.id}
                  order={order}
                  statusConfig={statusConfig}
                  StatusIcon={StatusIcon}
                  getUserInitials={getUserInitials}
                  getPaymentMethodLabel={getPaymentMethodLabel}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  onView={() => setSelectedOrder(order)}
                />
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon
                return (
                  <OrderListItem
                    key={order.id}
                    order={order}
                    statusConfig={statusConfig}
                    StatusIcon={StatusIcon}
                    getUserInitials={getUserInitials}
                    getPaymentMethodLabel={getPaymentMethodLabel}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    onView={() => setSelectedOrder(order)}
                  />
                )
              })}
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('empty.title', { ns: 'adminOrders' })}</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all'
              ? t('empty.withFilters', { ns: 'adminOrders' })
              : t('empty.noFilters', { ns: 'adminOrders' })}
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          statusConfig={getStatusConfig(selectedOrder.status)}
          getUserInitials={getUserInitials}
          getPaymentMethodLabel={getPaymentMethodLabel}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color, change }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && <span className="text-sm font-medium text-green-600">{change}</span>}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

// Order Card Component
const OrderCard = ({
  order,
  statusConfig,
  StatusIcon,
  getUserInitials,
  getPaymentMethodLabel,
  formatCurrency,
  formatDate,
  onView,
}) => {
  const { t } = useLanguage()
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-semibold text-primary-600">#{order.order_number}</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${statusConfig.color}`}
              >
                <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                <span>{statusConfig.label}</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
              <FiCalendar className="w-3 h-3" />
              <span>{formatDate(order.created_at)}</span>
            </p>
          </div>
          <button
            onClick={onView}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Info */}
        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary-700">
              {getUserInitials(order.user?.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{order.user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{order.user?.email}</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">{t('card.product', { ns: 'adminOrders' })}</p>
          <p className="text-sm font-semibold text-gray-900">{order.product?.title}</p>
        </div>

        {/* Payment Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t('card.amount', { ns: 'adminOrders' })}</p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(order.amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">{t('card.payment', { ns: 'adminOrders' })}</p>
            <p className="text-sm font-medium text-gray-900 flex items-center justify-end space-x-1">
              <FiCreditCard className="w-4 h-4" />
              <span>{getPaymentMethodLabel(order.payment_method)}</span>
            </p>
          </div>
        </div>

        {/* View Button */}
        <button
          onClick={onView}
          className="w-full mt-4 bg-primary-50 text-primary-600 py-2 px-4 rounded-lg font-medium hover:bg-primary-100 transition-colors flex items-center justify-center space-x-2"
        >
          <FiEye className="w-4 h-4" />
          <span>{t('card.viewDetails', { ns: 'adminOrders' })}</span>
        </button>
      </div>
    </div>
  )
}

// Order List Item Component
const OrderListItem = ({
  order,
  statusConfig,
  StatusIcon,
  getUserInitials,
  getPaymentMethodLabel,
  formatCurrency,
  formatDate,
  onView,
}) => {
  const { t } = useLanguage()
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors group">
      <div className="flex items-center space-x-4">
        {/* Customer Avatar */}
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary-700">
            {getUserInitials(order.user?.name)}
          </span>
        </div>

        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-primary-600">#{order.order_number}</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${statusConfig.color}`}
              >
                <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                <span>{statusConfig.label}</span>
              </span>
            </div>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(order.amount)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">{t('list.customer', { ns: 'adminOrders' })}</p>
              <p className="font-medium text-gray-900">{order.user?.name}</p>
              <p className="text-xs text-gray-500">{order.user?.email}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">{t('list.product', { ns: 'adminOrders' })}</p>
              <p className="font-medium text-gray-900">{order.product?.title}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">{t('list.paymentAndDate', { ns: 'adminOrders' })}</p>
              <p className="font-medium text-gray-900 flex items-center space-x-1">
                <FiCreditCard className="w-4 h-4" />
                <span>{getPaymentMethodLabel(order.payment_method)}</span>
              </p>
              <p className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                <FiCalendar className="w-3 h-3" />
                <span>{formatDate(order.created_at)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onView}
          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title={t('card.viewDetails', { ns: 'adminOrders' })}
        >
          <FiEye className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Order Detail Modal
const OrderDetailModal = ({
  order,
  statusConfig,
  getUserInitials,
  getPaymentMethodLabel,
  formatCurrency,
  formatDate,
  onClose,
}) => {
  const { t } = useLanguage()
  const StatusIcon = statusConfig.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{t('modal.title', { ns: 'adminOrders' })}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.orderNumber', { ns: 'adminOrders' })}</p>
              <p className="text-lg font-bold text-primary-600">#{order.order_number}</p>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-2 ${statusConfig.color}`}
            >
              <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
              <span>{statusConfig.label}</span>
            </span>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">{t('modal.customerInfo', { ns: 'adminOrders' })}</p>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">
                  {getUserInitials(order.user?.name)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.user?.name}</p>
                <p className="text-sm text-gray-600">{order.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">{t('modal.product', { ns: 'adminOrders' })}</p>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium text-gray-900">{order.product?.title}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.amount', { ns: 'adminOrders' })}</p>
              <p className="text-xl font-bold text-primary-600">{formatCurrency(order.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.paymentMethod', { ns: 'adminOrders' })}</p>
              <p className="font-medium text-gray-900 flex items-center space-x-2">
                <FiCreditCard className="w-4 h-4" />
                <span>{getPaymentMethodLabel(order.payment_method)}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.orderDate', { ns: 'adminOrders' })}</p>
              <p className="font-medium text-gray-900 flex items-center space-x-2">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(order.created_at)}</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('modal.status', { ns: 'adminOrders' })}</p>
              <span
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.color}`}
              >
                <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                <span>{statusConfig.label}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('modal.close', { ns: 'adminOrders' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersManagement

