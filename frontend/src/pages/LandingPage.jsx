import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiArrowRight, FiCheckCircle,
  FiYoutube, FiFacebook, FiPhone, FiClock,
  FiBook, FiAward
} from 'react-icons/fi'
import { categories, featuredResources, founderData } from '../data/mockHomePage'
import { useCountdown } from '../utils/countdown'
import { getServices } from '../data/mockServices'
import { useLanguage } from '../contexts/LanguageContext'
import { useCurrency } from '../contexts/CurrencyContext'
import ServiceCard from '../components/ServiceCard/ServiceCard'

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const FeaturedResourceCard = ({ resource }) => {
  const { t } = useLanguage()
  const { format } = useCurrency()
  const originalPrice = resource.originalPrice || resource.original_price
  const discountEndDate =
    resource.discountEndDate ||
    resource.discount_end_date ||
    resource.offer_end_date ||
    resource.offerEndDate
  const hasDiscountDate = discountEndDate && new Date(discountEndDate) > new Date()
  const { timeLeft, isExpired } = useCountdown(hasDiscountDate ? discountEndDate : null)
  const hasActiveDiscount =
    originalPrice &&
    resource.price < originalPrice &&
    (!discountEndDate || (hasDiscountDate && !isExpired))
  const discountPercentage = hasActiveDiscount
    ? Math.round(((originalPrice - resource.price) / originalPrice) * 100)
    : 0

  return (
    <Link
      to={`/products/${resource.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#1A7A6E]/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden shrink-0">
        <img
          src={resource.imageUrl}
          alt={resource.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-[#1A7A6E] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide shadow-md">
            {resource.tag}
          </span>
          {hasActiveDiscount && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md">
              {t('resources.discountBadge', { ns: 'landing', percent: discountPercentage })}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-3 min-h-[2.5rem]">
          {resource.title}
        </h3>

        {/* Countdown */}
        {hasActiveDiscount && hasDiscountDate && !isExpired && (
          <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <FiClock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-amber-700 text-xs font-semibold">
              {t('resources.expiresIn', { ns: 'landing' })}{' '}
              <span className="font-mono font-bold">
                {timeLeft.days > 0 ? `${timeLeft.days}j ` : ''}
                {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="leading-none">
            {hasActiveDiscount && (
              <span className="block text-[11px] text-gray-400 line-through mb-0.5 tabular-nums">
                {format(originalPrice)}
              </span>
            )}
            <span className={`text-lg font-extrabold tabular-nums ${hasActiveDiscount ? 'text-rose-600' : 'text-gray-900'}`}>
              {format(resource.price)}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[#1A7A6E] text-xs font-bold group-hover:gap-2.5 transition-all">
            {t('resources.discover', { ns: 'landing' })} <FiArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

const CategoryCard = ({ category }) => {
  const { t } = useLanguage()
  return (
  <Link
    to={`/products?category=${encodeURIComponent(category.title)}`}
    className="group block bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all duration-300"
  >
    <div className={`w-14 h-14 ${category.bgColor} rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300`}>
      {category.icon}
    </div>
    <h3 className="text-base font-bold text-gray-900 mb-2">{category.title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed mb-4">{category.description}</p>
    <div className="flex items-center gap-1 text-[#1A7A6E] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <span>{t('categories.explore', { ns: 'landing' })}</span>
      <FiArrowRight className="w-3.5 h-3.5" />
    </div>
  </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const location = useLocation()
  const { t, language } = useLanguage()

  const services = useMemo(() => getServices(t), [t, language])
  const featuredServices = useMemo(() => services.slice(0, 4), [services])

  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1)
      const element = document.getElementById(hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [location.hash])

  return (
    <div className="bg-white min-h-screen">

      {/* ═══════════════════════════
          HERO
      ═══════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-white py-16 md:py-24">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Text */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
                <FiCheckCircle className="w-4 h-4" />
                <span>{t('hero.badge', { ns: 'landing' })}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                {t('hero.titlePrefix', { ns: 'landing' })}{' '}
                <span className="relative inline-block">
                  <span className="text-[#1A7A6E]">{t('hero.titleHighlight', { ns: 'landing' })}</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#1A7A6E]/30 rounded-full" />
                </span>
                {' '}{t('hero.titleSuffix', { ns: 'landing' })}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-xl">
                {t('hero.description', { ns: 'landing' })}
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-[#1A7A6E] hover:bg-[#155f55] text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>{t('hero.browseButton', { ns: 'landing' })}</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold px-8 py-3.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <span>{t('hero.howItWorksButton', { ns: 'landing' })}</span>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {['from-green-400 to-teal-500', 'from-teal-400 to-cyan-500', 'from-emerald-400 to-green-500', 'from-green-500 to-teal-600', 'from-teal-500 to-emerald-600'].map((grad, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br ${grad}`}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-600 font-semibold ml-1">4.9/5</span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {t('hero.socialProofPrefix', { ns: 'landing' })} <strong className="text-gray-900">5,000+</strong> {t('hero.socialProofSuffix', { ns: 'landing' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Photo with floating badges */}
            <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
              {/* Decorative ring */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 sm:w-96 sm:h-96 border-2 border-green-200/50 rounded-full" />
              </div>

              <div className="relative z-10 w-72 sm:w-80 lg:w-96">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-2 ring-green-100">
                  <img
                    src="/profile-photo.jpg"
                    alt={founderData.name}
                    className="w-full h-[420px] sm:h-[480px] object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#1A7A6E]/50 to-transparent" />
                </div>

                {/* Badge: Experience */}
                <div className="absolute -left-6 sm:-left-10 top-10 bg-white rounded-2xl shadow-xl p-3.5 border border-gray-100 z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiAward className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-gray-900 leading-none">{t('hero.experienceValue', { ns: 'landing' })}</div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">{t('hero.experienceLabel', { ns: 'landing' })}</div>
                    </div>
                  </div>
                </div>

                {/* Badge: Guides */}
                <div className="absolute -right-6 sm:-right-10 bottom-20 bg-white rounded-2xl shadow-xl p-3.5 border border-gray-100 z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiBook className="w-5 h-5 text-[#1A7A6E]" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-gray-900 leading-none">{t('hero.guidesValue', { ns: 'landing' })}</div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">{t('hero.guidesLabel', { ns: 'landing' })}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          STATS STRIP
      ═══════════════════════════ */}
      <section className="bg-[#1A7A6E] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/20">
            {[
              { emoji: '👥', value: t('stats.farmersValue', { ns: 'landing' }), label: t('stats.farmersLabel', { ns: 'landing' }) },
              { emoji: '📚', value: t('stats.guidesValue', { ns: 'landing' }), label: t('stats.guidesLabel', { ns: 'landing' }) },
              { emoji: '⭐', value: t('stats.experienceValue', { ns: 'landing' }), label: t('stats.experienceLabel', { ns: 'landing' }) },
              { emoji: '🌍', value: t('stats.countriesValue', { ns: 'landing' }), label: t('stats.countriesLabel', { ns: 'landing' }) },
            ].map((stat, i) => (
              <div key={i} className="text-center text-white lg:px-8">
                <div className="text-2xl mb-1">{stat.emoji}</div>
                <div className="text-2xl sm:text-3xl font-extrabold">{stat.value}</div>
                <div className="text-white/70 text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          CATEGORIES
      ═══════════════════════════ */}
      <section id="categories" className="py-16 sm:py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="text-[#1A7A6E] text-xs font-extrabold uppercase tracking-widest">{t('categories.eyebrow', { ns: 'landing' })}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">
                {t('categories.heading', { ns: 'landing' })}
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[#1A7A6E] font-semibold text-sm hover:gap-3 transition-all"
            >
              {t('categories.seeAll', { ns: 'landing' })} <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          FEATURED RESOURCES
      ═══════════════════════════ */}
      <section id="resources" className="py-16 sm:py-20 bg-gray-50/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="text-[#1A7A6E] text-xs font-extrabold uppercase tracking-widest">{t('resources.eyebrow', { ns: 'landing' })}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">
                {t('resources.heading', { ns: 'landing' })}
              </h2>
              <p className="text-gray-500 mt-2 text-sm max-w-xl">
                {t('resources.description', { ns: 'landing' })}
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[#1A7A6E] font-semibold text-sm hover:gap-3 transition-all whitespace-nowrap"
            >
              {t('products.seeAll', { ns: 'common' })} <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredResources.map((resource) => (
              <FeaturedResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          SERVICES
      ═══════════════════════════ */}
      <section id="services" className="py-16 sm:py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#1A7A6E] text-xs font-extrabold uppercase tracking-widest">{t('services.eyebrow', { ns: 'landing' })}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1 mb-3">
              {t('services.pageTitle', { ns: 'common' })}
            </h2>
            <p className="text-gray-500 text-base max-w-2xl mx-auto">
              {t('services.pageDescription', { ns: 'common' })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-[#1A7A6E] hover:bg-[#155f55] text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t('services.viewAllServices', { ns: 'common' })} <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          FOUNDER
      ═══════════════════════════ */}
      <section id="about" className="py-16 sm:py-20 bg-gray-50/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-5">

              {/* Image Panel */}
              <div className="lg:col-span-2 relative min-h-[280px] lg:min-h-[520px] bg-gradient-to-br from-[#1A7A6E] to-green-900">
                <img
                  src={founderData.imageUrl}
                  alt={founderData.name}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A7A6E]/90 via-[#1A7A6E]/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4">
                    <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">
                      {founderData.role}
                    </p>
                    <p className="text-white text-xl font-extrabold">
                      {founderData.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-3 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                <span className="inline-block bg-green-50 text-[#1A7A6E] text-xs font-bold px-3 py-1.5 rounded-full mb-6 w-fit border border-green-100">
                  {t('founder.eyebrow', { ns: 'landing' })}
                </span>

                <blockquote className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-6 pl-5 border-l-4 border-[#1A7A6E]">
                  {t('founder.quote', { ns: 'landing' })}
                </blockquote>

                <p className="text-gray-600 leading-relaxed mb-8 text-sm sm:text-base">
                  {founderData.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {founderData.achievements.map((achievement, i) => (
                    <div key={i} className="bg-green-50 rounded-2xl p-4 border border-green-100">
                      <div className="text-2xl font-extrabold text-[#1A7A6E]">{achievement.label}</div>
                      <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mt-0.5">
                        {achievement.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={founderData.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm border border-red-100"
                  >
                    <FiYoutube className="w-4 h-4" /> YouTube
                  </a>
                  <a
                    href={founderData.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm border border-blue-100"
                  >
                    <FiFacebook className="w-4 h-4" /> Facebook
                  </a>
                  <a
                    href={founderData.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm border border-green-100"
                  >
                    <FiPhone className="w-4 h-4" /> WhatsApp
                  </a>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 text-[#1A7A6E] font-semibold text-sm px-4 py-2.5 rounded-xl border border-[#1A7A6E]/20 hover:border-[#1A7A6E]/50 hover:bg-green-50 transition-all"
                  >
                    {t('founder.learnMore', { ns: 'landing' })} <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════
          NEWSLETTER / CTA
      ═══════════════════════════ */}
      <section className="py-16 sm:py-20 bg-[#1A7A6E] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-5xl mb-5">🐾</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {t('cta.heading', { ns: 'landing' })}
          </h2>
          <p className="text-white/75 text-base sm:text-lg mb-10 leading-relaxed">
            {t('cta.description', { ns: 'landing' })}
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-10"
          >
            <input
              type="email"
              placeholder={t('cta.emailPlaceholder', { ns: 'landing' })}
              className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium placeholder-gray-400"
            />
            <button
              type="submit"
              className="px-7 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors whitespace-nowrap text-sm"
            >
              {t('cta.subscribeButton', { ns: 'landing' })}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href={founderData.socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
            >
              <FiYoutube className="w-5 h-5" /> YouTube
            </a>
            <span className="text-white/20">|</span>
            <a
              href={founderData.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
            >
              <FiFacebook className="w-5 h-5" /> Facebook
            </a>
            <span className="text-white/20">|</span>
            <a
              href={founderData.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
            >
              <FiPhone className="w-5 h-5" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}

export default LandingPage
