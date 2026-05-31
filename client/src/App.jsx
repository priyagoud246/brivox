import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login        from './pages/Login'
import Directory    from './pages/Directory'
import AuthCallback from './pages/AuthCallback'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      display:'flex', height:'100vh',
      alignItems:'center', justifyContent:'center',
      fontFamily:'DM Sans, sans-serif', color:'#8891a8',
      flexDirection:'column', gap:'1rem'
    }}>
      <div style={{
        width:'40px', height:'40px',
        border:'3px solid #e2e6ef',
        borderTopColor:'#1a56db',
        borderRadius:'50%',
        animation:'spin .8s linear infinite'
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p>Loading BRIVOX...</p>
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