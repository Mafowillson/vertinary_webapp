import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useCurrency } from '../contexts/CurrencyContext'
import {
  FiShoppingCart,
  FiTrash2,
  FiArrowLeft,
  FiArrowRight,
  FiX
} from 'react-icons/fi'

const CartPage = () => {
  const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart()
  const { t } = useLanguage()
  const { format } = useCurrency()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/cart' } })
      return
    }
    
    if (cartItems.length === 0) return
    
    // Navigate to checkout (handles all cart items)
    navigate('/checkout')
  }

  const subtotal = getCartTotal()
  const taxes = 0
  const total = subtotal + taxes

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-8"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>{t('cart.backToProducts', { ns: 'checkout' })}</span>
          </Link>
          
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('nav.cart', { ns: 'common' })}</h2>
            <p className="text-gray-600 mb-8">{t('cart.empty', { ns: 'checkout' })}</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <span>{t('landing.viewProducts', { ns: 'common' })}</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>{t('cart.backToProducts', { ns: 'checkout' })}</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.cart', { ns: 'common' })}</h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>{t('cart.clear', { ns: 'checkout' })}</span>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {cartItems.map((item) => {
                const imageUrl = item.image_url || item.imageUrl
                const price = item.price || item.original_price || item.originalPrice || 0
                const originalUnit = item.original_price || item.originalPrice
                const qty = item.quantity || 1
                const lineTotal = price * qty

                return (
                  <div
                    key={item.id}
                    className="p-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">📚</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {item.description || item.category}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-green-600">
                                {format(lineTotal)}
                              </span>
                              {originalUnit && originalUnit > price && (
                                <span className="text-sm text-gray-400 line-through">
                                  {format(originalUnit * qty)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title={t('cart.removeTitle', { ns: 'checkout' })}
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('cart.orderSummary', { ns: 'checkout' })}</h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>{t('cart.subtotal', { ns: 'checkout' })}</span>
                  <span>{format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.taxes', { ns: 'checkout' })}</span>
                  <span>{format(taxes)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>{t('cart.total', { ns: 'checkout' })}</span>
                  <span className="text-green-600">{format(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <span>{t('payment.payButton', { ns: 'checkout' })}</span>
                <FiArrowRight className="w-5 h-5" />
              </button>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="block text-center text-gray-600 hover:text-green-600 transition-colors mt-4 text-sm font-medium"
              >
                {t('cart.continueShopping', { ns: 'checkout' })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
