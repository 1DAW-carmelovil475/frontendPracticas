import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_bienvenida.css'

function Bienvenida() {
  const [section, setSection] = useState('buscar')
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [prefs, setPrefs] = useState({ vegano: false, vegetariano: false, sinGluten: false, sinLactosa: false })
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u) { navigate('/login'); return }
    setUser(u)
    setFavorites(JSON.parse(localStorage.getItem(`favorites_${u.id}`) || '[]'))
    const p = JSON.parse(localStorage.getItem(`preferences_${u.id}`) || 'null')
    if (p) setPrefs(p)
  }, [navigate])

  useEffect(() => {
    if (section === 'buscar' && !mapInstance.current) {
      const tryInit = () => {
        if (mapRef.current && window.L) {
          const map = window.L.map(mapRef.current).setView([40.4168, -3.7038], 13)
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map)
          mapInstance.current = map
        } else {
          setTimeout(tryInit, 200)
        }
      }
      tryInit()
    }
  }, [section])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const savePrefs = () => {
    if (user) localStorage.setItem(`preferences_${user.id}`, JSON.stringify(prefs))
    alert('Preferencias guardadas')
  }

  const navLinks = [
    { id: 'buscar', label: 'Restaurantes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
    { id: 'favoritos', label: 'Favoritos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
    { id: 'comparativas', label: 'Comparativas', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { id: 'analisis', label: 'Análisis', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { id: 'historial', label: 'Historial', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { id: 'perfil', label: 'Perfil', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'configuracion', label: 'Ajustes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m-9-9h6m6 0h6"/></svg> },
  ]

  return (
    <div className="dashboard-page">
      <header className="top-header">
        <div className="header-left">
          <Link to="/" className="logo"><Logo /></Link>
        </div>
        <nav className="top-nav">
          {navLinks.map(l => (
            <a key={l.id} href="#" className={`nav-link${section === l.id ? ' active' : ''}`}
              onClick={e => { e.preventDefault(); setSection(l.id) }}>
              {l.icon}<span>{l.label}</span>
            </a>
          ))}
        </nav>
        <div className="header-right">
          {user?.rol === 'admin' && <Link to="/admin" className="admin-panel-btn">PANEL ADMIN</Link>}
          <span className="user-name">{user?.nombre || 'Usuario'}</span>
          <div className="user-avatar">{(user?.nombre || 'U')[0].toUpperCase()}</div>
          <button className="btn-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <aside className="sidebar visible">
        <div className="search-panel">
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Buscar restaurantes..." />
            </div>
            <button className="btn-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </div>
          <div className="filters-section">
            <select className="filter-select"><option>Categoría</option><option>Italiana</option><option>Mexicana</option><option>Asiática</option><option>Española</option><option>Saludable</option></select>
            <select className="filter-select"><option>Precio</option><option>€ - Económico</option><option>€€ - Moderado</option><option>€€€ - Alto</option></select>
            <select className="filter-select"><option>Distancia</option><option>Menos de 1 km</option><option>Menos de 5 km</option><option>Menos de 10 km</option></select>
          </div>
          <button className="btn-compare">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Comparar Restaurantes
          </button>
        </div>
        <div className="results-list">
          <h3>Resultados cercanos</h3>
          <div className="restaurant-list">
            <p className="no-results">Realiza una búsqueda para ver restaurantes</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {/* MAPA */}
        <section className={`content-section map-view${section === 'buscar' ? ' active' : ''}`}>
          <div className="map-container">
            <div id="map" ref={mapRef}></div>
          </div>
        </section>

        {/* FAVORITOS */}
        <section className={`content-section${section === 'favoritos' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Mis Favoritos</h1><p>Restaurantes que has guardado</p></div></div>
          <div className="results-grid">
            {favorites.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <h3>No tienes favoritos aún</h3><p>Guarda restaurantes para acceder rápidamente a ellos</p>
              </div>
            ) : favorites.map((f, i) => <div key={i}>{f.name}</div>)}
          </div>
        </section>

        {/* COMPARATIVAS */}
        <section className={`content-section${section === 'comparativas' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Comparativas</h1><p>Compara calidad/precio entre restaurantes</p></div><button className="btn-primary">Nueva Comparativa</button></div>
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <h3>Comienza a comparar restaurantes</h3><p>Selecciona restaurantes para analizar su relación calidad/precio</p>
          </div>
        </section>

        {/* ANÁLISIS */}
        <section className={`content-section${section === 'analisis' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Análisis de Menús</h1><p>Análisis nutricional y detección de alérgenos</p></div><button className="btn-primary">Analizar Nuevo Menú</button></div>
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h3>Analiza menús con IA</h3><p>Sube una foto del menú para obtener información nutricional y alérgenos</p>
          </div>
        </section>

        {/* HISTORIAL */}
        <section className={`content-section${section === 'historial' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Historial</h1><p>Tus búsquedas y análisis recientes</p></div></div>
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3>Sin historial aún</h3><p>Aquí aparecerán tus búsquedas y análisis recientes</p>
          </div>
        </section>

        {/* PERFIL */}
        <section className={`content-section${section === 'perfil' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Mi Perfil</h1><p>Gestiona tu información y preferencias</p></div></div>
          <div className="profile-container">
            <div className="profile-card">
              <h3>Información Personal</h3>
              <div className="profile-info">
                <div className="info-row"><label>Nombre</label><span>{user?.nombre || '-'}</span></div>
                <div className="info-row"><label>Email</label><span>{user?.email || '-'}</span></div>
                <div className="info-row"><label>Rol</label><span>{user?.rol || '-'}</span></div>
              </div>
            </div>
            <div className="profile-card">
              <h3>Preferencias Alimentarias</h3>
              <div className="preferences-grid">
                {[['vegano','Vegano'],['vegetariano','Vegetariano'],['sinGluten','Sin Gluten'],['sinLactosa','Sin Lactosa']].map(([k,label]) => (
                  <label key={k} className="checkbox-label">
                    <input type="checkbox" checked={prefs[k]} onChange={e => setPrefs(p => ({ ...p, [k]: e.target.checked }))} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <button className="btn-primary" onClick={savePrefs}>Guardar Preferencias</button>
            </div>
          </div>
        </section>

        {/* CONFIGURACIÓN */}
        <section className={`content-section${section === 'configuracion' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Configuración</h1><p>Ajusta las opciones de la plataforma</p></div></div>
          <div className="profile-container">
            <div className="profile-card">
              <h3>Notificaciones</h3>
              <div className="preferences-grid">
                <label className="checkbox-label"><input type="checkbox" defaultChecked /><span>Nuevos restaurantes cerca</span></label>
                <label className="checkbox-label"><input type="checkbox" defaultChecked /><span>Ofertas y promociones</span></label>
                <label className="checkbox-label"><input type="checkbox" /><span>Recordatorios semanales</span></label>
              </div>
            </div>
            <div className="profile-card">
              <h3>Privacidad</h3>
              <div className="preferences-grid">
                <label className="checkbox-label"><input type="checkbox" defaultChecked /><span>Permitir geolocalización</span></label>
                <label className="checkbox-label"><input type="checkbox" defaultChecked /><span>Guardar historial de búsquedas</span></label>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Bienvenida
