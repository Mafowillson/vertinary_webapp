import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import AuthLayout from '../../components/Layout/AuthLayout'

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.returnTo || '/'

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setInfo(t('register.success', { ns: 'auth' }))
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state?.registrationSuccess, navigate, t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || err.response?.data?.message || t('loginFailed', { ns: 'errors' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout quote={t('login.quote', { ns: 'auth' })}>
      <div className="space-y-6">

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{t('login.welcomeBack', { ns: 'auth' })}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('login.subtitle', { ns: 'auth' })}
          </p>
        </div>

        {/* Alerts */}
        {info && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
            <FiCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{info}</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              {t('login.emailLabel', { ns: 'auth' })}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder', { ns: 'auth' })}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1A7A6E] focus:ring-2 focus:ring-[#1A7A6E]/20 outline-none transition-all placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                {t('login.passwordLabel', { ns: 'auth' })}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#1A7A6E] hover:text-[#155f55] transition-colors"
              >
                {t('login.forgotPassword', { ns: 'auth' })}
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-[#1A7A6E] focus:ring-2 focus:ring-[#1A7A6E]/20 outline-none transition-all placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? t('login.hidePassword', { ns: 'auth' }) : t('login.showPassword', { ns: 'auth' })}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1A7A6E] hover:bg-[#155f55] text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <><Spinner /> {t('login.loading', { ns: 'auth' })}</>
            ) : (
              <>{t('login.submitButton', { ns: 'auth' })} <FiArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500">
          {t('login.noAccount', { ns: 'auth' })}{' '}
          <Link to="/register" className="font-bold text-[#1A7A6E] hover:text-[#155f55] transition-colors">
            {t('login.registerLink', { ns: 'auth' })}
          </Link>
        </p>

        {/* Legal */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-400">
          <Link to="/privacy" className="hover:text-gray-600 transition-colors">{t('footer.privacyShort', { ns: 'common' })}</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-gray-600 transition-colors">{t('footer.termsShort', { ns: 'common' })}</Link>
        </div>

      </div>
    </AuthLayout>
  )
}

export default LoginPage
