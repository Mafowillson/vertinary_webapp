import { Link } from 'react-router-dom'
import { FiMapPin, FiPhone, FiYoutube, FiFacebook, FiArrowRight, FiHeart } from 'react-icons/fi'

const Footer = () => {
  const year = new Date().getFullYear()

  const resourceLinks = [
    { label: 'Trouver des Ressources', to: '/products' },
    { label: 'Nos Livres & E-Books',   to: '/products' },
    { label: 'Formations en Ligne',    to: '/services' },
    { label: 'Services Pro',           to: '/services' },
    { label: 'À Propos',               to: '/about' },
  ]

  const supportLinks = [
    { label: "Centre d'Aide",                to: '/help',    external: false },
    { label: 'Nous Contacter',               href: 'https://wa.me/237699933135', external: true },
    { label: 'Politique de Confidentialité', to: '/privacy', external: false },
    { label: "Conditions d'Utilisation",     to: '/terms',   external: false },
  ]

  const LinkItem = ({ item }) => {
    const cls = 'group flex items-center gap-2.5 text-sm text-gray-500 hover:text-white transition-colors duration-200'
    const dot = <span className="w-1.5 h-1.5 rounded-full bg-[#1A7A6E] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    return item.external ? (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {dot}{item.label}
      </a>
    ) : (
      <Link to={item.to} className={cls}>
        {dot}{item.label}
      </Link>
    )
  }

  return (
    <footer className="bg-gray-900 text-gray-400">

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Col 1: Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-5">
              <img
                src="/academydeseleveurs.png"
                alt="Académie des Éleveurs"
                className="h-16 w-auto brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-gray-500">
              Plateforme dédiée au partage de savoir vétérinaire — livres, formations et ressources pour les éleveurs du Cameroun et du monde entier.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.youtube.com/@academiedeseleveurs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-600 text-gray-500 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <FiYoutube className="w-4 h-4" />
              </a>
              <a
                href="https://web.facebook.com/search/top/?q=l%27acad%C3%A9mie%20des%20%C3%A9leveurs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-blue-600 text-gray-500 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <FiFacebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/237699933135"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-green-600 text-gray-500 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <FiPhone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Resources */}
          <div>
            <h4 className="text-white text-xs font-extrabold uppercase tracking-widest mb-6">
              Ressources
            </h4>
            <ul className="space-y-3.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <LinkItem item={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-white text-xs font-extrabold uppercase tracking-widest mb-6">
              Support
            </h4>
            <ul className="space-y-3.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <LinkItem item={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact + Mini Newsletter */}
          <div>
            <h4 className="text-white text-xs font-extrabold uppercase tracking-widest mb-6">
              Contact
            </h4>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiMapPin className="w-3.5 h-3.5 text-[#1A7A6E]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Cameroun 🇨🇲</p>
                  <p className="text-gray-600 text-xs mt-0.5">Académie des Éleveurs</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-3.5 h-3.5 text-[#1A7A6E]" />
                </div>
                <a
                  href="https://wa.me/237699933135"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  +237 699 933 135
                </a>
              </li>
            </ul>

            {/* Mini Newsletter */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">
                Restez informé
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 min-w-0 bg-white/5 border border-white/10 text-white placeholder-gray-700 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#1A7A6E] transition-colors"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-[#1A7A6E] hover:bg-[#155f55] text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
                >
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-white/5" />
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>© {year} Académie des Éleveurs.</span>
            <span>Fondé avec</span>
            <FiHeart className="w-3 h-3 text-red-500 fill-current flex-shrink-0" />
            <span>par TCHOUALA FONDEM BODRIC</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-gray-400 transition-colors">
              Confidentialité
            </Link>
            <span className="text-white/10">|</span>
            <Link to="/terms" className="hover:text-gray-400 transition-colors">
              Conditions
            </Link>
            <span className="text-white/10">|</span>
            <span className="text-[#4ade80]">Français (CM)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
