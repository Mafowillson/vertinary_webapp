import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiFileText, FiArrowLeft, FiPhone, FiMail, FiMapPin, FiChevronDown, FiChevronUp, FiAlertTriangle } from 'react-icons/fi'

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptation des conditions',
    content: (
      <div className="space-y-3">
        <p>
          En accédant et en utilisant le site web et les services de l'Académie des Éleveurs, vous acceptez et convenez d'être lié par les termes et dispositions de cet accord. Si vous n'acceptez pas de respecter ce qui précède, veuillez ne pas utiliser ce service.
        </p>
        <p>
          Ces Conditions d'Utilisation (« Conditions ») régissent votre accès et votre utilisation de notre site web, de nos produits et de nos services (collectivement, le « Service »). Veuillez lire attentivement ces Conditions avant d'utiliser notre Service.
        </p>
      </div>
    ),
  },
  {
    id: 'definitions',
    title: 'Définitions',
    content: (
      <ul>
        <li><strong>« Service »</strong> — le site web de l'Académie des Éleveurs, les produits, les cours et tous les services associés.</li>
        <li><strong>« Utilisateur »</strong> — la personne accédant ou utilisant le Service.</li>
        <li><strong>« Société »</strong> — l'Académie des Éleveurs.</li>
        <li><strong>« Contenu »</strong> — toutes les informations, textes, graphiques, images, vidéos et autres matériels disponibles via le Service.</li>
        <li><strong>« Compte »</strong> — le compte que vous créez pour accéder à certaines fonctionnalités du Service.</li>
      </ul>
    ),
  },
  {
    id: 'account-registration',
    title: 'Inscription au compte et sécurité',
    content: (
      <div className="space-y-3">
        <p>Pour accéder à certaines fonctionnalités du Service, vous pouvez être amené à créer un compte. Lors de la création d'un compte, vous acceptez de :</p>
        <ul>
          <li>Fournir des informations exactes, actuelles et complètes</li>
          <li>Maintenir et mettre à jour rapidement les informations de votre compte</li>
          <li>Maintenir la sécurité de votre mot de passe et de votre identification</li>
          <li>Accepter toute responsabilité pour les activités sous votre compte</li>
          <li>Nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
        </ul>
        <p>Vous êtes responsable du maintien de la confidentialité de vos identifiants de compte.</p>
      </div>
    ),
  },
  {
    id: 'use-of-service',
    title: 'Utilisation du Service',
    content: (
      <div className="space-y-4">
        <div>
          <h4>Utilisation autorisée</h4>
          <p>Vous ne pouvez utiliser le Service qu'à des fins licites et conformément à ces Conditions :</p>
          <ul>
            <li>À des fins éducatives et professionnelles</li>
            <li>En conformité avec toutes les lois et réglementations applicables</li>
            <li>Sans violer les droits d'autrui</li>
          </ul>
        </div>
        <div>
          <h4>Activités interdites</h4>
          <p>Vous acceptez de ne pas :</p>
          <ul>
            <li>Violer toute loi ou réglementation applicable</li>
            <li>Porter atteinte aux droits d'autrui</li>
            <li>Transmettre tout contenu nuisible, offensant ou illégal</li>
            <li>Tenter d'obtenir un accès non autorisé au Service</li>
            <li>Interférer avec ou perturber le Service ou les serveurs</li>
            <li>Copier, modifier ou distribuer le contenu sans autorisation</li>
            <li>Utiliser des systèmes automatisés pour accéder au Service</li>
            <li>Usurper l'identité de toute personne ou entité</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Droits de propriété intellectuelle',
    content: (
      <div className="space-y-4">
        <p>
          Le Service et son contenu original sont la propriété de l'Académie des Éleveurs et sont protégés par les lois internationales sur le droit d'auteur, les marques de commerce et autres lois sur la propriété intellectuelle.
        </p>
        <div>
          <h4>Notre contenu</h4>
          <p>Tout le contenu fourni par le Service — textes, graphiques, logos, images, vidéos, cours et logiciels — est la propriété de l'Académie des Éleveurs ou de ses fournisseurs de contenu et est protégé par les lois sur le droit d'auteur.</p>
        </div>
        <div>
          <h4>Licence limitée</h4>
          <p>Nous vous accordons une licence limitée, non exclusive, non transférable et révocable pour accéder et utiliser le Service à des fins personnelles et non commerciales.</p>
        </div>
        <div>
          <h4>Restrictions</h4>
          <ul>
            <li>Reproduire, distribuer ou créer des œuvres dérivées à partir de notre contenu</li>
            <li>Utiliser notre contenu à des fins commerciales sans autorisation</li>
            <li>Supprimer tout avis de droit d'auteur ou de propriété</li>
            <li>Partager vos identifiants de compte avec d'autres personnes</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'purchases',
    title: 'Achats et paiements',
    content: (
      <div className="space-y-4">
        <div>
          <h4>Tarification</h4>
          <p>Tous les prix des produits et services sont affichés dans la devise applicable et sont susceptibles d'être modifiés sans préavis. Nous nous réservons le droit de modifier les prix à tout moment.</p>
        </div>
        <div>
          <h4>Conditions de paiement</h4>
          <ul>
            <li>Fournir des informations de paiement valides</li>
            <li>Payer tous les frais encourus par votre compte</li>
            <li>Nous autoriser à débiter votre moyen de paiement</li>
          </ul>
        </div>
        <div>
          <h4>Remboursements</h4>
          <p>Les politiques de remboursement varient selon le type de produit. Les produits numériques peuvent être éligibles à un remboursement dans un délai spécifié après l'achat. Veuillez nous contacter pour connaître les conditions spécifiques.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'user-content',
    title: 'Contenu généré par les utilisateurs',
    content: (
      <div className="space-y-3">
        <p>
          Si vous soumettez, publiez ou affichez du contenu sur ou via le Service, vous nous accordez une licence mondiale, non exclusive, libre de redevances pour utiliser, reproduire, modifier et distribuer ce contenu aux fins d'exploitation et de promotion du Service.
        </p>
        <p>
          Vous déclarez et garantissez que vous possédez ou disposez des droits nécessaires pour accorder la licence décrite ci-dessus, et que votre contenu ne viole aucun droit de tiers ni aucune loi applicable.
        </p>
      </div>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Avertissements',
    content: (
      <div className="space-y-3">
        <p>
          LE SERVICE EST FOURNI « EN L'ÉTAT » ET « TEL QUE DISPONIBLE » SANS GARANTIE D'AUCUNE SORTE, EXPRESSE OU IMPLICITE.
        </p>
        <p>Nous ne garantissons pas que :</p>
        <ul>
          <li>Le Service sera ininterrompu ou exempt d'erreurs</li>
          <li>Les défauts seront corrigés</li>
          <li>Le Service est exempt de virus ou d'autres composants nuisibles</li>
          <li>Les informations fournies sont exactes, complètes ou à jour</li>
        </ul>
        <p className="text-sm text-gray-500 italic">
          Le contenu éducatif fourni est uniquement à titre informatif et ne doit pas remplacer les conseils vétérinaires professionnels. Consultez toujours un vétérinaire agréé pour les problèmes de santé spécifiques des animaux.
        </p>
      </div>
    ),
  },
  {
    id: 'limitation-liability',
    title: 'Limitation de responsabilité',
    content: (
      <div className="space-y-3">
        <p>
          DANS LA MESURE MAXIMALE PERMISE PAR LA LOI, L'ACADÉMIE DES ÉLEVEURS NE SERA PAS RESPONSABLE DE TOUT DOMMAGE INDIRECT, ACCESSOIRE, SPÉCIAL OU CONSÉCUTIF, NI DE TOUTE PERTE DE BÉNÉFICES OU DE REVENUS.
        </p>
        <p>
          Notre responsabilité totale envers vous pour toutes les réclamations découlant de ou liées à l'utilisation du Service ne dépassera pas le montant que vous nous avez payé au cours des douze (12) mois précédant la réclamation.
        </p>
      </div>
    ),
  },
  {
    id: 'indemnification',
    title: 'Indemnisation',
    content: (
      <div className="space-y-3">
        <p>
          Vous acceptez d'indemniser et de dégager de toute responsabilité l'Académie des Éleveurs, ses dirigeants, administrateurs, employés et agents contre toute réclamation, responsabilité, dommage et dépense découlant de ou liés à :
        </p>
        <ul>
          <li>Votre accès ou utilisation du Service</li>
          <li>Votre violation de ces Conditions</li>
          <li>Votre violation des droits d'autrui</li>
          <li>Votre contenu généré par l'utilisateur</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'termination',
    title: 'Résiliation',
    content: (
      <div className="space-y-3">
        <p>
          Nous pouvons résilier ou suspendre votre compte et votre accès au Service immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y compris si vous enfreignez ces Conditions.
        </p>
        <p>
          Lors de la résiliation, votre droit d'utiliser le Service cessera immédiatement. Toutes les dispositions de ces Conditions qui, par leur nature, devraient survivre à la résiliation survivront, y compris les dispositions relatives à la propriété, aux exclusions de garantie et aux limitations de responsabilité.
        </p>
      </div>
    ),
  },
  {
    id: 'governing-law',
    title: 'Droit applicable',
    content: (
      <div className="space-y-3">
        <p>
          Ces Conditions sont régies et interprétées conformément aux lois du Cameroun, sans égard aux dispositions relatives aux conflits de lois.
        </p>
        <p>
          Tout litige découlant de ou lié à ces Conditions ou au Service sera soumis à la juridiction exclusive des tribunaux situés au Cameroun.
        </p>
      </div>
    ),
  },
  {
    id: 'changes',
    title: 'Modifications des conditions',
    content: (
      <div className="space-y-3">
        <p>
          Nous nous réservons le droit, à notre seule discrétion, de modifier ou de remplacer ces Conditions à tout moment. Si une révision est importante, nous fournirons un préavis d'au moins 30 jours avant l'entrée en vigueur des nouvelles conditions.
        </p>
        <p>
          En continuant à accéder ou à utiliser notre Service après l'entrée en vigueur de toute révision, vous acceptez d'être lié par les conditions révisées.
        </p>
      </div>
    ),
  },
  {
    id: 'contact',
    title: 'Informations de contact',
    content: (
      <p>
        Si vous avez des questions concernant ces Conditions d'Utilisation, veuillez nous contacter via les coordonnées affichées ci-dessous.
      </p>
    ),
  },
]

const TermsOfServicePage = () => {
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
            Retour à l'accueil
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiFileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Conditions d'Utilisation
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-gray-400 text-sm">Mise à jour : {lastUpdated}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 text-sm">~10 min de lecture</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 text-sm">{sections.length} sections</span>
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
              <strong>Avis important :</strong> En utilisant le Service, vous acceptez d'être lié par ces Conditions. Si vous n'acceptez pas ces Conditions, veuillez ne pas utiliser le Service.
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
              Table des matières
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
                <h3 className="text-base font-bold text-gray-900">Des questions sur ces conditions ?</h3>
                <p className="text-sm text-gray-500 mt-1">Contactez-nous pour toute question concernant ces Conditions d'Utilisation.</p>
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
                    <p className="text-sm font-bold text-gray-900 truncate">legal@academie-eleveurs.com</p>
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
              En utilisant nos services, vous reconnaissez avoir lu, compris et accepté d'être lié par ces Conditions d'Utilisation.
            </p>
          </main>
        </div>
      </div>
    </div>
  )
}

export default TermsOfServicePage
