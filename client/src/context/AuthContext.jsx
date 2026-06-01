import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Always attach token to every request
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('brivox_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

axios.defaults.withCredentials = true

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      // Check sessionStorage first (set by AuthCallback)
      const cached = sessionStorage.getItem('brivox_user')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setUserState(parsed)
          setLoading(false)
          return
        } catch (e) {
          sessionStorage.removeItem('brivox_user')
        }
      }

      // Check localStorage token
      const token = localStorage.getItem('brivox_token')
      if (!token) {
        setUserState(null)
        setLoading(false)
        return
      }

      // Verify token with backend
      try {
        const { data } = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        })
        setUserState(data)
      } catch (err) {
        console.error('Auth check failed:', err.response?.status)
        localStorage.removeItem('brivox_token')
        sessionStorage.removeItem('brivox_user')
        setUserState(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const setUser = (userData) => {
    if (!userData) {
      setUserState(null)
      return
    }
    if (userData.token) {
      localStorage.setItem('brivox_token', userData.token)
    }
    setUserState(userData)
  }

  const logout = async () => {
    try {
      await axios.get(`${API}/auth/logout`)
    } catch (e) {}
    localStorage.removeItem('brivox_token')
    sessionStorage.removeItem('brivox_user')
    setUserState(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}