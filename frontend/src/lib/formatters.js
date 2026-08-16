import i18next from 'i18next'

export function formatCurrency(amount, currency) {
  const locale = i18next.language || 'en'
  // "FCFA" isn't a valid ISO 4217 code, so Intl's `style: 'currency'` can't be used —
  // format the number with locale-aware grouping and append the currency label as
  // text, same approach already used in the admin pages. Site currency defaults to
  // FCFA (the actual configured currency — see SiteConfig/AppContext) rather than USD.
  const symbol = currency || 'FCFA'
  return `${new Intl.NumberFormat(locale).format(amount)} ${symbol}`
}

export function formatDate(date) {
  const locale = i18next.language || 'en'
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatNumber(number) {
  const locale = i18next.language || 'en'
  return new Intl.NumberFormat(locale).format(number)
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}
