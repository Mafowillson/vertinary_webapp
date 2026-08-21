import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { orderService } from '../services/orderService'
import { lessonService } from '../services/lessonService'
import { reviewService } from '../services/reviewService'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useCart } from '../contexts/CartContext'
import { useCurrency } from '../contexts/CurrencyContext'
import CountdownTimer from '../components/CountdownTimer/CountdownTimer'
import {
  FiDownload, FiShoppingCart, FiMessageCircle, FiArrowLeft, FiStar,
  FiCheck, FiShield, FiClock, FiZap, FiBookOpen, FiFileText, FiVideo,
  FiShare2, FiHeart, FiPlay, FiHeadphones, FiAward, FiPlayCircle, FiMonitor,
} from 'react-icons/fi'

const LESSON_ICONS = { video: FiVideo, audio: FiHeadphones, pdf: FiFileText }

// `labelKey` resolves via t() at render time (module scope has no access to t()).
const FORMAT_MAP = {
  'PDF Guide':     { labelKey: 'detail.formatBadgePdf',   gradient: 'from-amber-400 to-orange-600',   badgeBg: 'bg-amber-500',   Icon: FiFileText   },
  'Video Lecture': { labelKey: 'detail.formatBadgeVideo', gradient: 'from-blue-500 to-indigo-700',    badgeBg: 'bg-blue-600',    Icon: FiPlay       },
  'E-book':        { labelKey: 'detail.formatBadgeEbook', gradient: 'from-violet-500 to-purple-700',  badgeBg: 'bg-violet-600',  Icon: FiBookOpen   },
  'Audio':         { labelKey: 'detail.formatBadgeAudio', gradient: 'from-teal-400 to-emerald-600',   badgeBg: 'bg-teal-600',    Icon: FiHeadphones },
}
const DEFAULT_FMT = {
  labelKey: 'detail.formatBadgePdf', gradient: 'from-emerald-500 to-teal-700', badgeBg: 'bg-emerald-600', Icon: FiFileText,
}

const CROSS_SVG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`

function PlaceholderCover({ format }) {
  const { gradient, Icon } = FORMAT_MAP[format] || DEFAULT_FMT
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: CROSS_SVG }} />
      <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10" />
      <div className="absolute -left-8 bottom-0 w-48 h-48 rounded-full bg-black/10" />
      <div className="absolute right-10 bottom-10 w-20 h-20 rounded-full bg-white/[0.07]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-3xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm flex items-center justify-center shadow-2xl">
          <Icon className="w-12 h-12 text-white drop-shadow-sm" />
        </div>
      </div>
    </div>
  )
}

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { socialLinks } = useApp()
  const { t, language } = useLanguage()
  const { format: formatPrice } = useCurrency()
  const { addToCart, isInCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description')
  const [imageZoom, setImageZoom] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [lessons, setLessons] = useState([])
  const [owned, setOwned] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeSubmitting, setLikeSubmitting] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewBody, setReviewBody] = useState('')
  const [reviewFormError, setReviewFormError] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productService.getProductById(id)
        setProduct(data)
        setLiked(Boolean(data.liked_by_me))
        setLikeCount(data.like_count || 0)
      } catch (error) {
        console.error('Failed to load product:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id, t])

  useEffect(() => {
    lessonService.getLessons(id).then(setLessons).catch(() => setLessons([]))
  }, [id])

  useEffect(() => {
    setReviewsLoading(true)
    reviewService
      .getReviews(id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false))
  }, [id])

  useEffect(() => {
    if (!isAuthenticated) {
      setOwned(false)
      return
    }
    let cancelled = false
    orderService
      .getUserOrders()
      .then((orders) => {
        if (cancelled) return
        const hasCompletedOrder = orders.some(
          (o) => String(o.productId ?? o.product_id) === String(id) && o.status === 'completed'
        )
        setOwned(hasCompletedOrder)
      })
      .catch(() => setOwned(false))
    return () => { cancelled = true }
  }, [id, isAuthenticated])

  const handlePurchase = () => {
    if (owned) {
      navigate(`/learn/${id}`)
      return
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/products/${id}` } })
      return
    }
    navigate(`/checkout/${id}`)
  }

  const handleAddToCart = () => {
    if (!product) return
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/products/${id}` } })
      return
    }
    const cartProduct = {
      id: product.id,
      title: product.title,
      price: product.price,
      original_price: product.original_price || product.originalPrice,
      image_url: product.image_url || product.imageUrl,
      imageUrl: product.image_url || product.imageUrl,
      description: product.description,
      category: product.category,
      format: product.format || 'PDF Guide',
    }
    addToCart(cartProduct)
    setCartAdded(true)
    setTimeout(() => setCartAdded(false), 2000)
  }

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/products/${id}` } })
      return
    }
    if (likeSubmitting) return
    setLikeSubmitting(true)
    const wasLiked = liked
    // Optimistic update, rolled back on failure below.
    setLiked(!wasLiked)
    setLikeCount((c) => c + (wasLiked ? -1 : 1))
    try {
      const result = wasLiked
        ? await reviewService.unlikeProduct(id)
        : await reviewService.likeProduct(id)
      setLiked(result.liked)
      setLikeCount(result.like_count)
    } catch (error) {
      setLiked(wasLiked)
      setLikeCount((c) => c + (wasLiked ? 1 : -1))
    } finally {
      setLikeSubmitting(false)
    }
  }

  const handleShare = async () => {
    const shareData = { title: product?.title, url: window.location.href }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled the native share sheet — not an error worth surfacing.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch (error) {
      // Clipboard API unavailable (non-HTTPS, permissions) — nothing more we can do here.
    }
  }

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null

  const resetReviewForm = () => {
    setEditingReviewId(null)
    setReviewRating(5)
    setReviewBody('')
    setReviewFormError('')
  }

  const startReviewForm = () => {
    if (myReview) {
      setEditingReviewId(myReview.id)
      setReviewRating(myReview.rating || 5)
      setReviewBody(myReview.body)
    } else {
      setEditingReviewId('new')
      setReviewRating(5)
      setReviewBody('')
    }
    setReviewFormError('')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewBody.trim()) {
      setReviewFormError(t('detail.reviewBodyRequired', { ns: 'product' }))
      return
    }
    setSubmittingReview(true)
    try {
      if (myReview) {
        const updated = await reviewService.updateReview(id, myReview.id, {
          body: reviewBody.trim(),
          rating: reviewRating,
        })
        setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      } else {
        const created = await reviewService.createReview(id, {
          body: reviewBody.trim(),
          rating: reviewRating,
        })
        setReviews((prev) => [created, ...prev])
      }
      resetReviewForm()
    } catch (error) {
      setReviewFormError(error.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!myReview) return
    if (!window.confirm(t('detail.deleteReviewConfirm', { ns: 'product' }))) return
    try {
      await reviewService.deleteReview(id, myReview.id)
      setReviews((prev) => prev.filter((r) => r.id !== myReview.id))
      resetReviewForm()
    } catch (error) {
      // Nothing actionable client-side beyond leaving the review list unchanged.
    }
  }

  const originalPrice = product?.original_price || product?.originalPrice
  const imageUrl      = product?.image_url || product?.imageUrl
  const price         = product?.price
  const description   = product?.description

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
          <p className="mt-4 text-slate-500 text-sm font-medium">{t('detail.loadingProduct', { ns: 'product' })}</p>
        </div>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <FiFileText className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {t('detail.productNotFound', { ns: 'product' })}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {t('detail.productNotFoundDesc', { ns: 'product' })}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-emerald-200"
          >
            <FiArrowLeft className="w-4 h-4" />
            {t('detail.backToProducts', { ns: 'product' })}
          </Link>
        </div>
      </div>
    )
  }

  const discountEndDate   = product.discount_end_date || product.discountEndDate || product.offer_end_date || product.offerEndDate
  const discountPercentage = originalPrice && price < originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0
  const hasActiveDiscount = discountPercentage > 0 && (!discountEndDate || new Date(discountEndDate) > new Date())

  const format      = product.format || 'PDF Guide'
  const fmt         = FORMAT_MAP[format] || DEFAULT_FMT
  const ratedReviews = reviews.filter((r) => r.rating != null)
  const rating      = ratedReviews.length > 0
    ? ratedReviews.reduce((sum, r) => sum + r.rating, 0) / ratedReviews.length
    : 0
  // Derived from the live `reviews` array (already fetched for the tab) rather
  // than product.review_count, which is just a page-load snapshot and would
  // otherwise go stale the moment a review is added/removed on this page.
  const reviewCount = reviews.length
  const downloadCount =
    product.download_count ?? product.downloadCount ??
    product.sold ?? product.purchase_count ?? product.purchaseCount ?? 0

  const TABS = [
    { id: 'description', label: t('detail.description', { ns: 'product' }) },
    { id: 'curriculum',  label: t('detail.tabContentCount', { ns: 'product', count: lessons.length }) },
    { id: 'details',     label: t('detail.tabDetails', { ns: 'product' }) },
    { id: 'reviews',     label: t('detail.tabReviewsCount', { ns: 'product', count: reviewCount }) },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ═══ Sticky top bar ══════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors group shrink-0"
          >
            <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t('detail.catalogueLink', { ns: 'product' })}
          </Link>
          <p className="hidden sm:block text-xs text-slate-400 truncate">{product.title}</p>
          <span className={`${fmt.badgeBg} text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shrink-0`}>
            {t(fmt.labelKey, { ns: 'product' })}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-12">

          {/* ═══ Left: product visual ════════════════════════════════════ */}
          <div className="lg:sticky lg:top-20 self-start">
            {/* Cover */}
            <div
              className="relative rounded-2xl overflow-hidden bg-slate-200 shadow-lg border border-slate-100/80 group cursor-zoom-in"
              style={{ aspectRatio: '4 / 3' }}
              onClick={() => setImageZoom((z) => !z)}
            >
              {imageUrl && !imgError ? (
                <>
                  <img
                    src={imageUrl}
                    alt={product.title}
                    onError={() => setImgError(true)}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      imageZoom ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </>
              ) : (
                <PlaceholderCover format={format} />
              )}

              {/* Discount badge */}
              {hasActiveDiscount && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-sm font-extrabold px-3 py-1.5 rounded-xl shadow-lg">
                    <FiZap className="w-3.5 h-3.5" />
                    -{discountPercentage}%
                  </span>
                </div>
              )}

              {/* Top-seller badge */}
              {(product.bestseller || downloadCount > 50) && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-lg">
                    <FiAward className="w-3.5 h-3.5" />
                    {t('detail.topSeller', { ns: 'product' })}
                  </span>
                </div>
              )}

              {/* Favorite */}
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleLike() }}
                disabled={likeSubmitting}
                aria-label={t(liked ? 'detail.favoriteRemove' : 'detail.favoriteAdd', { ns: 'product' })}
                aria-pressed={liked}
                className="absolute bottom-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all disabled:opacity-60"
              >
                <FiHeart className={`w-4 h-4 transition-colors ${liked ? 'text-rose-500 fill-current' : 'text-slate-500 hover:text-rose-500'}`} />
              </button>
            </div>

            {/* Below-image row */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                {shareCopied ? <FiCheck className="w-4 h-4 text-emerald-600" /> : <FiShare2 className="w-4 h-4" />}
                {shareCopied ? t('detail.linkCopied', { ns: 'product' }) : t('detail.share', { ns: 'product' })}
              </button>
              {likeCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <FiHeart className="w-3.5 h-3.5" />
                  {likeCount}
                </span>
              )}
              {downloadCount > 0 && (
                <p className="ml-auto text-xs text-slate-400 tabular-nums">
                  {t('detail.salesCountLabel', { ns: 'product', count: downloadCount.toLocaleString() })}
                </p>
              )}
            </div>
          </div>

          {/* ═══ Right: product details ══════════════════════════════════ */}
          <div className="space-y-5">

            {/* Category + title + rating */}
            <div>
              <p className="text-emerald-700 text-[11px] font-extrabold uppercase tracking-widest mb-2">
                {product.category || t('detail.defaultCategory', { ns: 'product' })}
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-slate-900 leading-tight mb-3">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                {ratedReviews.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(rating) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'
                        }`}
                      />
                    ))}
                    <span className="ml-1.5 text-sm font-bold text-slate-700">{rating.toFixed(1)}</span>
                  </div>
                )}
                {downloadCount > 0 && (
                  <span className="text-sm text-slate-400 tabular-nums">
                    {t('detail.soldCount', { ns: 'product', count: downloadCount.toLocaleString() })}
                  </span>
                )}
              </div>
            </div>

            {/* Limited offer strip */}
            {hasActiveDiscount && discountEndDate && (
              <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
                    <FiZap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-rose-900 leading-tight">{t('detail.limitedOffer', { ns: 'product' })}</p>
                    <p className="text-xs text-rose-600 mt-0.5">
                      {t('detail.saveAmountExpiring', { ns: 'product', amount: formatPrice(originalPrice - price) })}
                    </p>
                  </div>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-rose-100">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-rose-400 mb-2">
                    <FiClock className="w-3 h-3" />
                    {t('detail.offerExpiresIn', { ns: 'product' })}
                  </p>
                  <CountdownTimer targetDate={discountEndDate} />
                </div>
              </div>
            )}

            {/* Price card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              {originalPrice && hasActiveDiscount && (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base text-slate-400 line-through font-medium tabular-nums">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="bg-rose-100 text-rose-700 text-xs font-extrabold px-2 py-0.5 rounded-lg">
                    -{discountPercentage}%
                  </span>
                </div>
              )}
              <span
                className={`text-4xl sm:text-5xl font-extrabold tabular-nums leading-none ${
                  hasActiveDiscount ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {formatPrice(price)}
              </span>
              {hasActiveDiscount && (
                <p className="mt-1.5 text-sm text-slate-400">{t('detail.priceInsteadOf', { ns: 'product', price: formatPrice(originalPrice) })}</p>
              )}
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { Icon: FiMonitor, title: t('detail.featureOnlineAccess', { ns: 'product' }), sub: t('detail.featureImmediate', { ns: 'product' }) },
                { Icon: FiShield,  title: t('detail.labelGuarantee', { ns: 'product' }),       sub: t('detail.featureGuarantee30Days', { ns: 'product' }) },
                { Icon: fmt.Icon,  title: t('detail.labelFormat', { ns: 'product' }),          sub: t(fmt.labelKey, { ns: 'product' })  },
              ].map(({ Icon, title, sub }) => (
                <div
                  key={title}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 flex flex-col items-center text-center hover:shadow transition-shadow"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">{title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handlePurchase}
                className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold py-4 px-6 rounded-xl text-base transition-all shadow-md shadow-emerald-200/80 hover:shadow-lg hover:shadow-emerald-200/80 hover:-translate-y-0.5"
              >
                {owned ? <FiPlayCircle className="w-5 h-5" /> : <FiShoppingCart className="w-5 h-5" />}
                {owned ? t('detail.continueLearning', { ns: 'product' }) : t('detail.buyNow', { ns: 'product' })}
              </button>

              {!owned && (
              <button
                onClick={handleAddToCart}
                disabled={!product || cartAdded || (product && isInCart(product.id))}
                className={`w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-xl text-sm transition-all border-2 ${
                  !product || cartAdded || (product && isInCart(product.id))
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:-translate-y-0.5 active:scale-[0.99]'
                }`}
              >
                {cartAdded || (product && isInCart(product.id)) ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    {product && isInCart(product.id)
                      ? t('detail.inCart', { ns: 'product' })
                      : t('detail.addedToCart', { ns: 'product' })}
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-4 h-4" />
                    {t('detail.addToCart', { ns: 'product' })}
                  </>
                )}
              </button>
              )}

              {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-sm hover:shadow hover:-translate-y-0.5"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  {t('services.contactWhatsApp', { ns: 'common' })}
                </a>
              )}
            </div>

            {/* Trust strip */}
            <div className="flex items-center justify-around py-4 px-5 bg-white rounded-xl border border-slate-100 shadow-sm">
              {[
                { Icon: FiShield,  text: t('detail.trustSecurePayment', { ns: 'product' }) },
                { Icon: FiMonitor, text: t('detail.trustImmediateAccess', { ns: 'product' }) },
                { Icon: FiCheck,   text: t('detail.trustQualityGuarantee', { ns: 'product' }) },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-tight max-w-[5rem]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Tabs section ════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Tab nav */}
          <div className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex overflow-x-auto">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`shrink-0 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                    activeTab === id
                      ? 'border-emerald-600 text-emerald-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'description' && (
              <p className="text-slate-700 leading-relaxed text-base whitespace-pre-line">
                {description || t('detail.noDescriptionAvailable', { ns: 'product' })}
              </p>
            )}

            {activeTab === 'curriculum' && (
              lessons.length === 0 ? (
                <p className="text-slate-500 text-sm">{t('detail.curriculumComingSoon', { ns: 'product' })}</p>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const LessonIcon = LESSON_ICONS[lesson.contentType] || FiFileText
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                          {index + 1}
                        </span>
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <LessonIcon className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{lesson.title}</p>
                          {lesson.description && (
                            <p className="text-xs text-slate-400 truncate">{lesson.description}</p>
                          )}
                        </div>
                        {!owned && <FiShield className="w-4 h-4 text-slate-300 shrink-0" />}
                      </div>
                    )
                  })}
                  <p className="text-xs text-slate-400 pt-2 flex items-center gap-1.5">
                    <FiMonitor className="w-3.5 h-3.5" />
                    {t('detail.onlineViewingOnly', { ns: 'product' })}
                  </p>
                </div>
              )
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { Icon: fmt.Icon,   label: t('detail.labelFormat', { ns: 'product' }),   value: format },
                  { Icon: FiMonitor,  label: t('detail.labelAccess', { ns: 'product' }),   value: t('detail.valueAccessFull', { ns: 'product' }) },
                  { Icon: FiShield,   label: t('detail.labelGuarantee', { ns: 'product' }),value: t('detail.valueGuaranteeFull', { ns: 'product' }) },
                  { Icon: FiStar,     label: t('detail.labelRating', { ns: 'product' }),   value: ratedReviews.length > 0
                      ? t('detail.valueRating', { ns: 'product', rating: rating.toFixed(1), count: reviewCount })
                      : t('detail.noRatingsYet', { ns: 'product' }) },
                  { Icon: FiCheck,    label: t('detail.labelQuality', { ns: 'product' }),  value: t('detail.valueQuality', { ns: 'product' }) },
                  { Icon: FiDownload, label: t('detail.labelSales', { ns: 'product' }),    value: downloadCount.toLocaleString() },
                ].map(({ Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-0.5">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Write / edit / status area */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                  {editingReviewId ? (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <p className="text-sm font-bold text-slate-800">
                        {myReview ? t('detail.yourReview', { ns: 'product' }) : t('detail.writeReview', { ns: 'product' })}
                      </p>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1.5">{t('detail.yourRating', { ns: 'product' })}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} type="button" onClick={() => setReviewRating(n)} aria-label={String(n)}>
                              <FiStar className={`w-6 h-6 ${n <= reviewRating ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder={t('detail.reviewPlaceholder', { ns: 'product' })}
                        rows={4}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      {reviewFormError && <p className="text-sm text-rose-600">{reviewFormError}</p>}
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                          {submittingReview ? t('detail.submittingReview', { ns: 'product' }) : t('detail.submitReview', { ns: 'product' })}
                        </button>
                        <button
                          type="button"
                          onClick={resetReviewForm}
                          className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
                        >
                          {t('detail.cancel', { ns: 'product' })}
                        </button>
                      </div>
                    </form>
                  ) : myReview ? (
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500 mb-1">{t('detail.yourReview', { ns: 'product' })}</p>
                        {myReview.rating != null && (
                          <div className="flex items-center gap-0.5 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} className={`w-3.5 h-3.5 ${i < myReview.rating ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`} />
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-slate-700">{myReview.body}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button onClick={startReviewForm} className="text-xs font-bold text-emerald-700 hover:underline">
                          {t('detail.editReview', { ns: 'product' })}
                        </button>
                        <button onClick={handleDeleteReview} className="text-xs font-bold text-rose-600 hover:underline">
                          {t('detail.deleteReview', { ns: 'product' })}
                        </button>
                      </div>
                    </div>
                  ) : !isAuthenticated ? (
                    <button
                      onClick={() => navigate('/login', { state: { returnTo: `/products/${id}` } })}
                      className="text-sm font-bold text-emerald-700 hover:underline"
                    >
                      {t('detail.loginToReview', { ns: 'product' })}
                    </button>
                  ) : !owned ? (
                    <p className="text-sm text-slate-500">{t('detail.purchaseToReview', { ns: 'product' })}</p>
                  ) : (
                    <button
                      onClick={startReviewForm}
                      className="inline-flex items-center gap-2 px-4 py-2 border-2 border-emerald-600 text-emerald-700 text-sm font-bold rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <FiStar className="w-4 h-4" />
                      {t('detail.writeReview', { ns: 'product' })}
                    </button>
                  )}
                </div>

                {/* Review list */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="w-8 h-8 text-slate-200 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-700 font-bold mb-1">{t('detail.noReviewsYetTitle', { ns: 'product' })}</p>
                    <p className="text-slate-400 text-sm">{t('detail.beFirstToReview', { ns: 'product' })}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <p className="text-sm font-bold text-slate-800">{r.user_name}</p>
                          <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString(language)}</p>
                        </div>
                        {r.rating != null && (
                          <div className="flex items-center gap-0.5 mb-1.5">
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`} />
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{r.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
