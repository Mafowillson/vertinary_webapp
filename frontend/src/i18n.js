import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'

function setDocumentLanguage(lng) {
  const code = (lng || 'en').split('-')[0]
  document.documentElement.lang = code
}

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'fr', 'zh', 'hi', 'es'],
    fallbackLng: 'en',
    ns: ['common', 'auth', 'product', 'checkout', 'library', 'errors', 'landing', 'about', 'services', 'legal', 'adminDashboard', 'adminProducts', 'adminOrders', 'adminUsers', 'adminAnalytics', 'adminSettings'],
    defaultNS: 'common',
    debug: !import.meta.env.PROD,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  })
  .then(() => {
    document.documentElement.dir = 'ltr'
    setDocumentLanguage(i18n.language)
  })

i18n.on('languageChanged', (lng) => {
  setDocumentLanguage(lng)
})

export default i18n
