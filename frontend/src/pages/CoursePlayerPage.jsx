import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiVideo,
  FiHeadphones,
  FiFileText,
  FiLock,
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
} from 'react-icons/fi'
import { productService } from '../services/productService'
import { lessonService } from '../services/lessonService'
import PdfReader from '../components/CoursePlayer/PdfReader'
import { useLanguage } from '../contexts/LanguageContext'

const ICONS = { video: FiVideo, audio: FiHeadphones, pdf: FiFileText }

const CoursePlayerPage = () => {
  const { t } = useLanguage()
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [lessons, setLessons] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [streamUrl, setStreamUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessLoading, setAccessLoading] = useState(false)
  const [error, setError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)

  const openLesson = useCallback(async (lessonId) => {
    setSelectedId(lessonId)
    setStreamUrl(null)
    setAccessDenied(false)
    setAccessLoading(true)
    setError('')
    try {
      const access = await lessonService.getLessonAccess(productId, lessonId)
      setStreamUrl(lessonService.buildStreamUrl(access.streamUrl))
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('not purchased')) {
        setAccessDenied(true)
      } else {
        setError(err.message || t('player.lessonAccessError', { ns: 'library' }))
      }
    } finally {
      setAccessLoading(false)
    }
  }, [productId, t])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [productData, lessonsData] = await Promise.all([
          productService.getProductById(productId),
          lessonService.getLessons(productId),
        ])
        setProduct(productData)
        setLessons(lessonsData)
        if (lessonsData.length > 0) {
          openLesson(lessonsData[0].id)
        }
      } catch (err) {
        setError(err.message || t('player.loadError', { ns: 'library' }))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId, openLesson, t])

  const selectedLesson = lessons.find((l) => l.id === selectedId)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center min-h-screen bg-gray-50">
        <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/products" className="text-primary-600 hover:underline font-medium">
          {t('player.backToProducts', { ns: 'library' })}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          {t('player.backToCatalog', { ns: 'library' })}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{product?.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: curriculum */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">
                  {t('player.contentCount', { ns: 'library', count: lessons.length })}
                </h2>
              </div>
              {lessons.length === 0 ? (
                <p className="text-sm text-gray-500 p-4">{t('player.contentComingSoon', { ns: 'library' })}</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {lessons.map((lesson) => {
                    const Icon = ICONS[lesson.contentType] || FiFileText
                    const active = lesson.id === selectedId
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => openLesson(lesson.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          active ? 'bg-primary-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-sm font-medium truncate ${
                            active ? 'text-primary-700' : 'text-gray-700'
                          }`}
                        >
                          {lesson.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Main viewer */}
          <main className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 min-h-[24rem] flex flex-col">
              {!selectedLesson ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  {t('player.selectContent', { ns: 'library' })}
                </div>
              ) : accessDenied ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <FiLock className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('player.contentLocked', { ns: 'library' })}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm">
                    {t('player.purchaseRequired', { ns: 'library' })}
                  </p>
                  <Link
                    to={`/products/${productId}`}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    {t('player.viewProduct', { ns: 'library' })}
                  </Link>
                </div>
              ) : accessLoading ? (
                <div className="flex-1 flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
              ) : error || !streamUrl ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <FiAlertCircle className="w-12 h-12 text-red-400 mb-4" />
                  <p className="text-sm text-gray-500 max-w-sm">
                    {error || t('player.contentAccessError', { ns: 'library' })}
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{selectedLesson.title}</h2>
                  {selectedLesson.description && (
                    <p className="text-sm text-gray-500 mb-4">{selectedLesson.description}</p>
                  )}

                  {selectedLesson.contentType === 'video' && (
                    <video
                      key={streamUrl}
                      controls
                      controlsList="nodownload noremoteplayback"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full rounded-lg bg-black max-h-[32rem]"
                      src={streamUrl}
                    />
                  )}

                  {selectedLesson.contentType === 'audio' && (
                    <audio
                      key={streamUrl}
                      controls
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full"
                      src={streamUrl}
                    />
                  )}

                  {selectedLesson.contentType === 'pdf' && <PdfReader url={streamUrl} />}

                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    <span>{t('player.accountOnlyDisclaimer', { ns: 'library' })}</span>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default CoursePlayerPage
