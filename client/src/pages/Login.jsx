// WITH THIS:
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [serverReady, setServerReady] = useState(false)
  const [waking, setWaking] = useState(true)

  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '')
    || 'http://localhost:5000'

  // Wake the server before user clicks Google
  useEffect(() => {
    fetch(`${backendUrl}/health`)
      .then(() => setServerReady(true))
      .catch(() => setServerReady(true))
      .finally(() => setWaking(false))
  }, [])

  useEffect(() => {
    if (!loading && user) navigate('/directory', { replace: true })
  }, [user, loading])

  if (loading) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(168deg, #f7f9ff 0%, #fff 55%);
        }
        .login-card {
          background: #fff;
          border: 1px solid #e2e6ef;
          border-radius: 20px;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 12px 48px rgba(15,17,23,.10);
          text-align: center;
        }
        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #0f1117;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 0.5rem;
        }
        .logo-dot {
          width: 9px; height: 9px;
          border-radius: 50%;
          background: #c9a84c;
          display: inline-block;
          margin-bottom: 2px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #fdf3d7;
          color: #7a5c0a;
          border-radius: 20px;
          padding: 0.28rem 0.9rem;
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 1.8rem;
        }
        .login-card h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f1117;
          margin-bottom: 0.6rem;
          line-height: 1.25;
        }
        .login-card h2 em { font-style: italic; color: #1a56db; }
        .login-card p {
          color: #8891a8;
          font-size: 0.9rem;
          font-weight: 300;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 0.78rem 1.5rem;
          background: #0f1117;
          color: #fff;
          border: none;
          border-radius: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
        }
        .google-btn:hover { background: #1a56db; }
        .google-btn img { width: 20px; height: 20px; border-radius: 50%; }
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: #e2e6ef;
          font-size: 0.78rem;
          color: #8891a8;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e6ef;
        }
        .stats {
          display: flex;
          gap: 0;
          border: 1px solid #e2e6ef;
          border-radius: 12px;
          margin-top: 2rem;
          overflow: hidden;
        }
        .stat {
          flex: 1;
          padding: 0.8rem 0.5rem;
          text-align: center;
          border-right: 1px solid #e2e6ef;
        }
        .stat:last-child { border-right: none; }
        .stat strong {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f1117;
          display: block;
        }
        .stat small {
          font-size: 0.65rem;
          color: #8891a8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="logo">
            BRIVOX <span className="logo-dot"></span>
          </div>
          <div className="badge">SME Expert Directory</div>
          <h2>Connect with <em>verified experts</em></h2>
          <p>Sign in to explore angel investors, subject matter experts, and industry leaders across sectors.</p>

          

          
  <a
  href={serverReady ? `${backendUrl}/api/auth/google` : '#'}
  className="google-btn"
  style={{ opacity: waking ? 0.6 : 1, pointerEvents: waking ? 'none' : 'auto' }}
>
  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
  {waking ? 'Connecting...' : 'Continue with Google'}
</a>
          <div className="divider">trusted by professionals across India</div>

          <div className="stats">
            <div className="stat"><strong>70</strong><small>Experts</small></div>
            <div className="stat"><strong>20+</strong><small>Cities</small></div>
            <div className="stat"><strong>7</strong><small>Sectors</small></div>
            <div className="stat"><strong>100%</strong><small>Verified</small></div>
          </div>
        </div>
      </div>
    </>
  )
}



