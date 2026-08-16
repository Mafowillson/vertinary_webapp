import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { authService } from '../../services/authService'
import { useLanguage } from '../../contexts/LanguageContext'
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
  const { t } = useLanguage()

  const passwordsMatch = confirmPassword && password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token.trim()) {
      setError(t('passwordReset.invalidLink', { ns: 'auth' }))
      return
    }
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch', { ns: 'errors' }))
      return
    }
    if (password.length < 8) {
      setError(t('common.passwordTooShort', { ns: 'auth' }))
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token.trim(), password)
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      setError(err.message || t('passwordReset.resetError', { ns: 'auth' }))
    } finally {
      setLoading(false)
    }
  }

  /* ── Invalid / missing token ── */
  if (!token.trim() && !success) {
    return (
      <AuthLayout quote={t('passwordReset.resetQuote', { ns: 'auth' })}>
        <div className="space-y-6">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
            <FiLock className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{t('passwordReset.invalidLinkTitle', { ns: 'auth' })}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {t('passwordReset.invalidLinkMessage', { ns: 'auth' })}
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="flex items-center justify-center gap-2 w-full bg-[#1A7A6E] hover:bg-[#155f55] text-white font-bold py-3 rounded-xl transition-all shadow-sm"
          >
            {t('passwordReset.requestNewLink', { ns: 'auth' })} <FiArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors pt-2 border-t border-gray-100"
          >
            <FiArrowLeft className="w-4 h-4" /> {t('passwordReset.backToLogin', { ns: 'auth' })}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout quote={t('passwordReset.resetQuote', { ns: 'auth' })}>
      <div className="space-y-6">

        {/* Icon + heading */}
        <div className="space-y-4">
          <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center">
            <FiLock className="w-6 h-6 text-[#1A7A6E]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{t('passwordReset.newPasswordTitle', { ns: 'auth' })}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('passwordReset.newPasswordHint', { ns: 'auth' })}
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
            <p className="text-sm font-semibold text-green-800">{t('passwordReset.successTitle', { ns: 'auth' })}</p>
            <p className="text-sm text-green-700">
              {t('common.redirectingToLogin', { ns: 'auth' })}
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
                  {t('passwordReset.newPasswordTitle', { ns: 'auth' })}
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
                    aria-label={showPassword ? t('login.hidePassword', { ns: 'auth' }) : t('login.showPassword', { ns: 'auth' })}
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  {t('passwordReset.confirmLabel', { ns: 'auth' })}
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
                    aria-label={showConfirm ? t('login.hidePassword', { ns: 'auth' }) : t('login.showPassword', { ns: 'auth' })}
                  >
                    {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500 font-medium">{t('passwordsDoNotMatch', { ns: 'errors' })}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#1A7A6E] hover:bg-[#155f55] text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <><Spinner /> {t('passwordReset.saving', { ns: 'auth' })}</>
                ) : (
                  <>{t('passwordReset.saveButton', { ns: 'auth' })} <FiArrowRight className="w-4 h-4" /></>
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
          <FiArrowLeft className="w-4 h-4" /> {t('passwordReset.backToLogin', { ns: 'auth' })}
        </Link>

      </div>
    </AuthLayout>
  )
}

export default ResetPasswordPage
