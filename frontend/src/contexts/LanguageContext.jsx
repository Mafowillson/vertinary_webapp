import { createContext, useContext, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { syncPreferredLanguageToServer } from '../lib/syncPreferredLanguage'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation()

  useEffect(() => {
    const onLang = (lng) => syncPreferredLanguageToServer(lng)
    i18n.on('languageChanged', onLang)
    return () => i18n.off('languageChanged', onLang)
  }, [i18n])

  const value = useMemo(() => {
    const lang = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]
    const t = (key, options) => i18n.t(key, options)

    return {
      t,
      language: lang,
      setLanguage: (lng) => {
        void i18n.changeLanguage(lng)
      },
      i18n,
    }
    // i18n mutates in place rather than returning a new instance on language
    // change, so `i18n.language`/`i18n.resolvedLanguage` must stay as explicit
    // deps — without them this would go stale after a language switch even
    // though the component re-renders (via useTranslation's own subscription).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n, i18n.language, i18n.resolvedLanguage])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider by design
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
