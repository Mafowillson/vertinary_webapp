import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import i18next from 'i18next'
import { useApp } from './AppContext'

const CurrencyContext = createContext(null)

const STORAGE_KEY = 'preferredCurrency'
const SUPPORTED_CURRENCIES = ['FCFA', 'USD', 'EUR', 'NGN']

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return ctx
}

export const CurrencyProvider = ({ children }) => {
  const { siteConfig } = useApp()
  const [currency, setCurrencyState] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    return saved && SUPPORTED_CURRENCIES.includes(saved) ? saved : 'FCFA'
  })

  const setCurrency = (code) => {
    if (!SUPPORTED_CURRENCIES.includes(code)) return
    setCurrencyState(code)
    localStorage.setItem(STORAGE_KEY, code)
  }

  const rates = siteConfig?.exchangeRates || { FCFA: 1 }

  const value = useMemo(() => {
    // All prices are stored/entered in the site's base currency (FCFA).
    const convert = (amountInBaseCurrency) => {
      const rate = rates[currency]
      if (!rate) return amountInBaseCurrency
      return amountInBaseCurrency * rate
    }

    const format = (amountInBaseCurrency) => {
      const converted = convert(amountInBaseCurrency)
      const locale = i18next.language || 'en'
      // FCFA/NGN conventionally show no decimals; USD/EUR show up to 2.
      const maximumFractionDigits = currency === 'FCFA' || currency === 'NGN' ? 0 : 2
      const formattedNumber = new Intl.NumberFormat(locale, { maximumFractionDigits }).format(converted)
      return `${formattedNumber} ${currency}`
    }

    return { currency, setCurrency, rates, convert, format, supportedCurrencies: SUPPORTED_CURRENCIES }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, rates])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
