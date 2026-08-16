import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { useCurrency } from '../../contexts/CurrencyContext'

const CURRENCIES = [
  { code: 'FCFA', flag: '🇨🇲', name: 'Franc CFA' },
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'NGN', flag: '🇳🇬', name: 'Naira' },
]

const CurrencySelector = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { currency, setCurrency } = useCurrency()
  const selected = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-2 py-1.5 text-gray-700 hover:text-gray-900 transition-colors text-sm"
      >
        <span>{selected.flag}</span>
        <span className="font-medium">{selected.code}</span>
        <FiChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            {CURRENCIES.map((c) => (
              <button
                type="button"
                key={c.code}
                onClick={() => {
                  setCurrency(c.code)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 ${
                  currency === c.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <span>{c.flag}</span>
                <span className="font-medium">{c.code}</span>
                <span className="text-sm text-gray-600">{c.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CurrencySelector
