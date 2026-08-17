import { useState, useEffect, useCallback } from 'react'
import {
  FiVideo,
  FiHeadphones,
  FiFileText,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiUpload,
  FiAlertCircle,
} from 'react-icons/fi'
import { lessonService } from '../../services/lessonService'
import { formatFileSize } from '../../utils/formatters'
import { useLanguage } from '../../contexts/LanguageContext'

const CONTENT_TYPES = [
  { value: 'video', labelKey: 'lessons.types.video', icon: FiVideo, accept: '.mp4,.webm,.mov,.m4v' },
  { value: 'audio', labelKey: 'lessons.types.audio', icon: FiHeadphones, accept: '.mp3,.wav,.m4a,.ogg' },
  { value: 'pdf', labelKey: 'lessons.types.pdf', icon: FiFileText, accept: '.pdf' },
]

const typeConfig = (type) => CONTENT_TYPES.find((c) => c.value === type) || CONTENT_TYPES[0]

const LessonManager = ({ productId }) => {
  const { t } = useLanguage()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contentType, setContentType] = useState('video')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const loadLessons = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await lessonService.getLessons(productId)
      setLessons(data)
    } catch (err) {
      setError(err.message || t('lessons.errors.loadFailed', { ns: 'adminProducts' }))
    } finally {
      setLoading(false)
    }
  }, [productId, t])

  useEffect(() => {
    loadLessons()
  }, [loadLessons])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setFile(null)
    setProgress(0)
  }

  const handleUpload = async (e) => {
    e?.preventDefault()
    setError('')

    if (!title.trim()) {
      setError(t('lessons.errors.titleRequired', { ns: 'adminProducts' }))
      return
    }
    if (!file) {
      setError(t('lessons.errors.fileRequired', { ns: 'adminProducts' }))
      return
    }

    setUploading(true)
    setProgress(0)
    try {
      await lessonService.uploadLesson(
        productId,
        { title: title.trim(), description: description.trim() || undefined, contentType, orderIndex: lessons.length, file },
        (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
        }
      )
      resetForm()
      await loadLessons()
    } catch (err) {
      setError(err.message || t('lessons.errors.uploadFailed', { ns: 'adminProducts' }))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (lessonId) => {
    if (!window.confirm(t('lessons.confirm.delete', { ns: 'adminProducts' }))) return
    setError('')
    try {
      await lessonService.deleteLesson(productId, lessonId)
      await loadLessons()
    } catch (err) {
      setError(err.message || t('lessons.errors.deleteFailed', { ns: 'adminProducts' }))
    }
  }

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= lessons.length) return
    setError('')
    const a = lessons[index]
    const b = lessons[targetIndex]
    try {
      await Promise.all([
        lessonService.updateLesson(productId, a.id, { order_index: b.orderIndex ?? b.order_index }),
        lessonService.updateLesson(productId, b.id, { order_index: a.orderIndex ?? a.order_index }),
      ])
      await loadLessons()
    } catch (err) {
      setError(err.message || t('lessons.errors.reorderFailed', { ns: 'adminProducts' }))
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <FiVideo className="w-5 h-5 text-primary-600" />
        <span>{t('lessons.header.title', { ns: 'adminProducts' })}</span>
      </h3>
      <p className="text-xs text-gray-500 -mt-2">
        {t('lessons.header.subtitle', { ns: 'adminProducts' })}
      </p>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Existing lessons */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : lessons.length === 0 ? (
        <p className="text-sm text-gray-500 italic">{t('lessons.empty.title', { ns: 'adminProducts' })}</p>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, index) => {
            const cfg = typeConfig(lesson.contentType || lesson.content_type)
            const Icon = cfg.icon
            return (
              <div
                key={lesson.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
                  <p className="text-xs text-gray-500">
                    {t(cfg.labelKey, { ns: 'adminProducts' })} · {formatFileSize(lesson.fileSize ?? lesson.file_size ?? 0)}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t('lessons.actions.moveUp', { ns: 'adminProducts' })}
                  >
                    <FiChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === lessons.length - 1}
                    className="p-1.5 text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t('lessons.actions.moveDown', { ns: 'adminProducts' })}
                  >
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(lesson.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    title={t('lessons.actions.delete', { ns: 'adminProducts' })}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add lesson form — a plain div, not <form>: this whole component is rendered
          inside ProductForm's own <form>, and nested <form> elements are invalid HTML
          (the browser silently breaks submit routing when they're nested). */}
      <div className="p-4 border border-dashed border-gray-300 rounded-lg space-y-3 bg-white">
        <p className="text-sm font-semibold text-gray-900">{t('lessons.form.title', { ns: 'adminProducts' })}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder={t('lessons.form.titlePlaceholder', { ns: 'adminProducts' })}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={contentType}
            onChange={(e) => { setContentType(e.target.value); setFile(null) }}
            disabled={uploading}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {CONTENT_TYPES.map((c) => (
              <option key={c.value} value={c.value}>{t(c.labelKey, { ns: 'adminProducts' })}</option>
            ))}
          </select>
        </div>
        <textarea
          placeholder={t('lessons.form.descriptionPlaceholder', { ns: 'adminProducts' })}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <input
          type="file"
          accept={typeConfig(contentType).accept}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={uploading}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium hover:file:bg-primary-100"
        />
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{t('lessons.form.uploading', { ns: 'adminProducts', progress })}</span>
            </>
          ) : (
            <>
              <FiUpload className="w-4 h-4" />
              <span>{t('lessons.form.submit', { ns: 'adminProducts' })}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default LessonManager
