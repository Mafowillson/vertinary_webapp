import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderService } from '../services/orderService'
import { useLanguage } from '../contexts/LanguageContext'
import { useApp } from '../contexts/AppContext'
import { useCurrency } from '../contexts/CurrencyContext'
import {
  FiCheck,
  FiCopy,
  FiPlayCircle,
  FiMessageCircle,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiBook,
  FiCalendar,
  FiCreditCard
} from 'react-icons/fi'

const PurchaseConfirmationPage = () => {
  const { orderId } = useParams()
  const { socialLinks } = useApp()
  const { t } = useLanguage()
  const { format } = useCurrency()
  const tx = (k, o) => t(`confirmation.${k}`, { ns: 'checkout', ...o })
  const tcp = (k, o) => t(`cart.${k}`, { ns: 'checkout', ...o })
  const tcom = (k, o) => t(`services.${k}`, { ns: 'common', ...o })
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await orderService.getOrderById(orderId)
        setOrder(data)
      } catch (error) {
        console.error('Failed to load order:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [orderId])

  const copyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center bg-gray-50 min-h-screen">
        <p className="text-gray-600 text-lg mb-4">{tx('orderNotFound')}</p>
        <Link to="/products" className="btn-primary inline-block">
          {tcp('backToProducts')}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            {/* Animated Success Circle */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <FiCheckCircle className="w-12 h-12 text-white" />
            </div>
            {/* Confetti effect using CSS */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1s' }}></div>
              <div className="absolute top-0 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.2s' }}></div>
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.1s' }}></div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {tx('completed')}!
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-2">
            {tx('thankYou')}
          </p>
          <p className="text-sm text-gray-500">
            {tx('thankYouMessage')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <FiCreditCard className="w-5 h-5 text-green-600" />
                  <span>{tx('order')} #{order.orderNumber || order.id}</span>
                </h2>
                <button
                  onClick={copyOrderNumber}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2 text-sm text-gray-600 hover:text-green-600"
                  title={tx('copyOrderNumber')}
                >
                  <FiCopy className={`w-4 h-4 ${copied ? 'text-green-600' : ''}`} />
                  {copied && <span className="text-xs text-green-600">{tx('copied')}</span>}
                </button>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center space-x-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>{tx('orderDate')}</span>
                  </span>
                  <span className="font-medium text-gray-900">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : tx('notAvailable')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center space-x-2">
                    <FiCreditCard className="w-4 h-4" />
                    <span>{tx('paymentMethod')}</span>
                  </span>
                  <span className="font-medium text-gray-900 capitalize">
                    {order.payment_method || tx('onlinePaymentMethod')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{tcp('total')}</span>
                  <span className="font-bold text-lg text-green-600">
                    {format(order.amount || order.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Information */}
            {order.product && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FiBook className="w-5 h-5 text-green-600" />
                  <span>{tx('purchasedProduct')}</span>
                </h2>
                <div className="flex items-start space-x-4">
                  {order.product.imageUrl ? (
                    <img
                      src={order.product.imageUrl}
                      alt={order.product.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBook className="w-10 h-10 text-green-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {order.product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {order.product.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {order.product.pages && (
                        <span className="flex items-center space-x-1">
                          <FiBook className="w-3 h-3" />
                          <span>
                            {order.product.pages} {tx('pages')}
                          </span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <FiCheckCircle className="w-3 h-3 text-green-600" />
                        <span>{tx('digitalAccess')}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Congratulations Message */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border border-green-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    {tx('congratulations')}!
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {tx('congratulations')} {order.product?.title || tx('thisProduct')}.{' '}
                    {tx('purchaseSuccessMessage')}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Access Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiPlayCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{tx('accessContent')}</h2>
                  <p className="text-sm text-gray-600 mt-1">{tx('accessContentInstruction')}</p>
                </div>
              </div>

              <Link
                to={`/learn/${order.productId || order.product_id || order.product?.id}`}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all"
              >
                <FiPlayCircle className="w-5 h-5" />
                <span>{tx('accessContentButton')}</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right Column - Support & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Need Help Card */}
            {socialLinks.whatsapp && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border border-green-200">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiMessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                      {tx('needHelp')}
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      {tx('contactWhatsAppHelp')}
                    </p>
                    <a
                      href={socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      <FiMessageCircle className="w-4 h-4" />
                      <span>{tcom('contactWhatsApp')}</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Security Badge */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <FiShield className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">{tx('securePurchase')}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {tx('securePurchaseMessage')}
              </p>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">{tx('faqTitle')}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {tx('faqAnswer')}
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FiCheckCircle className="w-5 h-5 text-blue-600" />
                <span>{tx('nextSteps')}</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{tx('step1')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{tx('step2')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{tx('step3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Products */}
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <span>{tcp('backToProducts')}</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PurchaseConfirmationPage
