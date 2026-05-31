import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Directory from './pages/Directory'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans,sans-serif',color:'#8891a8'}}>
      Loading BRIVOX...
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
          <Route path="/login" element={<Login />} />
          <Route path="/directory" element={<Protected><Directory /></Protected>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}