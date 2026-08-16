import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiFileText, FiArrowLeft, FiPhone, FiMail, FiMapPin, FiChevronDown, FiChevronUp, FiAlertTriangle } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'

const getSections = (t) => {
  const tl = (key, options) => t(key, { ns: 'legal', ...options })
  const items = (key) => tl(key, { returnObjects: true })

  return [
    {
      id: 'acceptance',
      title: tl('terms.sections.acceptance.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('terms.sections.acceptance.paragraph1')}</p>
          <p>{tl('terms.sections.acceptance.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'definitions',
      title: tl('terms.sections.definitions.title'),
      content: (
        <ul>
          {items('terms.sections.definitions.items').map((item, idx) => (
            <li key={idx}><strong>{item.label}</strong> — {item.text}</li>
          ))}
        </ul>
      ),
    },
    {
      id: 'account-registration',
      title: tl('terms.sections.accountRegistration.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('terms.sections.accountRegistration.intro')}</p>
          <ul>
            {items('terms.sections.accountRegistration.items').map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p>{tl('terms.sections.accountRegistration.outro')}</p>
        </div>
      ),
    },
    {
      id: 'use-of-service',
      title: tl('terms.sections.useOfService.title'),
      content: (
        <div className="space-y-4">
          <div>
            <h4>{tl('terms.sections.useOfService.authorized.heading')}</h4>
            <p>{tl('terms.sections.useOfService.authorized.intro')}</p>
            <ul>
              {items('terms.sections.useOfService.authorized.items').map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{tl('terms.sections.useOfService.prohibited.heading')}</h4>
            <p>{tl('terms.sections.useOfService.prohibited.intro')}</p>
            <ul>
              {items('terms.sections.useOfService.prohibited.items').map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'intellectual-property',
      title: tl('terms.sections.intellectualProperty.title'),
      content: (
        <div className="space-y-4">
          <p>{tl('terms.sections.intellectualProperty.intro')}</p>
          <div>
            <h4>{tl('terms.sections.intellectualProperty.ourContent.heading')}</h4>
            <p>{tl('terms.sections.intellectualProperty.ourContent.body')}</p>
          </div>
          <div>
            <h4>{tl('terms.sections.intellectualProperty.limitedLicense.heading')}</h4>
            <p>{tl('terms.sections.intellectualProperty.limitedLicense.body')}</p>
          </div>
          <div>
            <h4>{tl('terms.sections.intellectualProperty.restrictions.heading')}</h4>
            <ul>
              {items('terms.sections.intellectualProperty.restrictions.items').map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'purchases',
      title: tl('terms.sections.purchases.title'),
      content: (
        <div className="space-y-4">
          <div>
            <h4>{tl('terms.sections.purchases.pricing.heading')}</h4>
            <p>{tl('terms.sections.purchases.pricing.body')}</p>
          </div>
          <div>
            <h4>{tl('terms.sections.purchases.paymentTerms.heading')}</h4>
            <ul>
              {items('terms.sections.purchases.paymentTerms.items').map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{tl('terms.sections.purchases.refunds.heading')}</h4>
            <p>{tl('terms.sections.purchases.refunds.body')}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'user-content',
      title: tl('terms.sections.userContent.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('terms.sections.userContent.paragraph1')}</p>
          <p>{tl('terms.sections.userContent.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'disclaimers',
      title: tl('terms.sections.disclaimers.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('terms.sections.disclaimers.statement')}</p>
          <p>{tl('terms.sections.disclaimers.intro')}</p>
          <ul>
            {items('terms.sections.disclaimers.items').map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 italic">{tl('terms.sections.disclaimers.disclaimer')}</p>
        </div>
      ),
    },
    {
      id: 'limitation-liability',
      title: tl('terms.sections.limitationLiability.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('terms.sections.limitationLiability.paragraph1')}</p>
          <p>{tl('terms.sections.limitationLiability.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'indemnification',
      title: tl('terms.sections.indemnification.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('terms.sections.indemnification.intro')}</p>
          <ul>
            {items('terms.sections.indemnification.items').map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: 'termination',
      title: tl('terms.sections.termination.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('terms.sections.termination.paragraph1')}</p>
          <p>{tl('terms.sections.termination.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'governing-law',
      title: tl('terms.sections.governingLaw.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('terms.sections.governingLaw.paragraph1')}</p>
          <p>{tl('terms.sections.governingLaw.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'changes',
      title: tl('terms.sections.changes.title'),
      content: (
        <div className="space-y-3">
          <p>{tl('terms.sections.changes.paragraph1')}</p>
          <p>{tl('terms.sections.changes.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: tl('terms.sections.contact.title'),
      content: (
        <p>{tl('terms.sections.contact.paragraph1')}</p>
      ),
    },
  ]
}

const TermsOfServicePage = () => {
  const { t } = useLanguage()
  const tl = (key, options) => t(key, { ns: 'legal', ...options })
  const sections = getSections(t)

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
  }, [])

  const lastUpdated = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero Header ───────────────────────────────────── */}
      <div className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8"
          >
            <FiArrowLeft className="w-4 h-4" />
            {tl('terms.backToHome')}
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiFileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {tl('terms.pageTitle')}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-gray-400 text-sm">{tl('terms.updated', { date: lastUpdated })}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 text-sm">{tl('terms.readTime')}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 text-sm">{tl('terms.sectionsCount', { count: sections.length })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Important notice banner ───────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-2.5">
            <FiAlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>{tl('terms.banner.label')}</strong> {tl('terms.banner.text')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Page Body ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10 items-start">

          {/* Sidebar TOC (desktop) */}
          <aside className="hidden lg:block sticky top-24 self-start">
            <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-3">
              {tl('terms.toc.heading')}
            </p>
            <nav className="space-y-0.5">
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                    activeId === s.id
                      ? 'bg-gray-900/8 text-gray-900 font-semibold bg-gray-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 transition-all ${
                    activeId === s.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
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
                <span>{tl('terms.toc.mobileLabel', { count: sections.length })}</span>
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
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
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
                    <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-extrabold text-gray-600 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 leading-snug">{section.title}</h2>
                  </div>
                  <div className="pl-12 text-[0.9375rem] text-gray-600 leading-relaxed
                    [&_h4]:text-xs [&_h4]:font-extrabold [&_h4]:uppercase [&_h4]:tracking-wider [&_h4]:text-gray-500 [&_h4]:mb-2 [&_h4]:mt-4 [&_h4:first-child]:mt-0
                    [&_ul]:space-y-1.5 [&_ul]:my-2
                    [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:list-none
                    [&_li]:before:content-['·'] [&_li]:before:text-gray-400 [&_li]:before:font-bold [&_li]:before:flex-shrink-0 [&_li]:before:mt-0.5
                    [&_p]:mb-2.5 [&_p:last-child]:mb-0
                    [&_strong]:text-gray-800 [&_strong]:font-semibold
                    [&_.italic]:text-gray-400">
                    {section.content}
                  </div>
                </article>
              ))}
            </div>

            {/* Contact card */}
            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="mb-5">
                <h3 className="text-base font-bold text-gray-900">{tl('terms.contactCard.heading')}</h3>
                <p className="text-sm text-gray-500 mt-1">{tl('terms.contactCard.subtext')}</p>
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
                    <p className="text-xs font-semibold text-gray-400">{tl('terms.contactCard.whatsappLabel')}</p>
                    <p className="text-sm font-bold text-gray-900 truncate">+237 699 933 135</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-4 h-4 text-[#1A7A6E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400">{tl('terms.contactCard.emailLabel')}</p>
                    <p className="text-sm font-bold text-gray-900 truncate">legal@academie-eleveurs.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="w-4 h-4 text-[#1A7A6E]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400">{tl('terms.contactCard.addressLabel')}</p>
                    <p className="text-sm font-bold text-gray-900">{tl('terms.contactCard.addressValue')} 🇨🇲</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Closing note */}
            <p className="mt-6 text-center text-xs text-gray-400">
              {tl('terms.closingNote')}
            </p>
          </main>
        </div>
      </div>
    </div>
  )
}

export default TermsOfServicePage
