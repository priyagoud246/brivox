import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Set token on every request if available
const getToken = () => localStorage.getItem('brivox_token')

axios.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axios.defaults.withCredentials = true

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/auth/me`)
      .then(r => setUser(r.data))
      .catch(() => {
        setUser(null)
        localStorage.removeItem('brivox_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (userData) => {
    if (userData.token) {
      localStorage.setItem('brivox_token', userData.token)
    }
    setUser(userData)
  }

  const logout = async () => {
    await axios.get(`${API}/auth/logout`).catch(() => {})
    localStorage.removeItem('brivox_token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, setUser: login, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}