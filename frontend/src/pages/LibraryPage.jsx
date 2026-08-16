import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiBook, FiVideo, FiHeadphones, FiFileText, FiPlayCircle, FiAlertCircle, FiShoppingBag } from 'react-icons/fi'
import { orderService } from '../services/orderService'
import { useLanguage } from '../contexts/LanguageContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatDate } from '../utils/formatters'

const FORMAT_ICONS = {
  'PDF Guide': FiFileText,
  'Video Lecture': FiVideo,
  'E-book': FiBook,
  'Audio': FiHeadphones,
}

const LibraryPage = () => {
  const { t } = useLanguage()
  const { format } = useCurrency()
  const tl = (k, o) => t(k, { ns: 'library', ...o })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await orderService.getUserOrders()
        setOrders(data.filter((o) => o.status === 'completed'))
      } catch (err) {
        setError(err.message || tl('list.loadError'))
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{tl('title')}</h1>
          <p className="text-gray-600 mt-1">{tl('list.subtitle')}</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
            <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!error && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              <FiShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-600 mb-6 max-w-sm">{tl('empty')}</p>
            <Link
              to="/products"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {tl('list.emptyCta')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map((order) => {
              const product = order.product
              const imageUrl = product?.imageUrl || product?.image_url
              const FormatIcon = FORMAT_ICONS[product?.format] || FiBook
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="relative h-36 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product?.title} className="w-full h-full object-cover" />
                    ) : (
                      <FormatIcon className="w-10 h-10 text-white/80" />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product?.title}</h3>
                    <p className="text-xs text-gray-400 mb-4">
                      {tl('list.purchasedOn', { date: formatDate(order.createdAt || order.created_at) })}
                      {' · '}
                      {format(order.amount)}
                    </p>
                    <Link
                      to={`/learn/${product?.id || order.productId}`}
                      className="mt-auto flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold text-sm py-2.5 rounded-xl transition-colors"
                    >
                      <FiPlayCircle className="w-4 h-4" />
                      {tl('list.continueButton')}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default LibraryPage
