import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Completing sign in...')

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const token  = params.get('token')
      const error  = params.get('error')

      console.log('AuthCallback - token present:', !!token)
      console.log('AuthCallback - error:', error)

      if (error || !token) {
        setStatus('Sign in failed. Redirecting...')
        setTimeout(() => navigate('/login?error=' + (error || 'notoken'), { replace: true }), 1500)
        return
      }

      // Store token immediately
      localStorage.setItem('brivox_token', token)
      console.log('Token stored in localStorage')

      try {
        setStatus('Loading your profile...')

        // Verify token works
        const { data } = await axios.get(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        })

        console.log('User profile loaded:', data.email)
        setStatus('Welcome ' + data.name + '!')

        // Store user in sessionStorage as backup
        sessionStorage.setItem('brivox_user', JSON.stringify({ ...data, token }))

        setTimeout(() => {
          navigate('/directory', { replace: true })
        }, 500)

      } catch (err) {
        console.error('Profile fetch failed:', err.message)
        console.error('Status:', err.response?.status)

        // Token stored but /me failed — still go to directory
        // AuthContext will handle it
        if (err.response?.status === 401) {
          console.log('401 on /me — token may be invalid')
          localStorage.removeItem('brivox_token')
          setStatus('Authentication failed. Redirecting...')
          setTimeout(() => navigate('/login?error=auth', { replace: true }), 1500)
        } else {
          // Network error — token is stored, try directory anyway
          navigate('/directory', { replace: true })
        }
      }
    }

    run()
  }, [])

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.2rem',
      fontFamily: 'DM Sans, sans-serif',
      background: 'linear-gradient(168deg, #f7f9ff 0%, #fff 55%)'
    }}>
      <div style={{
        width: '44px', height: '44px',
        border: '3px solid #e2e6ef',
        borderTopColor: '#1a56db',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite'
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: '500', color: '#0f1117', marginBottom: '4px' }}>
          {status}
        </p>
        <p style={{ fontSize: '.8rem', color: '#8891a8' }}>
          Please wait...
        </p>
      </div>

      {/* Debug info - remove after fixing */}
      <div style={{
        position: 'fixed', bottom: '1rem',
        background: '#f0f2f7', borderRadius: '8px',
        padding: '.5rem 1rem', fontSize: '.72rem',
        color: '#8891a8', maxWidth: '80vw',
        wordBreak: 'break-all'
      }}>
        URL: {window.location.href.slice(0, 100)}
      </div>
    </div>
  )
}