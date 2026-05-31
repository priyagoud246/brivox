import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API } from '../context/AuthContext'

export default function AuthCallback() {
  const { setUser } = useAuth()
  const navigate    = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const error  = params.get('error')

    if (error) {
      navigate('/login?error=google', { replace: true })
      return
    }

    if (token) {
      // Store token
      localStorage.setItem('brivox_token', token)

      // Fetch user info using that token
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      .then(r => {
        setUser({ ...r.data, token })
        navigate('/directory', { replace: true })
      })
      .catch(() => {
        navigate('/login?error=failed', { replace: true })
      })
    } else {
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div style={{
      display:'flex', height:'100vh',
      alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:'1rem',
      fontFamily:'DM Sans, sans-serif', color:'#8891a8'
    }}>
      <div style={{
        width:'40px', height:'40px', border:'3px solid #e2e6ef',
        borderTopColor:'#1a56db', borderRadius:'50%',
        animation:'spin .8s linear infinite'
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p>Completing sign in...</p>
    </div>
  )
}