import { useState, useMemo } from 'react'
import { getServices } from '../data/mockServices'
import { useLanguage } from '../contexts/LanguageContext'
import ServiceCard from '../components/ServiceCard/ServiceCard'
import SkeletonLoader from '../components/LoadingSpinner/SkeletonLoader'
import { FiArrowRight, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { founderData } from '../data/mockHomePage'

const categories = [
  { id: 'all',          labelKey: 'services.allCategories', emoji: '✦' },
  { id: 'training',     labelKey: 'services.training',      emoji: '📚' },
  { id: 'sales',        labelKey: 'services.sales',         emoji: '🛒' },
  { id: 'products',     labelKey: 'services.products',      emoji: '💊' },
  { id: 'construction', labelKey: 'services.construction',  emoji: '🏗️' },
  { id: 'consulting',   labelKey: 'services.consulting',    emoji: '🌾' },
]

const ServicesPage = () => {
  const { t, i18n } = useLanguage()
  const [selected, setSelected] = useState('all')
  const [loading] = useState(false)

  const tc = (key, opts) => t(key, { ns: 'common', ...opts })

  const services = useMemo(() => getServices(t), [t, i18n.language])

  const filtered = useMemo(
    () => selected === 'all' ? services : services.filter(s => s.category === selected),
    [services, selected]
  )

  const activeCat = categories.find(c => c.id === selected)

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0d1f1e] overflow-hidden">
        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#1A7A6E]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
        </div>
        {/* Large label */}
        <span className="pointer-events-none select-none absolute right-0 top-1/2 -translate-y-1/2 text-[22vw] font-black text-white/[0.025] leading-none tracking-tighter">
          SVC
        </span>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-emerald-400 font-bold text-xs uppercase tracking-[0.25em] mb-4">
              {tc('services.pageBadge')}
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              {tc('services.pageTitle')}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
              {tc('services.pageDescription')}
            </p>
          </div>

          {/* Quick-stat chips */}
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              { emoji: '📦', label: `${services.length} services` },
              { emoji: '🌍', label: 'Cameroun & international' },
              { emoji: '⚡', label: 'Réponse rapide' },
            ].map((chip, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                <span>{chip.emoji}</span>
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── FILTER BAR ──────────────────────────────────────────────── */}
      <section className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
            {categories.map(cat => {
              const isActive = selected === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelected(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-[#1A7A6E] text-white shadow-lg shadow-[#1A7A6E]/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-base leading-none">{cat.emoji}</span>
                  <span>{tc(cat.labelKey)}</span>
                  {isActive && (
                    <span className="ml-1 bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                      {filtered.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SERVICE GRID ────────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section heading */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  {selected === 'all' ? tc('services.allServices') : activeCat?.labelKey ? tc(activeCat.labelKey) : ''}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {tc('services.availableCount', { count: filtered.length })}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <SkeletonLoader count={6} />
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-4xl mb-6">
                <FiSearch className="w-9 h-9 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tc('services.noServicesFound')}</h3>
              <p className="text-gray-500 text-sm max-w-xs mb-6">
                {selected === 'all'
                  ? tc('services.emptyAll')
                  : tc('services.emptyCategory', { category: activeCat ? tc(activeCat.labelKey) : '' })}
              </p>
              {selected !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelected('all')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A7A6E] hover:bg-[#155f55] text-white rounded-xl font-semibold text-sm transition-all"
                >
                  {tc('services.showAllServicesCta')}
                  <FiArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-[#0d1f1e] overflow-hidden px-8 md:px-14 py-12">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#1A7A6E]/30 rounded-full blur-[80px]" />
              <div className="absolute top-0 left-1/3 w-60 h-60 bg-teal-500/10 rounded-full blur-[60px]" />
            </div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                  Une question ?
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  Parlons de votre projet<br className="hidden md:block" /> d'élevage
                </h2>
                <p className="text-gray-400 text-sm mt-3 max-w-md">
                  Notre équipe répond sous 24h pour vous accompagner dans le choix du service adapté à vos besoins.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <a
                  href={founderData.socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A7A6E] hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-[#1A7A6E]/30 whitespace-nowrap"
                >
                  Contacter via WhatsApp
                  <FiArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-sm transition-all whitespace-nowrap"
                >
                  Voir les produits
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage
