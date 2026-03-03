import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_registro.css'

function Registro() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaId, setCaptchaId] = useState(null)
  const [captchaImage, setCaptchaImage] = useState('')
  const [message, setMessage] = useState({ text: '', color: 'red' })
  const [showVerify, setShowVerify] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [pending, setPending] = useState(null)
  const navigate = useNavigate()

  const cargarCaptcha = async () => {
    try {
      const res = await fetch('/captcha')
      const data = await res.json()
      setCaptchaId(data.captchaId)
      setCaptchaImage(data.image.replace('<svg ', '<svg style="width:100%;height:100px;" '))
    } catch {
      setMessage({ text: 'No se pudo cargar el captcha', color: 'red' })
    }
  }

  useEffect(() => { cargarCaptcha() }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage({ text: '', color: 'red' })
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, email, password, rol: 'usuario', captchaId, captcha: captchaInput })
      })
      const data = await res.json()
      if (res.ok && data.requiresVerification) {
        setShowVerify(true)
        setMessage({ text: data.message, color: 'rgba(34,197,94,0.95)' })
        setPending({ nombre: name, email, password, rol: 'usuario' })
      } else {
        setMessage({ text: data.error?.message || JSON.stringify(data.error), color: 'red' })
        cargarCaptcha()
        setCaptchaInput('')
      }
    } catch (err) {
      setMessage({ text: err.message, color: 'red' })
      cargarCaptcha()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!pending) return
    try {
      const res = await fetch('/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pending.email, code: verificationCode, password: pending.password, nombre: pending.nombre, rol: pending.rol })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ text: 'Registro exitoso. Ahora puedes iniciar sesión.', color: 'rgba(34,197,94,0.95)' })
        setShowVerify(false)
        setPending(null)
        setVerificationCode('')
        cargarCaptcha()
      } else {
        setMessage({ text: data.error, color: 'red' })
      }
    } catch (err) {
      setMessage({ text: err.message, color: 'red' })
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
          <h2>Crear cuenta</h2>
          <p className="login-subtitle">Regístrate para guardar favoritos y recibir recomendaciones.</p>

          {!showVerify && (
            <form className="login-form" onSubmit={handleRegister}>
              <label>Nombre</label>
              <input type="text" required placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} />
              <label>Email</label>
              <input type="email" required placeholder="ejemplo@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              <label>Contraseña</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              <label>Verificación</label>
              <div id="captcha-container" dangerouslySetInnerHTML={{ __html: captchaImage }} />
              <input type="text" required placeholder="Escribe el texto de la imagen"
                value={captchaInput} onChange={e => setCaptchaInput(e.target.value)}
                style={{ padding: '14px 16px', fontSize: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.20)', color: 'var(--text)', outline: 'none', width: '100%' }} />
              <button type="button" onClick={cargarCaptcha} className="recargar-btn">Recargar captcha</button>
              <button className="login-btn" type="submit">Registrarse</button>
            </form>
          )}

          {showVerify && (
            <form className="login-form" onSubmit={handleVerify}>
              <label>Código de verificación</label>
              <input type="text" required placeholder="Ingresa el código de 6 dígitos"
                value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
              <button className="login-btn" type="submit">Verificar</button>
              <button type="button" onClick={() => navigate('/')} className="recargar-btn">Cancelar</button>
            </form>
          )}

          {message.text && <div className="login-message" style={{ color: message.color }}>{message.text}</div>}
          <p className="login-subtitle" style={{ marginTop: '1.5rem' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'aqua' }}>Inicia sesión</Link>
          </p>
        </section>
      </main>
    </div>
  )
}

export default Registro
