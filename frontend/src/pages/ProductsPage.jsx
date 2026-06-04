import { useState, useEffect } from 'react'
import { productService, setTranslationFunction } from '../services/productService'
import ProductCard from '../components/ProductCard/ProductCard'
import SkeletonLoader from '../components/LoadingSpinner/SkeletonLoader'
import { useLanguage } from '../contexts/LanguageContext'
import {
  FiSearch, FiX, FiFilter, FiSliders, FiDollarSign,
  FiVideo, FiHeadphones, FiBookOpen, FiBook, FiFileText, FiChevronDown,
} from 'react-icons/fi'
import { formatCurrency } from '../utils/formatters'

const SPECIES_OPTIONS = [
  { id: 'poultry',         label: 'Poules & volailles', hint: 'Pondeuses, chair, aviculture', emoji: '🐔', keywords: ['poule','poussin','avicole','pondeuse','chair','volaille','poulet','œuf','oeuf'] },
  { id: 'pigs',            label: 'Porcs',              hint: 'Élevage porcin',               emoji: '🐷', keywords: ['porc','porcin','truie'] },
  { id: 'turkeys',         label: 'Dindes',             hint: 'Dindons, dinde',               emoji: '🦃', keywords: ['dinde','dindon'] },
  { id: 'small_ruminants', label: 'Chèvres & moutons',  hint: 'Caprins, ovins',               emoji: '🐐', keywords: ['chèvre','mouton','caprin','ovin'] },
  { id: 'cattle',          label: 'Bovins',             hint: 'Vaches, bœufs',                emoji: '🐄', keywords: ['bovin','vache','bœuf','boeuf'] },
  { id: 'rabbits',         label: 'Lapins',             hint: 'Cuniculture',                  emoji: '🐰', keywords: ['lapin','cunicole'] },
]

const CONTENT_TYPE_OPTIONS = [
  { id: 'course',   label: 'Cours (vidéo)', hint: 'Séries, formations',         icon: FiVideo,     keywords: ['cours','vidéo','video','formation','série','serie'] },
  { id: 'document', label: 'Documents',    hint: 'PDF, fiches',                 icon: FiFileText,  keywords: ['pdf','document','fiche','manuel','kit'] },
  { id: 'audio',    label: 'Audio',        hint: 'Podcasts, enregistrements',   icon: FiHeadphones,keywords: ['audio','podcast','enregistrement'] },
  { id: 'article',  label: 'Articles',     hint: 'Lecture courte',              icon: FiBookOpen,  keywords: ['article','blog'] },
  { id: 'ebook',    label: 'E-books',      hint: 'Livres numériques',           icon: FiBook,      keywords: ['e-book','ebook','livre numérique'] },
]

function productTextBlob(p) {
  return `${p.title || ''} ${p.description || ''}`.toLowerCase()
}

function productMatchesSpecies(product, selectedIds) {
  if (!selectedIds.length) return true
  const blob = productTextBlob(product)
  const explicit = [product.species, product.animal_type, product.category, ...(Array.isArray(product.tags) ? product.tags : [])]
    .filter(Boolean).join(' ').toLowerCase()
  return selectedIds.some((id) => {
    const opt = SPECIES_OPTIONS.find((o) => o.id === id)
    if (!opt) return false
    return opt.keywords.some((k) => explicit.includes(k)) || opt.keywords.some((k) => blob.includes(k))
  })
}

function productMatchesContentType(product, selectedIds) {
  if (!selectedIds.length) return true
  const blob = productTextBlob(product)
  const fmt = (product.format || product.content_type || '').toString().toLowerCase()
  return selectedIds.some((id) => {
    const opt = CONTENT_TYPE_OPTIONS.find((o) => o.id === id)
    if (!opt) return false
    return opt.keywords.some((k) => fmt.includes(k)) || opt.keywords.some((k) => blob.includes(k))
  })
}

const CROSS_SVG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`

const ProductsPage = () => {
  const [products, setProducts]               = useState([])
  const [loading, setLoading]                 = useState(true)
  const [searchQuery, setSearchQuery]         = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])
  const [displayedProducts, setDisplayedProducts] = useState([])
  const [currentPage, setCurrentPage]         = useState(1)
  const [sortBy, setSortBy]                   = useState('most-popular')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const productsPerPage = 12

  const [selectedSpecies, setSelectedSpecies] = useState([])
  const [priceRange, setPriceRange]           = useState(100000)
  const [selectedFormats, setSelectedFormats] = useState([])

  const { t } = useLanguage()

  useEffect(() => { setTranslationFunction(t) }, [t])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const searchParam = urlParams.get('search')
        if (searchParam) {
          setSearchQuery(searchParam)
          const data = await productService.searchProducts(searchParam)
          setProducts(Array.isArray(data) ? data : (data?.data || []))
        } else {
          const data = await productService.getAllProducts()
          setProducts(Array.isArray(data) ? data : (data?.data || []))
        }
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [t])

  useEffect(() => {
    let filtered = [...products]
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    filtered = filtered.filter((p) => (p.price || 0) <= priceRange)
    filtered = filtered.filter((p) => productMatchesSpecies(p, selectedSpecies))
    filtered = filtered.filter((p) => productMatchesContentType(p, selectedFormats))
    if (sortBy === 'most-popular') filtered.sort((a, b) => (b.purchase_count || b.sold || 0) - (a.purchase_count || a.sold || 0))
    else if (sortBy === 'price-low')  filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
    else if (sortBy === 'price-high') filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
    else if (sortBy === 'newest')     filtered.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))
    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [products, searchQuery, selectedSpecies, priceRange, selectedFormats, sortBy])

  useEffect(() => {
    setDisplayedProducts(filteredProducts.slice(0, currentPage * productsPerPage))
  }, [filteredProducts, currentPage])

  const handleSpeciesToggle = (id) =>
    setSelectedSpecies((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])

  const handleContentTypeToggle = (id) =>
    setSelectedFormats((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])

  const clearAllFilters = () => {
    setSelectedSpecies([])
    setPriceRange(100000)
    setSelectedFormats([])
    setSearchQuery('')
  }

  const removeSpeciesFilter = (id) => setSelectedSpecies((prev) => prev.filter((s) => s !== id))
  const removeFormatFilter  = (id) => setSelectedFormats((prev) => prev.filter((f) => f !== id))

  const speciesLabel     = (id) => SPECIES_OPTIONS.find((o) => o.id === id)?.label || id
  const contentTypeLabel = (id) => CONTENT_TYPE_OPTIONS.find((o) => o.id === id)?.label || id

  const loadMore    = () => setCurrentPage((p) => p + 1)
  const totalPages  = Math.ceil(filteredProducts.length / productsPerPage)
  const activeFiltersCount = selectedSpecies.length + selectedFormats.length + (priceRange < 100000 ? 1 : 0)

  // ── Filter Sidebar ────────────────────────────────────────────────────────
  const FilterSidebar = ({ isMobile = false }) => (
    <div
      className={`${isMobile ? 'lg:hidden' : 'hidden lg:block'} ${isMobile ? 'fixed inset-0 z-50' : ''} ${
        isMobile && !mobileFiltersOpen ? 'pointer-events-none invisible' : ''
      }`}
      onClick={isMobile ? (e) => { if (e.target === e.currentTarget) setMobileFiltersOpen(false) } : undefined}
      role={isMobile ? 'presentation' : undefined}
    >
      {/* mobile backdrop */}
      {isMobile && (
        <div className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${mobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      )}

      <aside
        className={`
          ${isMobile ? 'absolute right-0 top-0 h-full w-[min(100%,22rem)]' : 'w-full max-w-[17rem] shrink-0'}
          ${isMobile ? 'shadow-2xl' : 'sticky top-24 self-start'}
          flex flex-col bg-white
          rounded-2xl border border-slate-200/80
          shadow-[0_4px_32px_-4px_rgba(0,0,0,0.10)]
          overflow-hidden
          transition-transform duration-300 ease-out
          ${isMobile && !mobileFiltersOpen ? 'translate-x-full' : 'translate-x-0'}
        `}
        onClick={(e) => e.stopPropagation()}
        aria-hidden={isMobile && !mobileFiltersOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <FiSliders className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">Affiner</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Espèces · Formats · Budget</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition-colors"
              >
                Tout effacer
              </button>
            )}
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Fermer"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-6">
          {/* ── Species ── */}
          <section>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              Pour quel élevage ?
            </p>
            <div className="space-y-1.5">
              {SPECIES_OPTIONS.map(({ id, label, hint, emoji }) => {
                const on = selectedSpecies.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSpeciesToggle(id)}
                    className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150
                      ${on
                        ? 'border-emerald-500/60 bg-emerald-50 shadow-sm'
                        : 'border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50'
                      }`}
                  >
                    <span className="text-lg leading-none shrink-0">{emoji}</span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold leading-tight ${on ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {label}
                      </span>
                      <span className="block text-[11px] text-slate-400 leading-tight mt-0.5 truncate">{hint}</span>
                    </span>
                    <span className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors
                      ${on ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 group-hover:border-emerald-400'}`}>
                      {on && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Content type ── */}
          <section>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              Type de contenu
            </p>
            <div className="space-y-1.5">
              {CONTENT_TYPE_OPTIONS.map(({ id, label, hint, icon: Icon }) => {
                const on = selectedFormats.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleContentTypeToggle(id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150
                      ${on
                        ? 'border-amber-400/60 bg-amber-50 shadow-sm'
                        : 'border-slate-100 bg-white hover:border-amber-200 hover:bg-slate-50'
                      }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors
                      ${on ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold leading-tight ${on ? 'text-amber-900' : 'text-slate-800'}`}>
                        {label}
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">{hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Price ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Budget max</p>
              <span className="text-sm font-bold text-slate-800 tabular-nums">{formatCurrency(priceRange)}</span>
            </div>
            <div className="px-1">
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full accent-emerald-600 cursor-pointer"
              />
              <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
                <span>0</span>
                <span>100 000+</span>
              </div>
            </div>
          </section>
        </div>

        {/* Mobile footer */}
        {isMobile && (
          <div className="border-t border-slate-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white transition-colors shadow-md shadow-emerald-200"
            >
              Voir {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </aside>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#064E3B] via-emerald-700 to-teal-800 text-white">
        {/* Cross pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]" style={{ backgroundImage: CROSS_SVG }} />

        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 w-[32rem] h-[32rem] rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 w-64 h-64 rounded-full bg-emerald-300/15 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4 backdrop-blur-sm ring-1 ring-white/15">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">
                Catalogue Éleveurs
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] mb-4 tracking-tight">
              Formations &amp; Ressources
              <span className="block text-emerald-300"> pour bien élever</span>
            </h1>

            {/* Sub */}
            <p className="text-emerald-100/85 text-base md:text-lg max-w-xl leading-relaxed">
              Cours vidéo, guides PDF, audios et articles — tout pour les poules, porcs, bovins et autres élevages.
              Choisissez une espèce pour affiner.
            </p>

            {/* Species quick-filter chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {SPECIES_OPTIONS.map(({ id, label, emoji }) => {
                const on = selectedSpecies.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSpeciesToggle(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                      on
                        ? 'bg-white text-emerald-800 shadow-lg scale-105'
                        : 'bg-white/12 text-white hover:bg-white/22 ring-1 ring-white/20 backdrop-blur-sm'
                    }`}
                  >
                    <span className="text-base leading-none">{emoji}</span>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-sm">
            {[
              { val: loading ? '…' : `${products.length}+`, lbl: 'Ressources' },
              { val: '6',                                   lbl: 'Espèces' },
              { val: '5',                                   lbl: 'Formats' },
            ].map(({ val, lbl }) => (
              <div key={lbl}>
                <p className="text-xl font-extrabold text-white tabular-nums">{val}</p>
                <p className="text-[11px] text-emerald-300/80 font-semibold uppercase tracking-wide mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SEARCH BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-6 z-10 bg-white rounded-2xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)] border border-slate-200/60 p-2 flex gap-2">
          {/* Search input */}
          <div className="flex-1 relative flex items-center">
            <FiSearch className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher formations, guides, espèces…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shrink-0"
          >
            <FiFilter className="w-4 h-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-white text-emerald-700 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filter chips */}
        {(selectedSpecies.length > 0 || selectedFormats.length > 0 || priceRange < 100000 || searchQuery) && (
          <div className="mt-3 flex flex-wrap gap-2 pb-1">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-full text-xs font-semibold">
                <FiSearch className="w-3 h-3 shrink-0" />
                {searchQuery}
                <button onClick={() => setSearchQuery('')} className="hover:text-slate-300 ml-0.5 transition-colors">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedSpecies.map((id) => {
              const opt = SPECIES_OPTIONS.find((o) => o.id === id)
              return (
                <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold">
                  <span>{opt?.emoji}</span>
                  {speciesLabel(id)}
                  <button type="button" onClick={() => removeSpeciesFilter(id)} className="hover:text-emerald-700 ml-0.5">
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </span>
              )
            })}
            {selectedFormats.map((id) => (
              <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold">
                {contentTypeLabel(id)}
                <button type="button" onClick={() => removeFormatFilter(id)} className="hover:text-amber-700 ml-0.5">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {priceRange < 100000 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-900 rounded-full text-xs font-semibold">
                <FiDollarSign className="w-3 h-3 shrink-0" />
                Max {formatCurrency(priceRange)}
                <button onClick={() => setPriceRange(100000)} className="hover:text-violet-700 ml-0.5">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* Sidebar — desktop */}
          <FilterSidebar />
          {/* Sidebar — mobile overlay */}
          <FilterSidebar isMobile={true} />

          {/* Results area */}
          <div className="flex-1 min-w-0">

            {/* ── Results header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">
                  {activeFiltersCount > 0 || searchQuery ? 'Résultats filtrés' : 'Tous les contenus'}
                </p>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {loading
                    ? 'Chargement…'
                    : `${filteredProducts.length} contenu${filteredProducts.length !== 1 ? 's' : ''}`}
                </h2>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm cursor-pointer"
                >
                  <option value="most-popular">Plus populaire</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                  <option value="newest">Plus récent</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* ── Grid ── */}
            {loading ? (
              <SkeletonLoader count={12} />
            ) : displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load more */}
                {displayedProducts.length < filteredProducts.length && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={loadMore}
                      className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-emerald-600 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all hover:shadow-md"
                    >
                      Charger plus
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
                        {filteredProducts.length - displayedProducts.length}
                      </span>
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) pageNum = i + 1
                      else if (currentPage <= 3) pageNum = i + 1
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                      else pageNum = currentPage - 2 + i
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[40px] h-10 px-3 rounded-xl text-sm font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-slate-400 px-1">…</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="min-w-[40px] h-10 px-3 rounded-xl text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 transition-all"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* ── Empty state ── */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center">
                    <FiSearch className="w-10 h-10 text-slate-300" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 text-3xl">🔍</div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Aucun résultat</h3>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
                  {searchQuery
                    ? `Aucune ressource ne correspond à "${searchQuery}". Essayez d'autres mots-clés.`
                    : 'Aucune ressource ne correspond à vos filtres. Essayez d\'élargir votre recherche.'}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-200 transition-all hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
