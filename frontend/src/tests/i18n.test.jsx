import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, screen, fireEvent } from '@testing-library/react'
import i18next from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import { formatCurrency } from '../lib/formatters.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesRoot = join(__dirname, '../../public/locales')
const SUPPORTED = ['en', 'fr', 'zh', 'hi', 'es']
const NAMESPACES = ['common', 'auth', 'product', 'checkout', 'library', 'errors', 'landing', 'about', 'services', 'legal', 'adminDashboard', 'adminProducts', 'adminOrders', 'adminUsers', 'adminAnalytics', 'adminSettings']

function collectLeafKeys(obj, prefix = '') {
  const keys = []
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return keys
  }
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectLeafKeys(v, path))
    } else {
      keys.push(path)
    }
  }
  return keys.sort()
}

describe('locale files', () => {
  it('has all languages and namespaces on disk', () => {
    for (const lng of SUPPORTED) {
      const dir = join(localesRoot, lng)
      expect(existsSync(dir), `missing ${lng}`).toBe(true)
      for (const ns of NAMESPACES) {
        expect(existsSync(join(dir, `${ns}.json`)), `${lng}/${ns}.json`).toBe(true)
      }
    }
  })

  it('matches English keys for every language and namespace', () => {
    for (const ns of NAMESPACES) {
      const enPath = join(localesRoot, 'en', `${ns}.json`)
      const enJson = JSON.parse(readFileSync(enPath, 'utf8'))
      const refKeys = collectLeafKeys(enJson)

      for (const lng of SUPPORTED) {
        if (lng === 'en') continue
        const path = join(localesRoot, lng, `${ns}.json`)
        const data = JSON.parse(readFileSync(path, 'utf8'))
        const keys = collectLeafKeys(data)
        expect(keys, `${lng}/${ns}.json`).toEqual(refKeys)
      }
    }
  })
})

describe('LanguageSwitcher', () => {
  it('renders five language options', async () => {
    const instance = i18next.createInstance()
    await instance.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      resources: { en: { common: {} } },
      defaultNS: 'common',
      interpolation: { escapeValue: false },
    })
    instance.changeLanguage = vi.fn()

    render(
      <I18nextProvider i18n={instance}>
        <LanguageSwitcher />
      </I18nextProvider>,
    )

    const select = screen.getByRole('combobox', { name: /select language/i })
    expect(select.querySelectorAll('option').length).toBe(5)
    expect(select).toHaveAttribute('aria-label', 'Select language')
  })

  it('calls changeLanguage with selected code', async () => {
    const instance = i18next.createInstance()
    await instance.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      resources: { en: { common: {} } },
      defaultNS: 'common',
      interpolation: { escapeValue: false },
    })
    const change = vi.fn()
    instance.changeLanguage = change

    render(
      <I18nextProvider i18n={instance}>
        <LanguageSwitcher />
      </I18nextProvider>,
    )

    const select = screen.getByRole('combobox', { name: /select language/i })
    fireEvent.change(select, { target: { value: 'es' } })
    expect(change).toHaveBeenCalledWith('es')
  })
})

describe('formatCurrency', () => {
  beforeAll(async () => {
    if (!i18next.isInitialized) {
      await i18next.use(initReactI18next).init({
        lng: 'en',
        fallbackLng: 'en',
        resources: { en: { translation: {} } },
        interpolation: { escapeValue: false },
      })
    }
  })

  afterAll(async () => {
    await i18next.changeLanguage('en')
  })

  it('formats amounts for each supported locale', async () => {
    for (const lng of SUPPORTED) {
      await i18next.changeLanguage(lng)
      const out = formatCurrency(1999.5, 'USD')
      expect(out).toContain('999')
      expect(out).toMatch(/1/)
    }
  })
})

describe('axios Accept-Language', () => {
  it('request interceptor sets Accept-Language from i18next', async () => {
    vi.resetModules()
    const i18n = (await import('i18next')).default
    await i18n.init({
      lng: 'zh',
      fallbackLng: 'en',
      resources: { zh: { translation: {} } },
      interpolation: { escapeValue: false },
    })
    const { api } = await import('../../axiosInterceptor.js')
    const handler = api.interceptors.request.handlers[0].fulfilled
    const cfg = await Promise.resolve(handler({ headers: {}, url: '/t' }))
    expect(cfg.headers['Accept-Language']).toBe('zh')
  })
})
