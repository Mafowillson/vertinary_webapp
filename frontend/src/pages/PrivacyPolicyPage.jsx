import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiArrowLeft, FiPhone, FiMail, FiMapPin, FiChevronDown, FiChevronUp } from 'react-icons/fi'

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: (
      <div className="space-y-3">
        <p>
          Bienvenue chez Académie des Éleveurs (« nous », « notre » ou « nos »). Nous nous engageons à protéger votre vie privée et à assurer la sécurité de vos informations personnelles. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site web et utilisez nos services.
        </p>
        <p>
          En utilisant nos services, vous acceptez la collecte et l'utilisation des informations conformément à cette politique. Si vous n'êtes pas d'accord avec nos politiques et pratiques, veuillez ne pas utiliser nos services.
        </p>
      </div>
    ),
  },
  {
    id: 'information-collection',
    title: 'Informations que nous collectons',
    content: (
      <div className="space-y-4">
        <div>
          <h4>Informations personnelles</h4>
          <p className="mb-2">Nous pouvons collecter les types d'informations personnelles suivants :</p>
          <ul>
            <li>Nom et coordonnées (adresse email, numéro de téléphone)</li>
            <li>Identifiants de compte (nom d'utilisateur, mot de passe)</li>
            <li>Informations de paiement (détails de carte de crédit, adresse de facturation)</li>
            <li>Informations professionnelles (numéro de licence vétérinaire, informations sur la clinique)</li>
            <li>Historique des achats et enregistrements de transactions</li>
          </ul>
        </div>
        <div>
          <h4>Informations collectées automatiquement</h4>
          <p className="mb-2">Lorsque vous visitez notre site web, nous collectons automatiquement certaines informations :</p>
          <ul>
            <li>Adresse IP et informations sur l'appareil</li>
            <li>Type et version du navigateur</li>
            <li>Pages visitées et temps passé sur les pages</li>
            <li>Adresses des sites web de référence</li>
            <li>Cookies et technologies de suivi similaires</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'how-we-use',
    title: 'Comment nous utilisons vos informations',
    content: (
      <div className="space-y-3">
        <p>Nous utilisons les informations collectées aux fins suivantes :</p>
        <ul>
          <li>Fournir, maintenir et améliorer nos services</li>
          <li>Traiter les transactions et envoyer les informations associées</li>
          <li>Envoyer des informations administratives et des mises à jour</li>
          <li>Répondre à vos demandes et fournir un support client</li>
          <li>Envoyer des communications marketing (avec votre consentement)</li>
          <li>Détecter, prévenir et résoudre les problèmes techniques</li>
          <li>Se conformer aux obligations légales et faire respecter nos conditions</li>
          <li>Protéger les droits, la propriété et la sécurité de nos utilisateurs</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'information-sharing',
    title: 'Partage et divulgation des informations',
    content: (
      <div className="space-y-4">
        <p>Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. Nous ne pouvons partager vos informations que dans les circonstances suivantes :</p>
        <div>
          <h4>Prestataires de services</h4>
          <p>Nous pouvons partager des informations avec des prestataires de services tiers qui effectuent des services en notre nom, tels que le traitement des paiements, l'analyse de données et la livraison d'emails.</p>
        </div>
        <div>
          <h4>Exigences légales</h4>
          <p>Nous pouvons divulguer des informations si la loi l'exige ou en réponse à des demandes valides des autorités publiques.</p>
        </div>
        <div>
          <h4>Transferts d'entreprise</h4>
          <p>En cas de fusion, d'acquisition ou de vente d'actifs, vos informations peuvent être transférées à l'entité acquéreuse.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'data-security',
    title: 'Sécurité des données',
    content: (
      <div className="space-y-3">
        <p>
          Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès, la modification, la divulgation ou la destruction non autorisés. Ces mesures comprennent :
        </p>
        <ul>
          <li>Cryptage SSL 256 bits pour la transmission des données</li>
          <li>Infrastructure de serveurs sécurisée avec des audits de sécurité réguliers</li>
          <li>Contrôles d'accès et mécanismes d'authentification</li>
          <li>Sauvegardes régulières et procédures de reprise après sinistre</li>
          <li>Pratiques de traitement des données conformes aux normes HIPAA</li>
        </ul>
        <p className="text-sm text-gray-500 italic">
          Aucune méthode de transmission sur Internet n'est sûre à 100 %. Bien que nous nous efforcions d'utiliser des moyens commercialement acceptables pour protéger vos informations, nous ne pouvons garantir une sécurité absolue.
        </p>
      </div>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies et technologies de suivi',
    content: (
      <div className="space-y-3">
        <p>
          Nous utilisons des cookies et des technologies de suivi similaires pour suivre l'activité sur notre site web et stocker certaines informations.
        </p>
        <div>
          <h4>Types de cookies que nous utilisons</h4>
          <ul>
            <li><strong>Cookies essentiels :</strong> Nécessaires au bon fonctionnement du site web</li>
            <li><strong>Cookies analytiques :</strong> Nous aident à comprendre comment les visiteurs interagissent avec notre site</li>
            <li><strong>Cookies de préférences :</strong> Mémorisent vos préférences et paramètres</li>
            <li><strong>Cookies marketing :</strong> Utilisés pour diffuser des publicités pertinentes</li>
          </ul>
        </div>
        <p>
          Vous pouvez configurer votre navigateur pour refuser tous les cookies. Cependant, certaines fonctionnalités du site pourraient ne plus fonctionner correctement.
        </p>
      </div>
    ),
  },
  {
    id: 'your-rights',
    title: 'Vos droits et choix',
    content: (
      <div className="space-y-3">
        <p>Vous disposez des droits suivants concernant vos informations personnelles :</p>
        <ul>
          <li><strong>Accès :</strong> Demander l'accès à vos informations personnelles</li>
          <li><strong>Correction :</strong> Demander la correction d'informations inexactes</li>
          <li><strong>Suppression :</strong> Demander la suppression de vos informations personnelles</li>
          <li><strong>Opposition :</strong> Vous opposer au traitement de vos informations personnelles</li>
          <li><strong>Portabilité :</strong> Demander le transfert de vos données vers un autre service</li>
          <li><strong>Retrait :</strong> Retirer votre consentement au traitement des données</li>
        </ul>
        <p>Pour exercer ces droits, veuillez nous contacter via les coordonnées ci-dessous.</p>
      </div>
    ),
  },
  {
    id: 'data-retention',
    title: 'Conservation des données',
    content: (
      <div className="space-y-3">
        <p>
          Nous ne conserverons vos informations personnelles que pendant la durée nécessaire pour atteindre les objectifs décrits dans cette Politique de Confidentialité, sauf si une période de conservation plus longue est requise ou autorisée par la loi.
        </p>
        <p>
          Lorsque nous n'avons plus besoin de vos informations personnelles, nous les supprimerons ou les anonymiserons de manière sécurisée conformément à nos politiques de conservation des données.
        </p>
      </div>
    ),
  },
  {
    id: 'children-privacy',
    title: 'Confidentialité des mineurs',
    content: (
      <div className="space-y-3">
        <p>
          Nos services ne sont pas destinés aux personnes de moins de 18 ans. Nous ne collectons pas sciemment d'informations personnelles auprès de mineurs. Si vous êtes un parent ou un tuteur et pensez que votre enfant nous a fourni des informations personnelles, veuillez nous contacter immédiatement.
        </p>
      </div>
    ),
  },
  {
    id: 'international-transfers',
    title: 'Transferts internationaux de données',
    content: (
      <div className="space-y-3">
        <p>
          Vos informations peuvent être transférées vers et conservées sur des ordinateurs situés en dehors de votre pays où les lois sur la protection des données peuvent différer de celles de votre juridiction.
        </p>
        <p>
          En utilisant nos services, vous consentez au transfert de vos informations. Nous prendrons toutes les mesures raisonnablement nécessaires pour garantir que vos données sont traitées de manière sécurisée conformément à cette Politique de Confidentialité.
        </p>
      </div>
    ),
  },
  {
    id: 'changes',
    title: 'Modifications de cette politique',
    content: (
      <div className="space-y-3">
        <p>
          Nous pouvons mettre à jour notre Politique de Confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle Politique sur cette page et en mettant à jour la date de « Dernière mise à jour ».
        </p>
        <p>
          Il vous est conseillé de consulter périodiquement cette Politique pour tout changement. Les modifications prennent effet dès leur publication sur cette page.
        </p>
      </div>
    ),
  },
  {
    id: 'contact',
    title: 'Nous contacter',
    content: (
      <p>
        Si vous avez des questions concernant cette Politique de Confidentialité ou nos pratiques en matière de données, veuillez nous contacter via les coordonnées affichées ci-dessous.
      </p>
    ),
  },
]

const PrivacyPolicyPage = () => {
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
      <div className="bg-[#1A7A6E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-8"
          >
            <FiArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiShield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Politique de Confidentialité
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-white/60 text-sm">Mise à jour : {lastUpdated}</span>
                <span className="text-white/30">·</span>
                <span className="text-white/60 text-sm">~8 min de lecture</span>
                <span className="text-white/30">·</span>
                <span className="text-white/60 text-sm">{sections.length} sections</span>
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
              Table des matières
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
                <span>Table des matières · {sections.length} sections</span>
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
                <h3 className="text-base font-bold text-gray-900">Des questions sur cette politique ?</h3>
                <p className="text-sm text-gray-500 mt-1">Notre équipe est disponible pour répondre à toutes vos questions.</p>
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
                    <p className="text-xs font-semibold text-gray-400">WhatsApp</p>
                    <p className="text-sm font-bold text-gray-900 truncate">+237 699 933 135</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-4 h-4 text-[#1A7A6E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400">Email</p>
                    <p className="text-sm font-bold text-gray-900 truncate">privacy@academie-eleveurs.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="w-4 h-4 text-[#1A7A6E]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400">Adresse</p>
                    <p className="text-sm font-bold text-gray-900">Cameroun 🇨🇲</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Closing note */}
            <p className="mt-6 text-center text-xs text-gray-400">
              En utilisant nos services, vous reconnaissez avoir lu et compris cette Politique de Confidentialité.
            </p>
          </main>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
