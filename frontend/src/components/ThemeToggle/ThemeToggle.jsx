import { useTheme } from '../../contexts/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <FiSun className="w-5 h-5 text-yellow-500" />
      ) : (
        <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  )
}

export default ThemeToggle

