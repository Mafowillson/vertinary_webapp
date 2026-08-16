import { useState } from 'react'
import { FiMessageCircle, FiX } from 'react-icons/fi'
import { useLanguage } from '../../contexts/LanguageContext'

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
        aria-label={t('chat.openLabel', { ns: 'common' })}
      >
        {isOpen ? (
          <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <div className="relative">
            <FiMessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full flex items-center justify-center">
              <span className="text-[5px] sm:text-[6px]">🧠</span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-80 max-w-sm h-80 sm:h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          <div className="bg-green-600 text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-sm sm:text-base">{t('chat.title', { ns: 'common' })}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 p-1"
              aria-label={t('chat.closeLabel', { ns: 'common' })}
            >
              <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div className="text-center text-gray-500 text-xs sm:text-sm py-6 sm:py-8">
              <p>{t('chat.comingSoon', { ns: 'common' })}</p>
              <p className="mt-2">{t('chat.contactSocial', { ns: 'common' })}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingChat
