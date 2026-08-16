import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiMail, FiCheckCircle } from 'react-icons/fi'
import { authService } from '../../services/authService'
import { useLanguage } from '../../contexts/LanguageContext'
import AuthLayout from '../../components/Layout/AuthLayout'

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const hasRun = useRef(false)

  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [error, setError] = useState('')
  const { t } = useLanguage()

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    if (!token.trim()) {
      setStatus('error')
      setError(t('passwordReset.invalidLink', { ns: 'auth' }))
      return
    }

    authService
      .verifyEmail(token.trim())
      .then(() => {
        setStatus('success')
        setTimeout(() => navigate('/login', { replace: true }), 2500)
      })
      .catch((err) => {
        setStatus('error')
        setError(err.message || t('verifyEmail.verifyFailed', { ns: 'auth' }))
      })
  }, [token, navigate, t])

  if (status === 'verifying') {
    return (
      <AuthLayout quote={t('verifyEmail.quote', { ns: 'auth' })}>
        <div className="space-y-6 text-center">
          <div className="w-14 h-14 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <Spinner />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{t('verifyEmail.verifying', { ns: 'auth' })}</h1>
            <p className="mt-2 text-sm text-gray-500">{t('verifyEmail.verifyingSubtitle', { ns: 'auth' })}</p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'success') {
    return (
      <AuthLayout quote={t('verifyEmail.quote', { ns: 'auth' })}>
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-green-800">{t('verifyEmail.successTitle', { ns: 'auth' })}</p>
            <p className="text-sm text-green-700">{t('common.redirectingToLogin', { ns: 'auth' })}</p>
          </div>
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

  /* status === 'error' */
  return (
    <AuthLayout quote={t('verifyEmail.quote', { ns: 'auth' })}>
      <div className="space-y-6">
        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
          <FiAlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{t('verifyEmail.errorTitle', { ns: 'auth' })}</h1>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 w-full bg-[#1A7A6E] hover:bg-[#155f55] text-white font-bold py-3 rounded-xl transition-all shadow-sm"
        >
          <FiMail className="w-4 h-4" /> {t('verifyEmail.goToLoginToResend', { ns: 'auth' })} <FiArrowRight className="w-4 h-4" />
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

export default VerifyEmailPage
