import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login        from './pages/Login'
import Directory    from './pages/Directory'
import AuthCallback from './pages/AuthCallback'

function Protected({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      display: 'flex', height: '100vh',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '1rem',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: '1.5rem', fontWeight: 700, color: '#0f1117',
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
        BRIVOX
        <span style={{ width:7, height:7, borderRadius:'50%', background:'#c9a84c', display:'inline-block' }}/>
      </div>
      <div style={{
        width: 28, height: 28,
        border: '2px solid #e2e6ef',
        borderTopColor: '#1a56db',
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"         element={<Login />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/directory"     element={<Protected><Directory /></Protected>} />
          <Route path="*"              element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}