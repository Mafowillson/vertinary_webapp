import { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiAlertCircle } from 'react-icons/fi'
import { useLanguage } from '../../contexts/LanguageContext'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

/**
 * Renders PDF pages to a <canvas> (no browser-native PDF viewer, no download/print
 * button, no text layer to copy from) — intentionally read-only in-app viewing.
 */
const PdfReader = ({ url }) => {
  const { t } = useLanguage()
  const canvasRef = useRef(null)
  const renderTaskRef = useRef(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setPdfDoc(null)

    const loadingTask = pdfjsLib.getDocument(url)
    loadingTask.promise
      .then((doc) => {
        if (cancelled) return
        setPdfDoc(doc)
        setNumPages(doc.numPages)
        setPageNum(1)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(t('player.pdfLoadError', { ns: 'library' }))
        setLoading(false)
      })

    return () => {
      cancelled = true
      loadingTask.destroy?.()
    }
  }, [url, t])

  useEffect(() => {
    if (!pdfDoc) return
    let cancelled = false

    pdfDoc.getPage(pageNum).then((page) => {
      if (cancelled) return
      const canvas = canvasRef.current
      if (!canvas) return
      const viewport = page.getViewport({ scale })
      const context = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }
      const renderTask = page.render({ canvasContext: context, viewport })
      renderTaskRef.current = renderTask
      renderTask.promise.catch(() => {})
    })

    return () => {
      cancelled = true
    }
  }, [pdfDoc, pageNum, scale])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FiAlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Toolbar */}
      <div className="flex items-center justify-between w-full max-w-2xl mb-4 px-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            disabled={pageNum <= 1}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 tabular-nums">
            {t('player.pageIndicator', { ns: 'library', page: pageNum, total: numPages || '…' })}
          </span>
          <button
            type="button"
            onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
            disabled={pageNum >= numPages}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary-600"
          >
            <FiZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-primary-600"
          >
            <FiZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      )}

      <div
        className="shadow-lg rounded-lg overflow-auto max-w-full bg-white"
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas ref={canvasRef} className="select-none" />
      </div>
    </div>
  )
}

export default PdfReader
