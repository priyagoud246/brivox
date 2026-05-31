import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  const avatarInitials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid #e2e6ef;
          padding: 0 5vw;
          display: flex; align-items: center;
          justify-content: space-between;
          height: 68px;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700;
          letter-spacing: -.5px; color: #0f1117;
          display: flex; align-items: center; gap: 7px;
          text-decoration: none;
        }
        .nav-logo-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #c9a84c; display: inline-block;
          margin-bottom: 1px;
        }
        .nav-right {
          display: flex; align-items: center; gap: 14px;
          position: relative;
        }
        .nav-user-name {
          font-size: .87rem; font-weight: 600; color: #0f1117;
          max-width: 140px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }
        .nav-user-email {
          font-size: .72rem; color: #8891a8;
          max-width: 140px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }
        .nav-avatar-wrap {
          position: relative; cursor: pointer;
        }
        .nav-avatar-img {
          width: 40px; height: 40px; border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid #e2e6ef;
          display: block;
          transition: border-color .2s;
        }
        .nav-avatar-img:hover { border-color: #1a56db; }
        .nav-avatar-fallback {
          width: 40px; height: 40px; border-radius: 50%;
          background: #1a56db; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: .84rem; font-weight: 700;
          border: 2.5px solid #e2e6ef;
          cursor: pointer;
          transition: border-color .2s;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-avatar-fallback:hover { border-color: #1a56db; }
        .nav-signout {
          display: flex; align-items: center; gap: 6px;
          padding: .42rem 1rem;
          background: #fff; color: #3d4455;
          border: 1.5px solid #e2e6ef;
          border-radius: 8px;
          font-family: inherit; font-size: .84rem; font-weight: 600;
          cursor: pointer;
          transition: all .2s;
          white-space: nowrap;
        }
        .nav-signout:hover {
          background: #fff5f5; color: #dc2626;
          border-color: #fecdd3;
        }
        .provider-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: .7rem; color: #16a34a; font-weight: 600;
          background: #f0fdf4; border-radius: 6px;
          padding: .15rem .5rem;
        }
        .provider-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #16a34a; display: inline-block;
        }
        @media(max-width: 600px) {
          .nav-user-info { display: none; }
          .nav-signout span { display: none; }
        }
      `}</style>

      <nav className="navbar">
        {/* Logo */}
        <div className="nav-logo">
          BRIVOX <span className="nav-logo-dot"></span>
        </div>

        {/* Right side */}
        {user && (
          <div className="nav-right">

            {/* Name + email + badge */}
            <div className="nav-user-info" style={{textAlign:'right'}}>
              <div className="nav-user-name">{user.name}</div>
              <div className="nav-user-email">{user.email}</div>
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:'2px'}}>
                <span className="provider-badge">
                  <span className="provider-dot"></span>
                  {user.provider === 'google' ? 'Google' : 'Verified'}
                </span>
              </div>
            </div>

            {/* Avatar */}
            {!imgError && user.avatar
              ? <img
                  src={user.avatar}
                  alt={user.name}
                  className="nav-avatar-img"
                  onError={() => setImgError(true)}
                />
              : <div className="nav-avatar-fallback">{avatarInitials}</div>
            }

            {/* Sign Out button — always visible */}
            <button className="nav-signout" onClick={logout}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>
    </>
  )
}