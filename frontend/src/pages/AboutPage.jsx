import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiYoutube, FiFacebook, FiPhone, FiMapPin,
  FiBook, FiUsers, FiAward, FiTarget, FiHeart,
  FiArrowRight, FiCheckCircle, FiPlay, FiStar,
  FiTrendingUp, FiGlobe, FiZap
} from 'react-icons/fi'
import { founderData } from '../data/mockHomePage'
import { useLanguage } from '../contexts/LanguageContext'

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const { t } = useLanguage()

  const pillars = [
    {
      icon: FiBook,
      title: t('pillars.education.title', { ns: 'about' }),
      description: t('pillars.education.description', { ns: 'about' }),
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: FiGlobe,
      title: t('pillars.globalReach.title', { ns: 'about' }),
      description: t('pillars.globalReach.description', { ns: 'about' }),
      color: 'from-teal-500 to-cyan-600',
      bg: 'bg-teal-50',
    },
    {
      icon: FiZap,
      title: t('pillars.innovation.title', { ns: 'about' }),
      description: t('pillars.innovation.description', { ns: 'about' }),
      color: 'from-cyan-500 to-blue-600',
      bg: 'bg-cyan-50',
    },
    {
      icon: FiHeart,
      title: t('pillars.passion.title', { ns: 'about' }),
      description: t('pillars.passion.description', { ns: 'about' }),
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
    },
  ]

  const milestones = [
    { year: '2020', emoji: '🎓', title: t('timeline.milestones.2020.title', { ns: 'about' }), description: t('timeline.milestones.2020.description', { ns: 'about' }) },
    { year: '2021', emoji: '📹', title: t('timeline.milestones.2021.title', { ns: 'about' }), description: t('timeline.milestones.2021.description', { ns: 'about' }) },
    { year: '2022', emoji: '📚', title: t('timeline.milestones.2022.title', { ns: 'about' }), description: t('timeline.milestones.2022.description', { ns: 'about' }) },
    { year: '2023', emoji: '🏛️', title: t('timeline.milestones.2023.title', { ns: 'about' }), description: t('timeline.milestones.2023.description', { ns: 'about' }) },
    { year: '2024', emoji: '🚀', title: t('timeline.milestones.2024.title', { ns: 'about' }), description: t('timeline.milestones.2024.description', { ns: 'about' }) },
  ]

  const stats = [
    { icon: FiUsers, value: '5 000+', label: t('stats.breedersTrained', { ns: 'about' }), color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { icon: FiBook, value: '50+', label: t('stats.guidesCreated', { ns: 'about' }), color: 'text-teal-600', bg: 'bg-teal-100' },
    { icon: FiStar, value: '4+', label: t('stats.yearsExpertise', { ns: 'about' }), color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { icon: FiPlay, value: '100+', label: t('stats.videos', { ns: 'about' }), color: 'text-green-600', bg: 'bg-green-100' },
  ]

  const credentials = [
    { icon: FiAward, label: t('credentials.items.vetStudent.label', { ns: 'about' }), sub: t('credentials.items.vetStudent.sub', { ns: 'about' }) },
    { icon: FiTrendingUp, label: t('credentials.items.animalProdEngineer.label', { ns: 'about' }), sub: t('credentials.items.animalProdEngineer.sub', { ns: 'about' }) },
    { icon: FiBook, label: t('credentials.items.author.label', { ns: 'about' }), sub: t('credentials.items.author.sub', { ns: 'about' }) },
    { icon: FiTarget, label: t('credentials.items.founder.label', { ns: 'about' }), sub: t('credentials.items.founder.sub', { ns: 'about' }) },
    { icon: FiZap, label: t('credentials.items.manufacturer.label', { ns: 'about' }), sub: t('credentials.items.manufacturer.sub', { ns: 'about' }) },
    { icon: FiUsers, label: t('credentials.items.contentCreator.label', { ns: 'about' }), sub: t('credentials.items.contentCreator.sub', { ns: 'about' }) },
  ]

  const credentialTabs = [
    t('credentials.tabs.formation', { ns: 'about' }),
    t('credentials.tabs.innovation', { ns: 'about' }),
  ]

  const visionCards = [
    { title: t('quote.cards.accessibility.title', { ns: 'about' }), body: t('quote.cards.accessibility.body', { ns: 'about' }) },
    { title: t('quote.cards.community.title', { ns: 'about' }), body: t('quote.cards.community.body', { ns: 'about' }) },
    { title: t('quote.cards.sustainability.title', { ns: 'about' }), body: t('quote.cards.sustainability.body', { ns: 'about' }) },
  ]

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-[#0d1f1e] overflow-hidden">
        {/* Large decorative letters */}
        <span className="pointer-events-none select-none absolute -right-8 top-1/2 -translate-y-1/2 text-[28vw] font-black text-white/[0.03] leading-none tracking-tighter">
          ADE
        </span>

        {/* Gradient blobs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1A7A6E]/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">

            {/* Text — takes 3/5 */}
            <div className="lg:col-span-3 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#1A7A6E]/40 bg-[#1A7A6E]/10 text-sm font-semibold text-emerald-400">
                <FiCheckCircle className="w-4 h-4" />
                {t('hero.badge', { ns: 'about' })}
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                {t('hero.titleLine1', { ns: 'about' })}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A7A6E] via-emerald-400 to-teal-300">
                  {t('hero.titleHighlightLine1', { ns: 'about' })}<br />{t('hero.titleHighlightLine2', { ns: 'about' })}
                </span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                {founderData.description}
              </p>

              {/* Social links */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={founderData.socialLinks.youtube}
                  target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5"
                >
                  <FiYoutube className="w-4 h-4" /> {t('hero.social.youtube', { ns: 'about' })}
                </a>
                <a
                  href={founderData.socialLinks.facebook}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
                >
                  <FiFacebook className="w-4 h-4" /> {t('hero.social.facebook', { ns: 'about' })}
                </a>
                <a
                  href={founderData.socialLinks.whatsapp}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1A7A6E] hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5"
                >
                  <FiPhone className="w-4 h-4" /> {t('hero.social.whatsapp', { ns: 'about' })}
                </a>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <FiMapPin className="w-4 h-4 text-emerald-500" />
                {founderData.location}
              </div>
            </div>

            {/* Photo card — takes 2/5 */}
            <div className="lg:col-span-2 relative">
              {/* Glowing border frame */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#1A7A6E] via-teal-400 to-emerald-300 blur-md opacity-40 scale-105" />
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src={founderData.imageUrl}
                  alt={founderData.name}
                  className="w-full h-auto object-cover"
                />
                {/* Name card overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <p className="text-white font-black text-lg leading-tight">{founderData.name}</p>
                  <p className="text-emerald-400 text-xs font-semibold mt-1 uppercase tracking-wider">{founderData.role}</p>
                </div>
              </div>

              {/* Floating stat badge */}
              <div className="absolute -right-4 top-8 bg-white rounded-2xl shadow-2xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-black text-[#1A7A6E]">50+</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{t('hero.floatingGuides', { ns: 'about' })}</p>
              </div>
              <div className="absolute -left-4 bottom-20 bg-white rounded-2xl shadow-2xl px-4 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-black text-[#1A7A6E]">5K+</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{t('hero.floatingBreeders', { ns: 'about' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="group relative rounded-2xl border border-gray-100 bg-white p-6 hover:border-[#1A7A6E]/30 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className={`inline-flex w-12 h-12 rounded-xl ${s.bg} items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <p className="text-4xl font-black text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
                  <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#1A7A6E] to-teal-400 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PILLARS ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1A7A6E]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#1A7A6E] font-bold text-sm uppercase tracking-[0.2em] mb-3">{t('pillars.eyebrow', { ns: 'about' })}</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">{t('pillars.heading', { ns: 'about' })}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p, i) => {
              const Icon = p.icon
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-7 hover:bg-white/10 transition-all hover:-translate-y-1 cursor-default"
                >
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} items-center justify-center mb-5 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{p.description}</p>

                  {/* Accent line */}
                  <div className={`absolute top-0 left-0 w-full h-0.5 rounded-t-2xl bg-gradient-to-r ${p.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#1A7A6E] font-bold text-sm uppercase tracking-[0.2em] mb-3">{t('timeline.eyebrow', { ns: 'about' })}</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">{t('timeline.heading', { ns: 'about' })}</h2>
          </div>

          {/* Horizontal scroll on mobile, flex on desktop */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1A7A6E] via-teal-400 to-emerald-300" />

            <div className="flex flex-col md:flex-row gap-6 md:gap-0">
              {milestones.map((m, i) => (
                <div key={i} className="md:flex-1 flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-0 group">
                  {/* Dot */}
                  <div className="relative flex-shrink-0 md:mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A7A6E] to-teal-400 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform md:mx-auto">
                      {m.emoji}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border-2 border-[#1A7A6E] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#1A7A6E]" />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="md:mt-6 md:mx-3 flex-1 md:flex-none">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:text-center hover:border-[#1A7A6E]/30 hover:shadow-lg transition-all">
                      <span className="inline-block text-xs font-black text-[#1A7A6E] bg-[#1A7A6E]/10 px-3 py-1 rounded-full mb-2">
                        {m.year}
                      </span>
                      <h3 className="font-bold text-gray-900 text-base">{m.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">{m.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CREDENTIALS TABS ─────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#1A7A6E] font-bold text-sm uppercase tracking-[0.2em] mb-3">{t('credentials.eyebrow', { ns: 'about' })}</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">{t('credentials.heading', { ns: 'about' })}</h2>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 justify-center mb-10 flex-wrap">
            {credentialTabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTab === i
                    ? 'bg-[#1A7A6E] text-white shadow-lg shadow-[#1A7A6E]/30'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1A7A6E]/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {credentials.slice(activeTab === 0 ? 0 : 3, activeTab === 0 ? 3 : 6).map((c, i) => {
              const Icon = c.icon
              return (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#1A7A6E]/30 hover:shadow-lg transition-all group">
                  <div className="w-11 h-11 rounded-xl bg-[#1A7A6E]/10 flex items-center justify-center mb-4 group-hover:bg-[#1A7A6E]/20 transition-colors">
                    <Icon className="w-5 h-5 text-[#1A7A6E]" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1">{c.label}</h4>
                  <p className="text-gray-500 text-xs">{c.sub}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── VISION QUOTE ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#1A7A6E] font-bold text-sm uppercase tracking-[0.2em] mb-6">{t('quote.eyebrow', { ns: 'about' })}</p>
          <blockquote className="relative">
            <span className="absolute -top-8 left-0 text-[120px] leading-none text-[#1A7A6E]/10 font-black select-none">"</span>
            <p className="relative text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
              {t('quote.text', { ns: 'about' })}{' '}
              <span className="text-[#1A7A6E]">{t('quote.highlight', { ns: 'about' })}</span>
            </p>
          </blockquote>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {visionCards.map((card, i) => (
              <div key={i} className="border-l-4 border-[#1A7A6E] pl-5 py-1">
                <h4 className="font-bold text-gray-900 mb-1">{card.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Diagonal slice */}
        <div className="absolute inset-0 bg-[#0d1f1e]" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #1A7A6E 0%, transparent 60%), radial-gradient(circle at 80% 50%, #0d9488 0%, transparent 60%)' }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-emerald-400 font-bold text-sm uppercase tracking-[0.2em] mb-4">{t('cta.eyebrow', { ns: 'about' })}</p>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {t('cta.headingLine1', { ns: 'about' })}<br />{t('cta.headingLine2', { ns: 'about' })}
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            {t('cta.text', { ns: 'about' })}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1A7A6E] hover:bg-emerald-500 text-white rounded-xl font-bold text-base transition-all shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5"
            >
              {t('cta.resourcesButton', { ns: 'about' })}
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href={founderData.socialLinks.whatsapp}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-base transition-all hover:-translate-y-0.5"
            >
              <FiPhone className="w-5 h-5" />
              {t('cta.contactButton', { ns: 'about' })}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
