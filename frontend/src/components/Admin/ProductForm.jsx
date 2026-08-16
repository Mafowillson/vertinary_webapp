import { useState, useEffect } from 'react'
import { productService } from '../../services/productService'
import LessonManager from './LessonManager'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  FiX,
  FiPackage,
  FiDollarSign,
  FiImage,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiCalendar,
  FiTrendingUp,
} from 'react-icons/fi'

const ProductForm = ({ product, onClose }) => {
  const { t } = useLanguage()
  // Once a product exists (editing, or just created below), we can manage its lessons.
  const [activeProductId, setActiveProductId] = useState(product?.id || null)
  const justCreated = !product && !!activeProductId
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    image_url: '',
    stock: '',
    offer_end_date: '',
    featured: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const [imageUploadError, setImageUploadError] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        original_price: product.original_price || product.originalPrice || '',
        image_url: product.image_url || product.imageUrl || '',
        stock: product.stock || '',
        offer_end_date: product.offer_end_date
          ? new Date(product.offer_end_date).toISOString().slice(0, 16)
          : product.offerEndDate
            ? new Date(product.offerEndDate).toISOString().slice(0, 16)
            : '',
        featured: product.featured || false,
      })
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    // Clear errors when user starts typing
    if (error) setError('')
    if (success) setSuccess(false)
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    setImageUploadError('')
    setImageUploading(true)
    setImageUploadProgress(0)
    try {
      const url = await productService.uploadProductImage(file, (evt) => {
        if (evt.total) setImageUploadProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      setFormData((prev) => ({ ...prev, image_url: url }))
    } catch (err) {
      setImageUploadError(err.message || t('form.fields.image.uploadError', { ns: 'adminProducts' }))
    } finally {
      setImageUploading(false)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError(t('form.errors.titleRequired', { ns: 'adminProducts' }))
      return false
    }
    if (!formData.description?.trim()) {
      setError(t('form.errors.descriptionRequired', { ns: 'adminProducts' }))
      return false
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError(t('form.errors.priceRequired', { ns: 'adminProducts' }))
      return false
    }
    if (formData.original_price && parseFloat(formData.original_price) <= parseFloat(formData.price)) {
      setError(t('form.errors.originalPriceInvalid', { ns: 'adminProducts' }))
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        image_url: formData.image_url?.trim() || null,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        offer_end_date: formData.offer_end_date || null,
        featured: formData.featured,
      }

      if (product) {
        await productService.updateProduct(product.id, submitData)
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        const created = await productService.createProduct(submitData)
        setSuccess(true)
        // Keep the modal open so lessons can be added right away instead of closing immediately.
        setActiveProductId(created.id)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t('form.errors.saveFailed', { ns: 'adminProducts' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <FiPackage className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {product
                  ? t('form.header.editTitle', { ns: 'adminProducts' })
                  : t('form.header.createTitle', { ns: 'adminProducts' })}
              </h2>
              <p className="text-sm text-gray-600">
                {product
                  ? t('form.header.editSubtitle', { ns: 'adminProducts' })
                  : t('form.header.createSubtitle', { ns: 'adminProducts' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-3">
              <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="font-medium">
                {product
                  ? t('form.success.updated', { ns: 'adminProducts' })
                  : t('form.success.created', { ns: 'adminProducts' })}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FiInfo className="w-5 h-5 text-primary-600" />
              <span>{t('form.sections.basicInfo', { ns: 'adminProducts' })}</span>
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t('form.fields.title.label', { ns: 'adminProducts' })} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={t('form.fields.title.placeholder', { ns: 'adminProducts' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t('form.fields.description.label', { ns: 'adminProducts' })} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('form.fields.description.placeholder', { ns: 'adminProducts' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FiDollarSign className="w-5 h-5 text-primary-600" />
              <span>{t('form.sections.pricing', { ns: 'adminProducts' })}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('form.fields.price.label', { ns: 'adminProducts' })} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    FCFA
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('form.fields.originalPrice.label', { ns: 'adminProducts' })}
                  <span className="text-xs text-gray-500 ml-2">{t('form.fields.originalPrice.hint', { ns: 'adminProducts' })}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="original_price"
                    min="0"
                    step="0.01"
                    value={formData.original_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    FCFA
                  </span>
                </div>
                {formData.original_price && parseFloat(formData.original_price) > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('form.fields.originalPrice.discountLabel', { ns: 'adminProducts' })}{' '}
                    {formData.price
                      ? `${(
                          ((parseFloat(formData.original_price) - parseFloat(formData.price)) /
                            parseFloat(formData.original_price)) *
                          100
                        ).toFixed(0)}%`
                      : '0%'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FiImage className="w-5 h-5 text-primary-600" />
              <span>{t('form.sections.media', { ns: 'adminProducts' })}</span>
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t('form.fields.image.label', { ns: 'adminProducts' })}
              </label>

              <div className="flex items-start gap-4">
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt={t('form.fields.image.previewAlt', { ns: 'adminProducts' })}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                )}

                <div className="flex-1 space-y-2">
                  <label
                    htmlFor="product-image-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-colors ${
                      imageUploading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    {imageUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        <span>{t('form.fields.image.uploading', { ns: 'adminProducts' })} {imageUploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <FiImage className="w-4 h-4" />
                        <span>
                          {formData.image_url
                            ? t('form.fields.image.changeButton', { ns: 'adminProducts' })
                            : t('form.fields.image.uploadButton', { ns: 'adminProducts' })}
                        </span>
                      </>
                    )}
                  </label>
                  <input
                    id="product-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageFileChange}
                    disabled={imageUploading}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <FiInfo className="w-3 h-3" />
                    <span>{t('form.fields.image.hint', { ns: 'adminProducts' })}</span>
                  </p>
                  {imageUploadError && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <FiAlertCircle className="w-3 h-3" />
                      <span>{imageUploadError}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory & Settings Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FiPackage className="w-5 h-5 text-primary-600" />
              <span>{t('form.sections.inventory', { ns: 'adminProducts' })}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('form.fields.stock.label', { ns: 'adminProducts' })}
                </label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder={t('form.fields.stock.placeholder', { ns: 'adminProducts' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">{t('form.fields.stock.hint', { ns: 'adminProducts' })}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4" />
                  <span>{t('form.fields.offerEndDate.label', { ns: 'adminProducts' })}</span>
                </label>
                <input
                  type="datetime-local"
                  name="offer_end_date"
                  value={formData.offer_end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">{t('form.fields.offerEndDate.hint', { ns: 'adminProducts' })}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="featured" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <FiTrendingUp className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-900">{t('form.fields.featured.label', { ns: 'adminProducts' })}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('form.fields.featured.hint', { ns: 'adminProducts' })}
                </p>
              </label>
            </div>
          </div>

          {/* Lesson content — only once the product exists (editing, or just created below) */}
          {activeProductId && (
            <div className="pt-2 border-t border-gray-200">
              <LessonManager productId={activeProductId} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            {justCreated ? (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <FiCheckCircle className="w-5 h-5" />
                <span>{t('form.buttons.done', { ns: 'adminProducts' })}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('form.buttons.cancel', { ns: 'adminProducts' })}
                </button>
                <button
                  type="submit"
                  disabled={loading || success || imageUploading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t('form.buttons.saving', { ns: 'adminProducts' })}</span>
                    </>
                  ) : success ? (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      <span>{t('form.buttons.saved', { ns: 'adminProducts' })}</span>
                    </>
                  ) : (
                    <span>
                      {product
                        ? t('form.buttons.update', { ns: 'adminProducts' })
                        : t('form.buttons.create', { ns: 'adminProducts' })}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm

