import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiArrowLeft, FiPhone, FiMail, FiMapPin, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'

const getSections = (t) => {
  const tl = (key, options) => t(key, { ns: 'legal', ...options })
  const items = (key) => tl(key, { returnObjects: true })

  return [
    {
      id: 'introduction',
      title: tl('privacy.sections.introduction.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('privacy.sections.introduction.paragraph1')}</p>
          <p>{tl('privacy.sections.introduction.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'information-collection',
      title: tl('privacy.sections.informationCollection.title'),
      content: (
        <div className="space-y-4">
          <div>
            <h4>{tl('privacy.sections.informationCollection.personalInfo.heading')}</h4>
            <p className="mb-2">{tl('privacy.sections.informationCollection.personalInfo.intro')}</p>
            <ul>
              {items('privacy.sections.informationCollection.personalInfo.items').map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{tl('privacy.sections.informationCollection.autoInfo.heading')}</h4>
            <p className="mb-2">{tl('privacy.sections.informationCollection.autoInfo.intro')}</p>
            <ul>
              {items('privacy.sections.informationCollection.autoInfo.items').map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'how-we-use',
      title: tl('privacy.sections.howWeUse.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('privacy.sections.howWeUse.intro')}</p>
          <ul>
            {items('privacy.sections.howWeUse.items').map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: 'information-sharing',
      title: tl('privacy.sections.informationSharing.title'),
      content: (
        <div className="space-y-4">
          <p>{tl('privacy.sections.informationSharing.intro')}</p>
          <div>
            <h4>{tl('privacy.sections.informationSharing.serviceProviders.heading')}</h4>
            <p>{tl('privacy.sections.informationSharing.serviceProviders.body')}</p>
          </div>
          <div>
            <h4>{tl('privacy.sections.informationSharing.legalRequirements.heading')}</h4>
            <p>{tl('privacy.sections.informationSharing.legalRequirements.body')}</p>
          </div>
          <div>
            <h4>{tl('privacy.sections.informationSharing.businessTransfers.heading')}</h4>
            <p>{tl('privacy.sections.informationSharing.businessTransfers.body')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'data-security',
      title: tl('privacy.sections.dataSecurity.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('privacy.sections.dataSecurity.intro')}</p>
          <ul>
            {items('privacy.sections.dataSecurity.items').map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 italic">{tl('privacy.sections.dataSecurity.disclaimer')}</p>
        </div>
      ),
    },
    {
      id: 'cookies',
      title: tl('privacy.sections.cookies.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('privacy.sections.cookies.intro')}</p>
          <div>
            <h4>{tl('privacy.sections.cookies.types.heading')}</h4>
            <ul>
              {items('privacy.sections.cookies.types.items').map((item, idx) => (
                <li key={idx}><strong>{item.label}</strong> {item.text}</li>
              ))}
            </ul>
          </div>
          <p>{tl('privacy.sections.cookies.outro')}</p>
        </div>
      ),
    },
    {
      id: 'your-rights',
      title: tl('privacy.sections.yourRights.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('privacy.sections.yourRights.intro')}</p>
          <ul>
            {items('privacy.sections.yourRights.items').map((item, idx) => (
              <li key={idx}><strong>{item.label}</strong> {item.text}</li>
            ))}
          </ul>
          <p>{tl('privacy.sections.yourRights.outro')}</p>
        </div>
      ),
    },
    {
      id: 'data-retention',
      title: tl('privacy.sections.dataRetention.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('privacy.sections.dataRetention.paragraph1')}</p>
          <p>{tl('privacy.sections.dataRetention.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'children-privacy',
      title: tl('privacy.sections.childrenPrivacy.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('privacy.sections.childrenPrivacy.paragraph1')}</p>
        </div>
      ),
    },
    {
      id: 'international-transfers',
      title: tl('privacy.sections.internationalTransfers.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('privacy.sections.internationalTransfers.paragraph1')}</p>
          <p>{tl('privacy.sections.internationalTransfers.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'changes',
      title: tl('privacy.sections.changes.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('privacy.sections.changes.paragraph1')}</p>
          <p>{tl('privacy.sections.changes.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: tl('privacy.sections.contact.title'),
      content: (
        <p>{tl('privacy.sections.contact.paragraph1')}</p>
      ),
    },
  ]
}

const PrivacyPolicyPage = () => {
  const { t } = useLanguage()
  const tl = (key, options) => t(key, { ns: 'legal', ...options })
  const sections = useMemo(() => getSections(t), [t])

  const [activeId, setActiveId] = useState(sections[0].id)
  const [tocOpen, setTocOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-80px 0px -75% 0px' }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  const lastUpdated = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero Header ───────────────────────────────────── */}
      <div className="bg-[#1A7A6E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-8"
          >
            <FiArrowLeft className="w-4 h-4" />
            {tl('privacy.backToHome')}
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiShield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {tl('privacy.pageTitle')}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-white/60 text-sm">{tl('privacy.updated', { date: lastUpdated })}</span>
                <span className="text-white/30">·</span>
                <span className="text-white/60 text-sm">{tl('privacy.readTime')}</span>
                <span className="text-white/30">·</span>
                <span className="text-white/60 text-sm">{tl('privacy.sectionsCount', { count: sections.length })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Body ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10 items-start">

          {/* Sidebar TOC (desktop) */}
          <aside className="hidden lg:block sticky top-24 self-start">
            <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-3">
              {tl('privacy.toc.heading')}
            </p>
            <nav className="space-y-0.5">
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                    activeId === s.id
                      ? 'bg-[#1A7A6E]/10 text-[#1A7A6E] font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 transition-all ${
                    activeId === s.id ? 'bg-[#1A7A6E] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="leading-snug line-clamp-2">{s.title}</span>
                </a>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="min-w-0">

            {/* Mobile TOC toggle */}
            <div className="lg:hidden mb-6">
              <button
                type="button"
                onClick={() => setTocOpen(!tocOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm"
              >
                <span>{tl('privacy.toc.mobileLabel', { count: sections.length })}</span>
                {tocOpen
                  ? <FiChevronUp className="w-4 h-4 text-gray-500" />
                  : <FiChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
              {tocOpen && (
                <div className="mt-1.5 bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden shadow-sm">
                  {sections.map((s, i) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => setTocOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-[#1A7A6E] hover:bg-green-50 transition-all"
                    >
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                        {i + 1}
                      </span>
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {sections.map((section, i) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 scroll-mt-24 shadow-sm"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <span className="w-8 h-8 rounded-xl bg-[#1A7A6E]/10 flex items-center justify-center text-xs font-extrabold text-[#1A7A6E] flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 leading-snug">{section.title}</h2>
                  </div>
                  <div className="pl-12 text-[0.9375rem] text-gray-600 leading-relaxed
                    [&_h4]:text-xs [&_h4]:font-extrabold [&_h4]:uppercase [&_h4]:tracking-wider [&_h4]:text-gray-500 [&_h4]:mb-2 [&_h4]:mt-4 [&_h4:first-child]:mt-0
                    [&_ul]:space-y-1.5 [&_ul]:my-2
                    [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:list-none
                    [&_li]:before:content-['·'] [&_li]:before:text-[#1A7A6E] [&_li]:before:font-bold [&_li]:before:flex-shrink-0 [&_li]:before:mt-0.5
                    [&_p]:mb-2.5 [&_p:last-child]:mb-0
                    [&_strong]:text-gray-800 [&_strong]:font-semibold
                    [&_.italic]:text-gray-400">
                    {section.content}
                  </div>
                </article>
              ))}
            </div>

            {/* Contact card */}
            <div className="mt-6 bg-white border border-[#1A7A6E]/20 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="mb-5">
                <h3 className="text-base font-bold text-gray-900">{tl('privacy.contactCard.heading')}</h3>
                <p className="text-sm text-gray-500 mt-1">{tl('privacy.contactCard.subtext')}</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <a
                  href="https://wa.me/237699933135"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-xl p-4 transition-all group"
                >
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1A7A6E] transition-colors">
                    <FiPhone className="w-4 h-4 text-[#1A7A6E] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400">{tl('privacy.contactCard.whatsappLabel')}</p>
                    <p className="text-sm font-bold text-gray-900 truncate">+237 699 933 135</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-4 h-4 text-[#1A7A6E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400">{tl('privacy.contactCard.emailLabel')}</p>
                    <p className="text-sm font-bold text-gray-900 truncate">privacy@academie-eleveurs.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="w-4 h-4 text-[#1A7A6E]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400">{tl('privacy.contactCard.addressLabel')}</p>
                    <p className="text-sm font-bold text-gray-900">{tl('privacy.contactCard.addressValue')} 🇨🇲</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Closing note */}
            <p className="mt-6 text-center text-xs text-gray-400">
              {tl('privacy.closingNote')}
            </p>
          </main>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
