import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FiCreditCard, FiLock } from 'react-icons/fi'

const StripePaymentForm = ({ onPaymentSubmit }) => {
  const { t } = useLanguage()
  const tp = (k) => t(`payment.${k}`, { ns: 'checkout' })
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: '',
  })
  const [errors, setErrors] = useState({})

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + ' / ' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setCardData({ ...cardData, cardNumber: formatted })
    if (errors.cardNumber) {
      setErrors({ ...errors, cardNumber: '' })
    }
  }

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value)
    setCardData({ ...cardData, expiryDate: formatted })
    if (errors.expiryDate) {
      setErrors({ ...errors, expiryDate: '' })
    }
  }

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4)
    setCardData({ ...cardData, cvc: value })
    if (errors.cvc) {
      setErrors({ ...errors, cvc: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = tp('invalidCardNumber')
    }
    
    if (!cardData.expiryDate || cardData.expiryDate.length < 7) {
      newErrors.expiryDate = tp('invalidExpiryDate')
    }
    
    if (!cardData.cvc || cardData.cvc.length < 3) {
      newErrors.cvc = tp('invalidCvc')
    }
    
    if (!cardData.cardholderName || cardData.cardholderName.length < 2) {
      newErrors.cardholderName = tp('invalidCardholderName')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onPaymentSubmit({
        method: 'stripe',
        cardData: {
          number: cardData.cardNumber.replace(/\s/g, ''),
          expiry: cardData.expiryDate,
          cvc: cardData.cvc,
          name: cardData.cardholderName,
        },
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {tp('cardNumber')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            maxLength="19"
            className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
            <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div className="w-8 h-6 bg-red-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">MC</span>
            </div>
          </div>
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {tp('expiryDate')}
          </label>
          <input
            type="text"
            value={cardData.expiryDate}
            onChange={handleExpiryChange}
            placeholder="MM / YY"
            maxLength="7"
            className={`w-full py-3 px-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.expiryDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
            <span>{tp('cvc')}</span>
            <div className="group relative">
              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {tp('cvcHint')}
              </span>
            </div>
          </label>
          <input
            type="text"
            value={cardData.cvc}
            onChange={handleCvcChange}
            placeholder="123"
            maxLength="4"
            className={`w-full py-3 px-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.cvc ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.cvc && (
            <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {tp('cardholderName')}
        </label>
        <input
          type="text"
          value={cardData.cardholderName}
          onChange={(e) => {
            setCardData({ ...cardData, cardholderName: e.target.value })
            if (errors.cardholderName) {
              setErrors({ ...errors, cardholderName: '' })
            }
          }}
          placeholder={tp('cardholderNamePlaceholder')}
          className={`w-full py-3 px-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.cardholderName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.cardholderName && (
          <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
        )}
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600 pt-2">
        <FiLock className="w-4 h-4 text-green-600" />
        <span>{tp('secureTransaction')}</span>
      </div>
    </form>
  )
}

export default StripePaymentForm
