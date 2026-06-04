import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productService, setTranslationFunction } from '../services/productService'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useCart } from '../contexts/CartContext'
import CountdownTimer from '../components/CountdownTimer/CountdownTimer'
import { formatCurrency } from '../utils/formatters'
import {
  FiDownload, FiShoppingCart, FiMessageCircle, FiArrowLeft, FiStar,
  FiCheck, FiShield, FiClock, FiZap, FiBookOpen, FiFileText, FiVideo,
  FiShare2, FiHeart, FiPlay, FiHeadphones, FiAward,
} from 'react-icons/fi'

const FORMAT_MAP = {
  'PDF Guide':     { label: 'PDF',    gradient: 'from-amber-400 to-orange-600',   badgeBg: 'bg-amber-500',   Icon: FiFileText   },
  'Video Lecture': { label: 'VIDÉO',  gradient: 'from-blue-500 to-indigo-700',    badgeBg: 'bg-blue-600',    Icon: FiPlay       },
  'E-book':        { label: 'E-BOOK', gradient: 'from-violet-500 to-purple-700',  badgeBg: 'bg-violet-600',  Icon: FiBookOpen   },
  'Audio':         { label: 'AUDIO',  gradient: 'from-teal-400 to-emerald-600',   badgeBg: 'bg-teal-600',    Icon: FiHeadphones },
}
const DEFAULT_FMT = {
  label: 'PDF', gradient: 'from-emerald-500 to-teal-700', badgeBg: 'bg-emerald-600', Icon: FiFileText,
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
  const { isAuthenticated } = useAuth()
  const { socialLinks } = useApp()
  const { t } = useLanguage()
  const { addToCart, isInCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description')
  const [imageZoom, setImageZoom] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => { setTranslationFunction(t) }, [t])

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productService.getProductById(id)
        setProduct(data)
      } catch (error) {
        console.error('Failed to load product:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id, t])

  const handlePurchase = () => {
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
          <p className="mt-4 text-slate-500 text-sm font-medium">Chargement du produit…</p>
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
            Le produit que vous recherchez n'existe pas ou a été supprimé.
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
  const rating      = 4.8
  const reviewCount = product.purchase_count || product.purchaseCount || 0
  const downloadCount =
    product.download_count ?? product.downloadCount ??
    product.sold ?? product.purchase_count ?? product.purchaseCount ?? 0

  const TABS = [
    { id: 'description', label: 'Description' },
    { id: 'details',     label: 'Détails' },
    { id: 'reviews',     label: `Avis (${reviewCount})` },
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
            Catalogue
          </Link>
          <p className="hidden sm:block text-xs text-slate-400 truncate">{product.title}</p>
          <span className={`${fmt.badgeBg} text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shrink-0`}>
            {fmt.label}
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
                    TOP VENTE
                  </span>
                </div>
              )}

              {/* Favorite */}
              <button className="absolute bottom-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all">
                <FiHeart className="w-4 h-4 text-slate-500 hover:text-rose-500 transition-colors" />
              </button>
            </div>

            {/* Below-image row */}
            <div className="mt-4 flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                <FiShare2 className="w-4 h-4" />
                Partager
              </button>
              {downloadCount > 0 && (
                <p className="ml-auto text-xs text-slate-400 tabular-nums">
                  {downloadCount.toLocaleString()} ventes
                </p>
              )}
            </div>
          </div>

          {/* ═══ Right: product details ══════════════════════════════════ */}
          <div className="space-y-5">

            {/* Category + title + rating */}
            <div>
              <p className="text-emerald-700 text-[11px] font-extrabold uppercase tracking-widest mb-2">
                {product.category || 'Ressource vétérinaire'}
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-slate-900 leading-tight mb-3">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-slate-700">{rating}</span>
                </div>
                {downloadCount > 0 && (
                  <span className="text-sm text-slate-400 tabular-nums">
                    {downloadCount.toLocaleString()} vendus
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
                    <p className="text-sm font-extrabold text-rose-900 leading-tight">Offre limitée</p>
                    <p className="text-xs text-rose-600 mt-0.5">
                      Économisez {formatCurrency(originalPrice - price)} — expire bientôt
                    </p>
                  </div>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-rose-100">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-rose-400 mb-2">
                    <FiClock className="w-3 h-3" />
                    Cette offre expire dans
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
                    {formatCurrency(originalPrice)}
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
                {formatCurrency(price)}
              </span>
              {hasActiveDiscount && (
                <p className="mt-1.5 text-sm text-slate-400">au lieu de {formatCurrency(originalPrice)}</p>
              )}
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { Icon: FiDownload, title: 'Téléchargement', sub: 'Immédiat' },
                { Icon: FiShield,   title: 'Garantie',      sub: '30 jours' },
                { Icon: fmt.Icon,   title: 'Format',        sub: fmt.label  },
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
                <FiDownload className="w-5 h-5" />
                {t('detail.downloadNow', { ns: 'product' })}
              </button>

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
                { Icon: FiShield,   text: 'Paiement sécurisé' },
                { Icon: FiDownload, text: 'Accès immédiat' },
                { Icon: FiCheck,    text: 'Garantie qualité' },
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

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { Icon: fmt.Icon,   label: 'Format',          value: format },
                  { Icon: FiDownload, label: 'Téléchargement',  value: 'Immédiat après achat' },
                  { Icon: FiShield,   label: 'Garantie',        value: 'Satisfait ou remboursé sous 30 jours' },
                  { Icon: FiStar,     label: 'Note',            value: `${rating}/5.0 — ${reviewCount} avis` },
                  { Icon: FiCheck,    label: 'Qualité',         value: 'Contenu vérifié et approuvé' },
                  { Icon: FiDownload, label: 'Ventes',          value: downloadCount.toLocaleString() },
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
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-8 h-8 text-slate-200 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 font-bold mb-1">Aucun avis pour le moment</p>
                <p className="text-slate-400 text-sm">Soyez le premier à laisser un avis sur ce produit !</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
