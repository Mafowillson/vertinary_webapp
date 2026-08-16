import { useState, useEffect } from 'react'
import { productService } from '../../services/productService'
import { formatCurrency } from '../../utils/formatters'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiGrid,
  FiList,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiFilter,
  FiX,
  FiEye,
  FiAlertCircle,
} from 'react-icons/fi'
import ProductForm from '../../components/Admin/ProductForm'

const ProductsManagement = () => {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('recent') // 'recent', 'price', 'sales', 'name'

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchQuery, sortBy])

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await productService.getAllProducts()
      setProducts(data)
    } catch (err) {
      setError(err.message || t('list.errors.loadFailed', { ns: 'adminProducts' }))
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price
        case 'sales':
          return (b.purchaseCount || 0) - (a.purchaseCount || 0)
        case 'name':
          return (a.title || '').localeCompare(b.title || '')
        case 'recent':
        default:
          return (b.id || 0) - (a.id || 0)
      }
    })

    setFilteredProducts(filtered)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('list.confirm.delete', { ns: 'adminProducts' }))) {
      try {
        await productService.deleteProduct(id)
        loadProducts()
      } catch (error) {
        alert(t('list.errors.deleteFailed', { ns: 'adminProducts' }))
      }
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
    loadProducts()
  }

  // Calculate statistics
  const stats = {
    total: products.length,
    featured: products.filter((p) => p.featured).length,
    totalSales: products.reduce((sum, p) => sum + (p.purchaseCount || 0), 0),
    totalRevenue: products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.purchaseCount || 0),
      0
    ),
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('list.header.title', { ns: 'adminProducts' })}</h1>
          <p className="text-gray-600">{t('list.header.subtitle', { ns: 'adminProducts' })}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm"
        >
          <FiPlus className="w-5 h-5" />
          <span>{t('list.header.addButton', { ns: 'adminProducts' })}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('list.stats.total.label', { ns: 'adminProducts' })}
          value={stats.total}
          icon={FiPackage}
          color="bg-blue-100 text-blue-600"
          change={t('list.stats.total.change', { ns: 'adminProducts' })}
        />
        <StatCard
          label={t('list.stats.featured.label', { ns: 'adminProducts' })}
          value={stats.featured}
          icon={FiTrendingUp}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          label={t('list.stats.sales.label', { ns: 'adminProducts' })}
          value={stats.totalSales}
          icon={FiTrendingUp}
          color="bg-green-100 text-green-600"
          change={t('list.stats.sales.change', { ns: 'adminProducts' })}
        />
        <StatCard
          label={t('list.stats.revenue.label', { ns: 'adminProducts' })}
          value={formatCurrency(stats.totalRevenue)}
          icon={FiDollarSign}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('list.search.placeholder', { ns: 'adminProducts' })}
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

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="recent">{t('list.sort.recent', { ns: 'adminProducts' })}</option>
            <option value="name">{t('list.sort.name', { ns: 'adminProducts' })}</option>
            <option value="price">{t('list.sort.price', { ns: 'adminProducts' })}</option>
            <option value="sales">{t('list.sort.sales', { ns: 'adminProducts' })}</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {showForm && (
        <ProductForm product={editingProduct} onClose={handleFormClose} />
      )}

      {filteredProducts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('list.empty.title', { ns: 'adminProducts' })}</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? t('list.empty.searchHint', { ns: 'adminProducts' })
              : t('list.empty.noProductsHint', { ns: 'adminProducts' })}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>{t('list.empty.addFirstButton', { ns: 'adminProducts' })}</span>
            </button>
          )}
        </div>
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
        {change && (
          <span className="text-sm font-medium text-green-600">{change}</span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

// Product Card Component (Grid View)
const ProductCard = ({ product, onEdit, onDelete, formatCurrency }) => {
  const { t } = useLanguage()
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiPackage className="w-16 h-16 text-primary-300" />
          </div>
        )}
        {product.featured && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
            {t('list.card.featuredBadge', { ns: 'adminProducts' })}
          </div>
        )}
        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="bg-white text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-colors"
              title={t('list.actions.edit', { ns: 'adminProducts' })}
            >
              <FiEdit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="bg-white text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
              title={t('list.actions.delete', { ns: 'adminProducts' })}
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-lg font-bold text-primary-600">
              {formatCurrency(product.price)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-gray-500 line-through">
                {formatCurrency(product.originalPrice)}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FiTrendingUp className="w-4 h-4" />
              <span>{t('list.card.salesCount', { ns: 'adminProducts', count: product.purchaseCount || 0 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Product List Item Component
const ProductListItem = ({ product, onEdit, onDelete, formatCurrency }) => {
  const { t } = useLanguage()
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors group">
      <div className="flex items-center space-x-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 flex-shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiPackage className="w-8 h-8 text-primary-300" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                {product.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0">
                    {t('list.card.featuredBadge', { ns: 'adminProducts' })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-gray-500">{t('list.listItem.priceLabel', { ns: 'adminProducts' })}</span>
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <FiTrendingUp className="w-4 h-4" />
                  <span>{t('list.card.salesCount', { ns: 'adminProducts', count: product.purchaseCount || 0 })}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(product)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title={t('list.actions.edit', { ns: 'adminProducts' })}
            >
              <FiEdit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('list.actions.delete', { ns: 'adminProducts' })}
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsManagement

