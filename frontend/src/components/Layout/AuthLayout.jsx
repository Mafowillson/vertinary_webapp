import { Link } from 'react-router-dom'

const TRUST_POINTS = [
  '50+ guides vétérinaires vérifiés',
  'Formations par des experts certifiés',
  'Téléchargements sécurisés & instantanés',
]

const AuthLayout = ({ children, quote }) => (
  <div className="min-h-screen flex">

    {/* ── Left brand panel (desktop only) ─────────────────────── */}
    <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 bg-[#1A7A6E] flex-col justify-between p-10 relative overflow-hidden flex-shrink-0">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-52 h-52 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="relative z-10 inline-block">
        <img
          src="/academydeseleveurs.png"
          alt="Académie des Éleveurs"
          className="h-10 w-auto brightness-0 invert"
        />
      </Link>

      {/* Quote + trust list */}
      <div className="relative z-10 space-y-8">
        {quote && (
          <blockquote className="text-white/90 text-xl font-bold leading-snug">
            "{quote}"
          </blockquote>
        )}
        <ul className="space-y-3.5">
          {TRUST_POINTS.map((point, i) => (
            <li key={i} className="flex items-center gap-3 text-white/75 text-sm">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Social proof */}
      <div className="relative z-10">
        <div className="flex -space-x-2 mb-2.5">
          {[
            'from-green-300 to-teal-400',
            'from-teal-300 to-cyan-400',
            'from-emerald-300 to-green-400',
            'from-green-400 to-teal-500',
          ].map((g, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 border-[#1A7A6E] bg-gradient-to-br ${g}`}
            />
          ))}
        </div>
        <p className="text-white/60 text-sm">
          <strong className="text-white font-bold">5,000+</strong> éleveurs nous font confiance
        </p>
      </div>
    </div>

    {/* ── Right form panel ─────────────────────────────────────── */}
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white overflow-y-auto">
      {/* Mobile logo */}
      <div className="lg:hidden mb-8">
        <Link to="/">
          <img
            src="/academydeseleveurs.png"
            alt="Académie des Éleveurs"
            className="h-10 w-auto mx-auto"
          />
        </Link>
      </div>

      <div className="w-full max-w-sm">
        {children}
      </div>

      <p className="mt-10 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} Académie des Éleveurs. Tous droits réservés.
      </p>
    </div>

  </div>
)

export default AuthLayout
