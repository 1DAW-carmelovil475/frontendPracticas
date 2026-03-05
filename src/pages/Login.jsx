import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [welcome, setWelcome] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setWelcome('')
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setWelcome(`¡Bienvenido, ${data.user.nombre}!`)
        setTimeout(() => {
          navigate(data.user.rol === 'admin' ? '/admin' : '/bienvenida')
        }, 900)
      } else {
        setMessage(data.error?.message || data.error || 'Credenciales incorrectas')
      }
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="login-page">
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo"><Logo /></Link>
        </nav>
      </header>
      <main className="login-wrapper fade-in">
        <section className="login-card">
          <h2>Iniciar Sesión</h2>
          <p className="login-subtitle">Accede para guardar favoritos y recomendaciones.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" required placeholder="ejemplo@email.com"
              value={email} onChange={e => setEmail(e.target.value)} />
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" required placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
            <button className="login-btn" type="submit">Iniciar Sesión</button>
          </form>
          {message && <div className="login-message">{message}</div>}
          {welcome && <div className="login-welcome">{welcome}</div>}
          <p className="login-subtitle" style={{ marginTop: '1.5rem' }}>
            ¿No tienes cuenta? <Link to="/registro" style={{ color: 'aqua' }}>Regístrate aquí</Link>
          </p>
        </section>
      </main>
    </div>
  )
}

export default Login