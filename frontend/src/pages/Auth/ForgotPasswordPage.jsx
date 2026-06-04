import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiMail } from 'react-icons/fi'
import { authService } from '../../services/authService'
import AuthLayout from '../../components/Layout/AuthLayout'

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword(email.trim())
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout quote="Pas de panique, on vous aide à retrouver l'accès à votre compte.">
      <div className="space-y-6">

        {/* Icon + heading */}
        <div className="space-y-4">
          <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center">
            <FiMail className="w-6 h-6 text-[#1A7A6E]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Mot de passe oublié ?</h1>
            <p className="mt-1 text-sm text-gray-500">
              Entrez votre email et nous vous enverrons un lien de réinitialisation.
            </p>
          </div>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-green-800">Email envoyé !</p>
              <p className="text-sm text-green-700">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Vérifiez vos spams si vous ne voyez pas l'email.
            </p>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1A7A6E] focus:ring-2 focus:ring-[#1A7A6E]/20 outline-none transition-all placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#1A7A6E] hover:bg-[#155f55] text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Spinner /> Envoi en cours...</>
                ) : (
                  <>Envoyer le lien <FiArrowRight className="w-4 h-4" /></>
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
          <FiArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>

      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
