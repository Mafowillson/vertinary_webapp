import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { orderService } from '../services/orderService'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useCurrency } from '../contexts/CurrencyContext'
import StripePaymentForm from '../components/PaymentForms/StripePaymentForm'
import FlutterwavePaymentForm from '../components/PaymentForms/FlutterwavePaymentForm'
import { 
  FiArrowLeft, 
  FiCreditCard, 
  FiAlertCircle, 
  FiMail, 
  FiShield, 
  FiCheck,
  FiArrowRight,
  FiLock
} from 'react-icons/fi'

const CheckoutPage = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const tp = (k, o) => t(k, { ns: 'checkout', ...o })
  const tc = (k, o) => t(k, { ns: 'common', ...o })
  const tprod = (k, o) => t(k, { ns: 'product', ...o })
  const tlib = (k, o) => t(k, { ns: 'library', ...o })
  const { user, isAuthenticated } = useAuth()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { format } = useCurrency()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [paymentData, setPaymentData] = useState(null)

  // Determine if this is a single-product or cart checkout
  const isCartCheckout = !productId

  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (isCartCheckout) {
          // Cart checkout: use items from cart context
          if (cartItems.length === 0) {
            navigate('/cart')
            return
          }
          setProducts(cartItems)
        } else {
          // Single product checkout
          const data = await productService.getProductById(productId)
          setProducts([data])
        }
      } catch (err) {
        setError(tprod('detail.productNotFound'))
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [productId, t, isCartCheckout, cartItems.length])

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  // Calculate totals
  const subtotal = isCartCheckout
    ? getCartTotal()
    : products.reduce((total, p) => total + (p.price || 0), 0)
  const taxes = 0
  const total = subtotal + taxes

  const handlePaymentSubmit = async (data) => {
    setPaymentData(data)
    setProcessing(true)
    setError('')

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        setError(tp('payment.invalidEmail'))
        setProcessing(false)
        return
      }

      // Process orders for all products
      let lastOrderId = null

      for (const product of products) {
        const price = product.price || product.original_price || product.originalPrice || 0
        const quantity = product.quantity || 1

        // Create order for each product
        const order = await orderService.createOrder({
          productId: product.id,
          amount: price * quantity,
        })

        if (!order || !order.id) {
          throw new Error(tp('payment.orderCreationFailed'))
        }

        // Process payment for each order
        const paymentResult = await orderService.processPayment(order.id, {
          paymentMethod: data.method === 'stripe' ? 'online' : 'mobile_money',
          paymentProvider: data.method,
          paymentData: data,
          email: email,
        })

        if (!paymentResult || !paymentResult.success) {
          setError(tp('payment.paymentFailed'))
          setProcessing(false)
          return
        }

        lastOrderId = order.id
      }

      // Clear cart after successful purchase (only for cart checkout)
      if (isCartCheckout) {
        clearCart()
      }

      // Navigate to confirmation page of the last order
      navigate(`/purchase-confirmation/${lastOrderId}`)
    } catch (err) {
      console.error('Payment error:', err)
      const errorMessage = err.response?.data?.message || err.message || tp('payment.paymentError')
      setError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center bg-gray-50 min-h-screen">
        <p className="text-gray-600 text-lg mb-4">{error || tprod('detail.productNotFound')}</p>
        <button type="button" onClick={() => navigate('/products')} className="btn-primary">
          {tp('cart.backToProducts')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>{tc('buttons.back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Contact and Payment Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{tp('payment.contactInformation')}</h2>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {tp('payment.alreadyHaveAccount')} {tp('payment.logIn')}
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tp('payment.emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={isAuthenticated}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{tp('payment.paymentMethod')}</h2>
              
              {/* Payment Method Tabs */}
              <div className="flex space-x-2 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    paymentMethod === 'stripe'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tp('payment.creditDebitCard')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('flutterwave')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    paymentMethod === 'flutterwave'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tp('payment.mobileMoney')}
                </button>
              </div>

              {/* Payment Form */}
              <div className="mt-4">
                {paymentMethod === 'stripe' ? (
                  <StripePaymentForm 
                    onPaymentSubmit={handlePaymentSubmit}
                    processing={processing}
                  />
                ) : (
                  <FlutterwavePaymentForm 
                    onPaymentSubmit={handlePaymentSubmit}
                    processing={processing}
                  />
                )}
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiShield className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{tp('payment.secureSslEncryption')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-green-600 font-bold">+</span>
                </div>
                <span className="font-semibold">{tp('payment.hipaaCompliant')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-green-600">★</span>
                </div>
                <span className="font-semibold">{tp('payment.moneyBackGuarantee')}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{tp('cart.orderSummary')}</h2>
              
              {/* Product List */}
              <div className="space-y-4 mb-6 pb-6 border-b">
                {products.map((product) => {
                  const imageUrl = product.image_url || product.imageUrl
                  const price = product.price || product.original_price || product.originalPrice || 0
                  const quantity = product.quantity || 1

                  return (
                    <div key={product.id} className="flex items-start space-x-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">📚</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.title}</h3>
                        <p className="text-xs text-gray-600">
                          {product.type === 'digital'
                            ? tlib('digitalAccess')
                            : product.format || tprod('types.document')}
                          {quantity > 1 && ` × ${quantity}`}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {format(price * quantity)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
                  <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    {tp('cart.subtotal')} ({products.length}{' '}
                    {products.length === 1 ? tc('misc.article') : tc('misc.articles')})
                  </span>
                  <span>{format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{tp('cart.taxes')}</span>
                  <span>{format(taxes)}</span>
                </div>
                {products.length === 1 && products[0].originalPrice && products[0].originalPrice > products[0].price && (
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>{tp('payment.reduction')}</span>
                    <span className="text-green-600">-{format(products[0].originalPrice - products[0].price)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>{tp('cart.total')}</span>
                  <span className="text-green-600">{format(total)}</span>
                </div>
              </div>

              {/* Complete Purchase Button */}
              <button
                type="button"
                onClick={() => {
                  // Trigger form submission
                  const form = document.querySelector('form')
                  if (form) {
                    form.requestSubmit()
                  } else {
                    // If no form found, validate and submit directly
                    if (!email || !email.includes('@')) {
                      setError(tp('payment.invalidEmail'))
                      return
                    }
                    handlePaymentSubmit({
                      method: paymentMethod,
                      cardData: paymentMethod === 'stripe' ? {} : null,
                      phoneNumber: paymentMethod === 'flutterwave' ? '' : null,
                    })
                  }
                }}
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <span>{processing ? tp('payment.processing') : tp('payment.completePurchase')}</span>
                {!processing && <FiArrowRight className="w-5 h-5" />}
              </button>

              {/* Legal Text */}
              <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                {tp('payment.byCompletingPurchase')}{' '}
                <Link to="/terms" className="text-green-600 hover:underline">
                  {tp('payment.termsOfService')}
                </Link>{' '}
                {tp('payment.and')}{' '}
                <Link to="/privacy" className="text-green-600 hover:underline">
                  {tp('payment.privacyPolicy')}
                </Link>
                .
              </p>

              {/* Security Assurance */}
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-600 bg-green-50 rounded-lg p-3">
                <FiLock className="w-4 h-4 text-green-600" />
                <span className="text-center">{tp('payment.weNeverStoreCardDetails')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
