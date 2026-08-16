import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCurrency } from '../../contexts/CurrencyContext'
import {
  FiShoppingCart, FiClock, FiPlay, FiFileText, FiBook, FiHeadphones, FiAward, FiZap,
} from 'react-icons/fi'
import { useCountdown } from '../../utils/countdown'

const FORMAT_MAP = {
  'PDF Guide':     { labelKey: 'productCard.formatPdf',   gradient: 'from-amber-400 to-orange-600',   badgeBg: 'bg-amber-500',   Icon: FiFileText   },
  'Video Lecture': { labelKey: 'productCard.formatVideo', gradient: 'from-blue-500 to-indigo-700',    badgeBg: 'bg-blue-600',    Icon: FiPlay       },
  'E-book':        { labelKey: 'productCard.formatEbook', gradient: 'from-violet-500 to-purple-700',  badgeBg: 'bg-violet-600',  Icon: FiBook       },
  'Audio':         { labelKey: 'productCard.formatAudio', gradient: 'from-teal-400 to-emerald-600',   badgeBg: 'bg-teal-600',    Icon: FiHeadphones },
}
const DEFAULT_FMT = {
  labelKey: 'productCard.formatPdf', gradient: 'from-emerald-500 to-teal-700', badgeBg: 'bg-emerald-600', Icon: FiFileText,
}

const CROSS_SVG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`

function PlaceholderCover({ format }) {
  const { gradient, Icon } = FORMAT_MAP[format] || DEFAULT_FMT
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
      <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: CROSS_SVG }} />
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10" />
      <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-black/10" />
      <div className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-white/[0.07]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm flex items-center justify-center shadow-2xl">
          <Icon className="w-8 h-8 text-white drop-shadow-sm" />
        </div>
      </div>
    </div>
  )
}

const ProductCard = ({ product }) => {
  const { t } = useLanguage()
  const { format: formatPrice } = useCurrency()
  const imageUrl = product.image_url || product.imageUrl
  const price = product.price
  const originalPrice = product.original_price || product.originalPrice
  const discountEndDate =
    product.discount_end_date || product.discountEndDate ||
    product.offer_end_date   || product.offerEndDate
  const hasDiscountDate = discountEndDate && new Date(discountEndDate) > new Date()
  const { timeLeft, isExpired } = useCountdown(hasDiscountDate ? discountEndDate : null)
  const hasActiveDiscount =
    originalPrice && price < originalPrice &&
    (!discountEndDate || (hasDiscountDate && !isExpired))
  const discountPct = hasActiveDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0
  const format = product.format || 'PDF Guide'
  const fmt = FORMAT_MAP[format] || DEFAULT_FMT
  const category = product.category || t('productCard.defaultCategory', { ns: 'common' })
  const isBestseller = product.bestseller || (product.purchase_count || product.sold || 0) > 50

  return (
    <div
      className="
        group relative flex flex-col bg-white rounded-2xl overflow-hidden
        shadow-[0_2px_16px_-4px_rgba(0,0,0,0.09)]
        hover:shadow-[0_20px_60px_-10px_rgba(5,150,105,0.24)]
        border border-slate-100/80 hover:border-emerald-200/70
        transition-all duration-300 ease-out hover:-translate-y-2
      "
    >
      {/* ── Thumbnail ───────────────────────────────────────────── */}
      <Link
        to={`/products/${product.id}`}
        className="relative block h-52 overflow-hidden bg-slate-100 shrink-0"
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
          </>
        ) : (
          <PlaceholderCover format={format} />
        )}

        {/* format + discount badges — top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`${fmt.badgeBg} text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg tracking-wider shadow-md`}
          >
            {t(fmt.labelKey, { ns: 'common' })}
          </span>
          {hasActiveDiscount && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-md">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* bestseller badge — top-right */}
        {isBestseller && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-md">
              <FiAward className="w-3 h-3" />
              {t('productCard.topBadge', { ns: 'common' })}
            </span>
          </div>
        )}
      </Link>

      {/* ── Card body ───────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4">
        {/* category eyebrow */}
        <p className="text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest mb-1.5 truncate">
          {category}
        </p>

        {/* title */}
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-emerald-700 transition-colors min-h-[2.5rem]">
            {product.title}
          </h3>
        </Link>

        {/* push price to bottom */}
        <div className="flex-1 min-h-[0.75rem]" />

        {/* countdown — only when there's an active timed offer */}
        {hasActiveDiscount && discountEndDate && hasDiscountDate && (
          <div className="mt-2.5 flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            <FiClock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="text-xs font-bold text-rose-600 tabular-nums">
              {timeLeft.days > 0 ? `${timeLeft.days}${t('productCard.dayAbbr', { ns: 'common' })} ` : ''}
              {String(timeLeft.hours).padStart(2, '0')}{t('productCard.hourAbbr', { ns: 'common' })}{' '}
              {String(timeLeft.minutes).padStart(2, '0')}{t('productCard.minuteAbbr', { ns: 'common' })}
            </span>
            <span className="ml-auto flex items-center gap-0.5 text-[10px] font-semibold text-rose-400">
              <FiZap className="w-3 h-3" />
              {t('productCard.limitedOffer', { ns: 'common' })}
            </span>
          </div>
        )}

        {/* price + CTA */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            {hasActiveDiscount && originalPrice && (
              <span className="block text-[11px] text-slate-400 line-through leading-none mb-0.5 tabular-nums">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span
              className={`text-[15px] font-extrabold leading-none tabular-nums ${
                hasActiveDiscount ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {formatPrice(price)}
            </span>
          </div>
          <button className="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm shadow-emerald-200/80 hover:shadow-md hover:shadow-emerald-300/60">
            <FiShoppingCart className="w-3.5 h-3.5" />
            {t('buttons.addToCart', { ns: 'common' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
