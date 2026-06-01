import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'
import axios from 'axios'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [status, setStatus] = useState('Completing sign in...')

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const token  = params.get('token')
      const error  = params.get('error')

      if (error || !token) {
        setStatus('Sign in failed. Redirecting...')
        setTimeout(() => navigate('/login?error=' + (error || 'notoken'), { replace: true }), 1500)
        return
      }

      setStatus('Loading your profile...')

      // Retry up to 5 times — handles Render cold start (50 sec spin-up)
      let success = false
      for (let attempt = 1; attempt <= 5; attempt++) {
        setStatus(`Connecting to server... (attempt ${attempt}/5)`)
        success = await loginWithToken(token)
        if (success) break

        if (attempt < 5) {
          setStatus(`Server is waking up... please wait (${attempt * 10}s)`)
          await new Promise(r => setTimeout(r, 10000)) // wait 10 seconds
        }
      }

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
        display: 'flex', alignItems: 'center', gap: 7,
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
        <p style={{ fontSize: '.8rem', color: '#8891a8' }}>
          First login may take up to 60 seconds
        </p>
      </div>
    </div>
  )
}