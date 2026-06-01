import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'

export default function AuthCallback() {
  const navigate           = useNavigate()
  const { loginWithToken } = useAuth()
  const [status, setStatus] = useState('Completing sign in...')

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const token  = params.get('token')
      const error  = params.get('error')

      console.log('AuthCallback — token present:', !!token)
      console.log('AuthCallback — error:', error)

      if (error || !token) {
        setStatus('Sign in failed. Redirecting...')
        setTimeout(() => navigate('/login?error=' + (error || 'notoken'), { replace: true }), 1500)
        return
      }

      setStatus('Loading your profile...')

      // loginWithToken handles storing + fetching /me + setting user in context
      const success = await loginWithToken(token)

      if (success) {
        setStatus('Welcome! Redirecting...')
        setTimeout(() => navigate('/directory', { replace: true }), 400)
      } else {
        setStatus('Authentication failed. Redirecting...')
        setTimeout(() => navigate('/login?error=auth', { replace: true }), 1500)
      }
    }

    run()
  }, [])

  return (
    <div style={{
      display: 'flex', height: '100vh',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '1.2rem',
      fontFamily: 'DM Sans, sans-serif',
      background: 'linear-gradient(168deg,#f7f9ff 0%,#fff 55%)',
    }}>
      <div style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: '1.8rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8,
      }}>
        BRIVOX
        <span style={{ width:8, height:8, borderRadius:'50%', background:'#c9a84c', display:'inline-block' }}/>
      </div>

      <div style={{
        width: 40, height: 40,
        border: '3px solid #e2e6ef',
        borderTopColor: '#1a56db',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite',
      }}/>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0f1117', marginBottom: 4 }}>
          {status}
        </p>
        <p style={{ fontSize: '.8rem', color: '#8891a8' }}>Please wait...</p>
      </div>
    </div>
  )
}