import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router doesn't reset scroll position on navigation like a traditional
// page load would — without this, a new route just keeps whatever scroll
// position the previous page was left at.
const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // A hash means an intentional deep link to a section (e.g. LandingPage's
    // own #anchor scroll effect) — don't fight that.
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default ScrollToTop
