import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Index from './pages/Index.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import Bienvenida from './pages/Bienvenida.jsx'
import Admin from './pages/Admin.jsx'

function ProtectedRoute({ children, requireAdmin = false }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return <Navigate to="/login" />
  if (requireAdmin && user.rol !== 'admin') return <Navigate to="/bienvenida" />
  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/bienvenida" element={<ProtectedRoute><Bienvenida /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
