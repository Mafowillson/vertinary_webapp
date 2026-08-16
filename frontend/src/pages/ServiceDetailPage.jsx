import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getServiceById, getServices } from '../data/mockServices'
import { useLanguage } from '../contexts/LanguageContext'
import { useApp } from '../contexts/AppContext'
import { useCurrency } from '../contexts/CurrencyContext'
import {
  FiArrowLeft, FiMessageCircle, FiCheck,
  FiArrowRight, FiPhone, FiTag
} from 'react-icons/fi'
import ServiceCard from '../components/ServiceCard/ServiceCard'

const categoryStyles = {
  training:     { gradient: 'from-blue-500 to-indigo-600',   light: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  sales:        { gradient: 'from-purple-500 to-violet-600', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  products:     { gradient: 'from-orange-400 to-red-500',    light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  construction: { gradient: 'from-yellow-400 to-amber-500',  light: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  consulting:   { gradient: 'from-teal-500 to-emerald-600',  light: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
  default:      { gradient: 'from-[#1A7A6E] to-emerald-500', light: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
}

const ServiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { format } = useCurrency()
  const { socialLinks } = useApp()
  const [service, setService] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadService = () => {
      try {
        const data = getServiceById(id, t)
        if (data) {
          setService(data)
          const all = getServices(t)
          setRelated(all.filter(s => s.id !== data.id && s.category === data.category).slice(0, 3))
        }
      } catch (error) {
        console.error('Failed to load service:', error)
      } finally {
        setLoading(false)
      }
    }
    loadService()
  }, [id, t])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1A7A6E]/20 border-t-[#1A7A6E] rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">{t('detail.loading', { ns: 'services' })}</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          {t('services.serviceNotFound', { ns: 'common' })}
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          {t('detail.notFound', { ns: 'services' })}
        </p>
        <button
          type="button"
          onClick={() => navigate('/services')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A7A6E] hover:bg-[#155f55] text-white rounded-xl font-bold text-sm transition-all"
        >
          <FiArrowLeft className="w-4 h-4" />
          {t('services.backToServices', { ns: 'common' })}
        </button>
      </div>
    )
  }

  const style = categoryStyles[service.category] ?? categoryStyles.default

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <section className={`relative bg-gradient-to-br ${style.gradient} overflow-hidden`}>
        {/* Texture blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-10 w-60 h-60 bg-black/10 rounded-full blur-[60px]" />
        </div>
        {/* Huge icon watermark */}
        <span className="pointer-events-none select-none absolute right-8 top-1/2 -translate-y-1/2 text-[16vw] opacity-10 leading-none">
          {service.icon}
        </span>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          {/* Breadcrumb / back */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold mb-8 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            {t('buttons.back', { ns: 'common' })}
          </button>

          <div className="flex flex-col md:flex-row md:items-end gap-6 max-w-3xl">
            <div className="flex-1">
              {service.featured && (
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/30 mb-4">
                  {t('services.featured', { ns: 'common' })}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                {service.title}
              </h1>
            </div>

            {/* Price chip on hero */}
            {service.price ? (
              <div className="flex-shrink-0 bg-white rounded-2xl px-6 py-4 shadow-2xl text-center min-w-[140px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t('detail.priceLabel', { ns: 'services' })}</p>
                <p className={`text-2xl font-black ${style.text}`}>{format(service.price)}</p>
              </div>
            ) : (
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 text-center min-w-[140px]">
                <FiTag className="w-5 h-5 text-white/70 mx-auto mb-1" />
                <p className="text-white text-sm font-semibold">{t('services.contactForPricing', { ns: 'common' })}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left — description + features */}
            <div className="lg:col-span-2 space-y-10">

              {/* Description */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                  {t('detail.descriptionHeading', { ns: 'services' })}
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Features */}
              {service.features?.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
                    {t('services.features', { ns: 'common' })}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feature, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-4 rounded-xl border ${style.border} ${style.light}`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <FiCheck className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-gray-700 text-sm font-medium leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — sticky contact card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">

                {/* Contact card */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                  <div className={`px-6 py-5 bg-gradient-to-br ${style.gradient}`}>
                    <h3 className="text-white font-black text-lg leading-tight">
                      {t('services.interestedInThisService', { ns: 'common' })}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      {t('services.contactUsForMoreInfo', { ns: 'common' })}
                    </p>
                  </div>

                  <div className="p-6 space-y-3">
                    {socialLinks?.whatsapp && (
                      <a
                        href={socialLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r ${style.gradient} text-white rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5`}
                      >
                        <FiMessageCircle className="w-4 h-4" />
                        {t('services.contactWhatsApp', { ns: 'common' })}
                      </a>
                    )}
                    <Link
                      to="/services"
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      {t('services.backToServices', { ns: 'common' })}
                    </Link>
                  </div>
                </div>

                {/* Quick-info chips */}
                <div className={`rounded-2xl border ${style.border} ${style.light} p-5 space-y-3`}>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('detail.quickInfo.heading', { ns: 'services' })}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('detail.quickInfo.category', { ns: 'services' })}</span>
                      <span className={`font-bold ${style.text}`}>
                        {t(`services.${service.category}`, { ns: 'common', defaultValue: service.category })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('detail.quickInfo.availability', { ns: 'services' })}</span>
                      <span className="font-bold text-gray-700">{t('detail.quickInfo.availabilityValue', { ns: 'services' })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('detail.quickInfo.zone', { ns: 'services' })}</span>
                      <span className="font-bold text-gray-700">{t('detail.quickInfo.zoneValue', { ns: 'services' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED SERVICES ────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-14 bg-gray-50/60 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{t('detail.relatedSectionLabel', { ns: 'services' })}</p>
                <h2 className="text-2xl font-black text-gray-900">
                  {t('services.otherServices', { ns: 'common' })}
                </h2>
              </div>
              <Link
                to="/services"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-[#1A7A6E] hover:underline"
              >
                {t('services.viewAllServices', { ns: 'common' })}
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map(s => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1A7A6E] hover:underline"
              >
                {t('services.viewAllServices', { ns: 'common' })}
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#1A7A6E] font-bold text-xs uppercase tracking-[0.2em] mb-3">{t('detail.bottomCta.readyLabel', { ns: 'services' })}</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
            {t('detail.bottomCta.titlePrefix', { ns: 'services' })}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A7A6E] to-teal-400">
              {t('detail.bottomCta.titleHighlight', { ns: 'services' })}
            </span>
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {t('detail.bottomCta.description', { ns: 'services' })}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {socialLinks?.whatsapp && (
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1A7A6E] hover:bg-[#155f55] text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-[#1A7A6E]/30 hover:-translate-y-0.5"
              >
                <FiPhone className="w-4 h-4" />
                {t('detail.bottomCta.whatsappButton', { ns: 'services' })}
              </a>
            )}
            <Link
              to="/services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
            >
              {t('detail.bottomCta.viewAllButton', { ns: 'services' })}
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServiceDetailPage
