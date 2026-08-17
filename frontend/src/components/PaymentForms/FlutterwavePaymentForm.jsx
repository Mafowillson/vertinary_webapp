import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FiSmartphone, FiLock } from 'react-icons/fi'

const FlutterwavePaymentForm = ({ onPaymentSubmit }) => {
  const { t } = useLanguage()
  const tp = (k) => t(`payment.${k}`, { ns: 'checkout' })
  const [selectedMethod, setSelectedMethod] = useState('mobile_money')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [errors, setErrors] = useState({})

  const mobileMoneyOptions = [
    { id: 'mtn', name: 'MTN Mobile Money', icon: '📱', color: 'bg-yellow-500' },
    { id: 'orange', name: 'Orange Money', icon: '🍊', color: 'bg-orange-500' },
    { id: 'moov', name: 'Moov Money', icon: '💳', color: 'bg-blue-500' },
    { id: 'airtel', name: 'Airtel Money', icon: '📲', color: 'bg-red-500' },
  ]

  const formatPhoneNumber = (value) => {
    const v = value.replace(/\D/g, '')
    return v
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
    if (errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!phoneNumber || phoneNumber.length < 8) {
      newErrors.phoneNumber = tp('invalidPhoneNumber')
    }
    
    if (!selectedMethod) {
      newErrors.method = tp('pleaseSelectPaymentMethod')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onPaymentSubmit({
        method: 'flutterwave',
        provider: selectedMethod,
        phoneNumber: phoneNumber,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {tp('selectMobileMoneyProvider')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {mobileMoneyOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setSelectedMethod(option.id)
                if (errors.method) {
                  setErrors({ ...errors, method: '' })
                }
              }}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedMethod === option.id
                  ? `${option.color} border-${option.color.split('-')[1]}-600 text-white`
                  : 'border-gray-300 bg-white hover:border-gray-400 text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-2xl">{option.icon}</span>
                <span className="text-xs font-medium text-center">{option.name}</span>
              </div>
            </button>
          ))}
        </div>
        {errors.method && (
          <p className="mt-2 text-sm text-red-600">{errors.method}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
          <FiSmartphone className="w-4 h-4" />
          <span>{tp('phoneNumber')}</span>
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={tp('phoneNumberPlaceholder')}
          className={`w-full py-3 px-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">{tp('phoneNumberHint')}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>{tp('howItWorks')}:</strong> {tp('mobileMoneyInstructions')}
        </p>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600 pt-2">
        <FiLock className="w-4 h-4 text-green-600" />
        <span>{tp('secureTransaction')}</span>
      </div>
    </form>
  )
}

export default FlutterwavePaymentForm
