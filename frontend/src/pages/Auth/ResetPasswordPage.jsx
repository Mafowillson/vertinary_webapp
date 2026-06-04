import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { authService } from '../../services/authService'
import AuthLayout from '../../components/Layout/AuthLayout'

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = confirmPassword && password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token.trim()) {
      setError('Lien invalide ou expiré. Demandez un nouveau lien.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token.trim(), password)
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      setError(err.message || 'Impossible de réinitialiser le mot de passe. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Invalid / missing token ── */
  if (!token.trim() && !success) {
    return (
      <AuthLayout quote="Créez un mot de passe fort pour sécuriser votre compte.">
        <div className="space-y-6">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
            <FiLock className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Lien invalide</h1>
            <p className="mt-2 text-sm text-gray-500">
              Ce lien est invalide ou a expiré. Demandez-en un nouveau depuis la page mot de passe oublié.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="flex items-center justify-center gap-2 w-full bg-[#1A7A6E] hover:bg-[#155f55] text-white font-bold py-3 rounded-xl transition-all shadow-sm"
          >
            Demander un nouveau lien <FiArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors pt-2 border-t border-gray-100"
          >
            <FiArrowLeft className="w-4 h-4" /> Retour à la connexion
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout quote="Créez un mot de passe fort pour sécuriser votre compte.">
      <div className="space-y-6">

        {/* Icon + heading */}
        <div className="space-y-4">
          <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center">
            <FiLock className="w-6 h-6 text-[#1A7A6E]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Nouveau mot de passe</h1>
            <p className="mt-1 text-sm text-gray-500">
              Choisissez un mot de passe sécurisé d'au moins 8 caractères.
            </p>
          </div>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-green-800">Mot de passe mis à jour !</p>
            <p className="text-sm text-green-700">
              Vous allez être redirigé vers la page de connexion…
            </p>
          </div>
        ) : (
          /* ── Form ── */
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* New password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1A7A6E] focus:ring-2 focus:ring-[#1A7A6E]/20 outline-none transition-all placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-11 text-sm border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all placeholder-gray-400 ${
                      confirmPassword
                        ? passwordsMatch
                          ? 'border-green-400 focus:border-green-400 focus:ring-green-400/20'
                          : 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                        : 'border-gray-200 focus:border-[#1A7A6E] focus:ring-[#1A7A6E]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                  >
                    {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
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
                  <><Spinner /> Enregistrement...</>
                ) : (
                  <>Enregistrer le mot de passe <FiArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Back to login */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors pt-2 border-t border-gray-100"
        >
          <FiArrowLeft className="w-4 h-4" /> Retour à la connexion
        </Link>

      </div>
    </AuthLayout>
  )
}

export default ResetPasswordPage
