import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider by design
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          setToken(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [token])

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    setToken(response.token)
    setUser(response.user)
    localStorage.setItem('token', response.token)
    if (response.refresh_token) {
      localStorage.setItem('refreshToken', response.refresh_token)
    }
    return response
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    return response
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

