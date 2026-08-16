import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCurrency } from '../../contexts/CurrencyContext'
import { FiArrowRight, FiCheck } from 'react-icons/fi'

const categoryStyles = {
  training:     { accent: 'from-blue-500 to-indigo-600',    chip: 'bg-blue-50 text-blue-700 border-blue-200' },
  sales:        { accent: 'from-purple-500 to-violet-600',  chip: 'bg-purple-50 text-purple-700 border-purple-200' },
  products:     { accent: 'from-orange-400 to-red-500',     chip: 'bg-orange-50 text-orange-700 border-orange-200' },
  construction: { accent: 'from-yellow-400 to-amber-500',   chip: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  consulting:   { accent: 'from-teal-500 to-emerald-600',   chip: 'bg-teal-50 text-teal-700 border-teal-200' },
  default:      { accent: 'from-[#1A7A6E] to-emerald-500',  chip: 'bg-green-50 text-green-700 border-green-200' },
}

const ServiceCard = ({ service }) => {
  const { t } = useLanguage()
  const { format } = useCurrency()
  const style = categoryStyles[service.category] ?? categoryStyles.default

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

      {/* Top accent + icon */}
      <div className={`relative h-32 bg-gradient-to-br ${style.accent} flex items-center justify-center overflow-hidden`}>
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }}
        />
        <span className="relative text-5xl drop-shadow-sm select-none">{service.icon}</span>

        {service.featured && (
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/30">
            {t('services.featured', { ns: 'common' })}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category chip */}
        <span className={`self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 ${style.chip}`}>
          {t(`services.${service.category}`, { ns: 'common', defaultValue: service.category })}
        </span>

        <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
          {service.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
          {service.description}
        </p>

        {/* Features */}
        {service.features?.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {service.features.slice(0, 3).map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <FiCheck className="w-3.5 h-3.5 text-[#1A7A6E] mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          {service.price ? (
            <span className="text-base font-black text-[#1A7A6E]">{format(service.price)}</span>
          ) : (
            <span className="text-xs text-gray-400 italic">{t('services.contactForPricing', { ns: 'common' })}</span>
          )}

          <Link
            to={`/services/${service.id}`}
            className={`inline-flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r ${style.accent} px-4 py-2 rounded-xl transition-all hover:opacity-90 hover:shadow-md whitespace-nowrap`}
          >
            {t('services.learnMore', { ns: 'common' })}
            <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
