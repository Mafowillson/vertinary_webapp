import { createContext, useContext, useState, useEffect } from 'react'
import { appService } from '../services/appService'

const AppContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider by design
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [socialLinks, setSocialLinks] = useState({
    whatsapp: 'https://wa.me/237699933135',
    facebook: 'https://web.facebook.com/search/top?q=l%27acad%C3%A9mie%20des%20%C3%A9leveurs',
  })
  const [siteConfig, setSiteConfig] = useState({
    siteName: "L'Académie DES Éleveurs",
    currency: 'FCFA',
    currencySymbol: 'FCFA',
    exchangeRates: { FCFA: 1, USD: 0.00164, EUR: 0.00152, NGN: 2.6 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await appService.getSiteConfig()
        setSocialLinks((prev) => config.socialLinks || prev)
        // Preserve siteName - it should never be changed/translated
        setSiteConfig((prev) => ({
          ...prev,
          ...config,
          siteName: "L'Académie DES Éleveurs" // Always keep the original site name
        }))
      } catch (error) {
        console.error('Failed to load site config:', error)
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  const updateSocialLinks = async (links) => {
    await appService.updateSocialLinks(links)
    setSocialLinks(links)
  }

  const updateExchangeRates = async (rates) => {
    const updated = await appService.updateExchangeRates(rates)
    setSiteConfig((prev) => ({ ...prev, exchangeRates: updated.exchangeRates }))
  }

  const value = {
    socialLinks,
    siteConfig,
    loading,
    updateSocialLinks,
    updateExchangeRates,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

