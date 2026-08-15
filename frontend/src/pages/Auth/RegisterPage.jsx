import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiAlertCircle, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import AuthLayout from '../../components/Layout/AuthLayout'

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const getStrength = (pwd) => {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score
}

const STRENGTH_META = [
  { label: 'Très faible', color: 'bg-red-500' },
  { label: 'Faible',      color: 'bg-orange-400' },
  { label: 'Moyen',       color: 'bg-yellow-400' },
  { label: 'Fort',        color: 'bg-green-400' },
  { label: 'Très fort',   color: 'bg-[#1A7A6E]' },
]

const PasswordStrength = ({ password }) => {
  if (!password) return null
  const score = getStrength(password)
  const meta = STRENGTH_META[score] || STRENGTH_META[0]
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? meta.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-red-500' : score <= 2 ? 'text-yellow-600' : 'text-green-600'}`}>
        {meta.label}
      </p>
    </div>
  )
}

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password })
      navigate('/login', { replace: true, state: { registrationSuccess: true, email: formData.email } })
    } catch (err) {
      setError(err.message || err.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword

  return (
    <AuthLayout quote="Rejoignez des milliers d'éleveurs qui apprennent chaque jour.">
      <div className="space-y-6">

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Créer votre compte</h1>
          <p className="mt-1 text-sm text-gray-500">
            Démarrez votre parcours vétérinaire dès aujourd'hui.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Nom complet
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Jean Dupont"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1A7A6E] focus:ring-2 focus:ring-[#1A7A6E]/20 outline-none transition-all placeholder-gray-400"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="jean@exemple.com"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1A7A6E] focus:ring-2 focus:ring-[#1A7A6E]/20 outline-none transition-all placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1A7A6E] focus:ring-2 focus:ring-[#1A7A6E]/20 outline-none transition-all placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={formData.password} />
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-11 text-sm border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all placeholder-gray-400 ${
                  formData.confirmPassword
                    ? passwordsMatch
                      ? 'border-green-400 focus:border-green-400 focus:ring-green-400/20'
                      : 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                    : 'border-gray-200 focus:border-[#1A7A6E] focus:ring-[#1A7A6E]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirm ? 'Masquer' : 'Afficher'}
              >
                {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500 font-medium">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1A7A6E] hover:bg-[#155f55] text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <><Spinner /> Inscription en cours...</>
            ) : (
              <>Créer mon compte <FiArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="font-bold text-[#1A7A6E] hover:text-[#155f55] transition-colors">
            Se connecter
          </Link>
        </p>

        {/* Legal */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-400">
          <Link to="/privacy" className="hover:text-gray-600 transition-colors">Confidentialité</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-gray-600 transition-colors">Conditions</Link>
        </div>

      </div>
    </AuthLayout>
  )
}

export default RegisterPage
