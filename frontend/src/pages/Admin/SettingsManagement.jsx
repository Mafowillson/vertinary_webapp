import { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  FiSave,
  FiMessageCircle,
  FiFacebook,
  FiYoutube,
  FiGlobe,
  FiSettings,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiLink,
  FiExternalLink,
  FiInfo,
  FiDollarSign,
  FiRefreshCw,
} from 'react-icons/fi'

const SettingsManagement = () => {
  const { socialLinks, updateSocialLinks, siteConfig, updateExchangeRates } = useApp()
  const { t } = useLanguage()
  const ts = (key, options) => t(key, { ns: 'adminSettings', ...options })
  const [activeTab, setActiveTab] = useState('social')
  const [formData, setFormData] = useState({
    whatsapp: '',
    facebook: '',
    youtube: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [hasChanges, setHasChanges] = useState(false)

  // Exchange rates are stored as "target units per 1 FCFA" (small decimals, e.g.
  // 0.00164), which isn't how anyone thinks about a rate. The form works in the
  // inverse, more natural direction ("how many FCFA is 1 USD worth") and converts
  // back to the stored shape on save.
  const ratesToFcfaPerUnit = (rates) => ({
    USD: rates?.USD ? (1 / rates.USD).toFixed(2) : '',
    EUR: rates?.EUR ? (1 / rates.EUR).toFixed(2) : '',
    NGN: rates?.NGN ? (1 / rates.NGN).toFixed(2) : '',
  })
  const [rateFormData, setRateFormData] = useState(() => ratesToFcfaPerUnit(siteConfig.exchangeRates))
  const [rateLoading, setRateLoading] = useState(false)
  const [rateMessage, setRateMessage] = useState({ type: '', text: '' })
  const [rateHasChanges, setRateHasChanges] = useState(false)

  useEffect(() => {
    setRateFormData(ratesToFcfaPerUnit(siteConfig.exchangeRates))
  }, [siteConfig.exchangeRates])

  useEffect(() => {
    const original = ratesToFcfaPerUnit(siteConfig.exchangeRates)
    setRateHasChanges(
      rateFormData.USD !== original.USD ||
      rateFormData.EUR !== original.EUR ||
      rateFormData.NGN !== original.NGN
    )
  }, [rateFormData, siteConfig.exchangeRates])

  const handleRateChange = (e) => {
    const { name, value } = e.target
    setRateFormData((prev) => ({ ...prev, [name]: value }))
    if (rateMessage.text) setRateMessage({ type: '', text: '' })
  }

  const isRateValid = (value) => value === '' || (Number(value) > 0 && !Number.isNaN(Number(value)))

  const handleRateSubmit = async (e) => {
    e.preventDefault()
    if (!isRateValid(rateFormData.USD) || !isRateValid(rateFormData.EUR) || !isRateValid(rateFormData.NGN)) {
      setRateMessage({ type: 'error', text: ts('exchangeRates.invalidRate') })
      return
    }
    setRateLoading(true)
    setRateMessage({ type: '', text: '' })
    try {
      const payload = {}
      if (rateFormData.USD) payload.USD = 1 / Number(rateFormData.USD)
      if (rateFormData.EUR) payload.EUR = 1 / Number(rateFormData.EUR)
      if (rateFormData.NGN) payload.NGN = 1 / Number(rateFormData.NGN)
      await updateExchangeRates(payload)
      setRateMessage({ type: 'success', text: ts('messages.updateSuccess') })
      setTimeout(() => setRateMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setRateMessage({ type: 'error', text: ts('messages.updateError') })
    } finally {
      setRateLoading(false)
    }
  }

  const handleRateReset = () => {
    setRateFormData(ratesToFcfaPerUnit(siteConfig.exchangeRates))
    setRateMessage({ type: '', text: '' })
  }

  useEffect(() => {
    setFormData({
      whatsapp: socialLinks.whatsapp || '',
      facebook: socialLinks.facebook || '',
      youtube: socialLinks.youtube || '',
    })
  }, [socialLinks])

  useEffect(() => {
    const hasChanged =
      formData.whatsapp !== (socialLinks.whatsapp || '') ||
      formData.facebook !== (socialLinks.facebook || '') ||
      formData.youtube !== (socialLinks.youtube || '')
    setHasChanges(hasChanged)
  }, [formData, socialLinks])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    if (message.text) {
      setMessage({ type: '', text: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await updateSocialLinks(formData)
      setMessage({
        type: 'success',
        text: ts('messages.updateSuccess'),
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: ts('messages.updateError'),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      whatsapp: socialLinks.whatsapp || '',
      facebook: socialLinks.facebook || '',
      youtube: socialLinks.youtube || '',
    })
    setMessage({ type: '', text: '' })
  }

  const validateUrl = (url) => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const tabs = [
    { id: 'social', label: ts('tabs.social'), icon: FiLink },
    { id: 'exchangeRates', label: ts('tabs.exchangeRates'), icon: FiDollarSign },
    { id: 'general', label: ts('tabs.general'), icon: FiSettings },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{ts('header.title')}</h1>
        <p className="text-gray-600">{ts('header.subtitle')}</p>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            {message.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <FiAlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl">
        {activeTab === 'social' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Social Media Links Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FiLink className="w-5 h-5 text-primary-600" />
                  <span>{ts('socialLinks.sectionTitle')}</span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {ts('socialLinks.sectionSubtitle')}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* WhatsApp */}
                <div className="space-y-2">
                  <label
                    htmlFor="whatsapp"
                    className="flex items-center space-x-2 text-sm font-semibold text-gray-900"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiMessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span>{ts('socialLinks.whatsapp.label')}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder={ts('socialLinks.whatsapp.placeholder')}
                      className={`w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        formData.whatsapp && !validateUrl(formData.whatsapp)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                    {formData.whatsapp && (
                      <a
                        href={formData.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700"
                        title={ts('socialLinks.testLinkTitle')}
                      >
                        <FiExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{ts('socialLinks.whatsapp.hint')}</span>
                  </div>
                  {formData.whatsapp && !validateUrl(formData.whatsapp) && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>{ts('messages.invalidUrl')}</span>
                    </p>
                  )}
                </div>

                {/* Facebook */}
                <div className="space-y-2">
                  <label
                    htmlFor="facebook"
                    className="flex items-center space-x-2 text-sm font-semibold text-gray-900"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiFacebook className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>{ts('socialLinks.facebook.label')}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder={ts('socialLinks.facebook.placeholder')}
                      className={`w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        formData.facebook && !validateUrl(formData.facebook)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                    {formData.facebook && (
                      <a
                        href={formData.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700"
                        title={ts('socialLinks.testLinkTitle')}
                      >
                        <FiExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{ts('socialLinks.facebook.hint')}</span>
                  </div>
                  {formData.facebook && !validateUrl(formData.facebook) && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>{ts('messages.invalidUrl')}</span>
                    </p>
                  )}
                </div>

                {/* YouTube */}
                <div className="space-y-2">
                  <label
                    htmlFor="youtube"
                    className="flex items-center space-x-2 text-sm font-semibold text-gray-900"
                  >
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FiYoutube className="w-5 h-5 text-red-600" />
                    </div>
                    <span>{ts('socialLinks.youtube.label')}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="youtube"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleChange}
                      placeholder={ts('socialLinks.youtube.placeholder')}
                      className={`w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        formData.youtube && !validateUrl(formData.youtube)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                    {formData.youtube && (
                      <a
                        href={formData.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700"
                        title={ts('socialLinks.testLinkTitle')}
                      >
                        <FiExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{ts('socialLinks.youtube.hint')}</span>
                  </div>
                  {formData.youtube && !validateUrl(formData.youtube) && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>{ts('messages.invalidUrl')}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  {ts('socialLinks.reset')}
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !hasChanges}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <FiSave className="w-5 h-5" />
                <span>{loading ? ts('socialLinks.saving') : ts('socialLinks.save')}</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'exchangeRates' && (
          <form onSubmit={handleRateSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FiDollarSign className="w-5 h-5 text-primary-600" />
                  <span>{ts('exchangeRates.sectionTitle')}</span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">{ts('exchangeRates.sectionSubtitle')}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Base currency (fixed) */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">{ts('exchangeRates.baseCurrencyNote')}</span>
                  <span className="text-gray-900 font-bold">1 FCFA</span>
                </div>

                {/* USD / EUR / NGN */}
                {[
                  { name: 'USD', labelKey: 'exchangeRates.usd' },
                  { name: 'EUR', labelKey: 'exchangeRates.eur' },
                  { name: 'NGN', labelKey: 'exchangeRates.ngn' },
                ].map(({ name, labelKey }) => (
                  <div key={name} className="space-y-2">
                    <label htmlFor={name} className="block text-sm font-semibold text-gray-900">
                      {ts(`${labelKey}.label`)}
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 whitespace-nowrap">1 {name} =</span>
                      <input
                        type="number"
                        id={name}
                        name={name}
                        min="0"
                        step="0.01"
                        value={rateFormData[name]}
                        onChange={handleRateChange}
                        className={`w-40 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          !isRateValid(rateFormData[name]) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">{ts('exchangeRates.unitSuffix')} {name}</span>
                    </div>
                    <p className="text-xs text-gray-500">{ts(`${labelKey}.hint`)}</p>
                    {!isRateValid(rateFormData[name]) && (
                      <p className="text-xs text-red-600 flex items-center space-x-1">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{ts('exchangeRates.invalidRate')}</span>
                      </p>
                    )}
                  </div>
                ))}

                {/* Live preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FiRefreshCw className="w-4 h-4" />
                    {ts('exchangeRates.previewTitle')}
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    {['USD', 'EUR', 'NGN'].map((code) => {
                      const fcfaPerUnit = Number(rateFormData[code])
                      const converted = fcfaPerUnit > 0 ? 50000 / fcfaPerUnit : null
                      return (
                        <div key={code} className="text-blue-800">
                          <span className="text-blue-500">{ts('exchangeRates.previewLine')}</span>{' '}
                          <span className="font-bold">
                            {converted !== null ? `${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${code}` : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {rateMessage.text && (
                  <div
                    className={`p-3 rounded-lg flex items-center space-x-2 text-sm ${
                      rateMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {rateMessage.type === 'success' ? (
                      <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{rateMessage.text}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              {rateHasChanges && (
                <button
                  type="button"
                  onClick={handleRateReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  {ts('exchangeRates.reset')}
                </button>
              )}
              <button
                type="submit"
                disabled={rateLoading || !rateHasChanges}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <FiSave className="w-5 h-5" />
                <span>{rateLoading ? ts('exchangeRates.saving') : ts('exchangeRates.save')}</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FiSettings className="w-5 h-5 text-primary-600" />
                <span>{ts('general.sectionTitle')}</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">{ts('general.sectionSubtitle')}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Site Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
                  <FiGlobe className="w-5 h-5 text-primary-600" />
                  <span>{ts('general.siteName.label')}</span>
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-gray-900 font-medium">{siteConfig.siteName}</p>
                  <p className="text-xs text-gray-500 mt-1">{ts('general.siteName.readOnlyNote')}</p>
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-900">
                  <FiDollarSign className="w-5 h-5 text-primary-600" />
                  <span>{ts('general.currency.label')}</span>
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-gray-900 font-medium">{siteConfig.currency || 'FCFA'}</p>
                  <p className="text-xs text-gray-500 mt-1">{ts('general.currency.readOnlyNote')}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">{ts('general.info.title')}</p>
                    <p className="text-sm text-blue-700">
                      {ts('general.info.text')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsManagement

