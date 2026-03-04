import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_admin.css'

const DEFAULT_LAT = 37.3886
const DEFAULT_LNG = -5.9823
const DEFAULT_ZOOM = 13

function Admin() {
  const [section, setSection] = useState('dashboard')
  const [adminUser, setAdminUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [actividad, setActividad] = useState([])
  const [modalUser, setModalUser] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [userForm, setUserForm] = useState({ nombre: '', email: '', rol: 'usuario', password: '' })

  // Mapa restaurantes
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [mapSection, setMapSection] = useState('mapa') // 'mapa' | 'comparativas'
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u || u.rol !== 'admin') { navigate('/bienvenida'); return }
    setAdminUser(u)
    loadStats()
    loadUsuarios()
    loadActividad()
  }, [navigate])

  // Inicializar mapa cuando se entra en la sección restaurantes
  useEffect(() => {
    if (section === 'restaurantes' && !mapInstance.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)
      mapInstance.current = map

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            map.setView([coords.latitude, coords.longitude], DEFAULT_ZOOM)
            L.marker([coords.latitude, coords.longitude]).addTo(map).bindPopup('📍 Tu ubicación').openPopup()
          },
          () => console.log('Geolocalización denegada, usando Sevilla')
        )
      }
    }
  }, [section])

  const loadStats = async () => {
    try {
      const res = await fetch('/admin/estadisticas', { headers })
      if (res.ok) setStats(await res.json())
    } catch {}
  }

  const loadUsuarios = async () => {
    try {
      const res = await fetch('/admin/usuarios', { headers })
      if (res.ok) setUsuarios(await res.json())
    } catch {}
  }

  const loadActividad = async () => {
    try {
      const res = await fetch('/admin/actividad', { headers })
      if (res.ok) setActividad(await res.json())
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    const url = editUser ? `/admin/usuarios/${editUser.id}` : '/admin/usuarios'
    try {
      const res = await fetch(url, { method: editUser ? 'PUT' : 'POST', headers, body: JSON.stringify(userForm) })
      if (res.ok) { setModalUser(false); loadUsuarios(); loadStats() }
    } catch {}
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return
    try {
      await fetch(`/admin/usuarios/${id}`, { method: 'DELETE', headers })
      loadUsuarios(); loadStats()
    } catch {}
  }

  const openNewUser = () => {
    setEditUser(null)
    setUserForm({ nombre: '', email: '', rol: 'usuario', password: '' })
    setModalUser(true)
  }

  const openEditUser = (u) => {
    setEditUser(u)
    setUserForm({ nombre: u.nombre || '', email: u.email || '', rol: u.rol || 'usuario', password: '' })
    setModalUser(true)
  }

  // ── Búsqueda mapa ─────────────────────────────────────────────────────────
  const clearMarkers = () => {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
  }

  const paintResults = (places) => {
    setSearchResults(places)
    const map = mapInstance.current
    if (!map || places.length === 0) return
    places.forEach((place, i) => {
      const popup = `<b>${place.name}</b><br/>${place.address}${place.phone ? `<br/>📞 ${place.phone}` : ''}${place.opening_hours ? `<br/>🕐 ${place.opening_hours}` : ''}`
      const marker = L.marker([place.lat, place.lon]).addTo(map).bindPopup(popup)
      if (i === 0) marker.openPopup()
      markersRef.current.push(marker)
    })
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lon], 16)
    } else {
      map.fitBounds(L.latLngBounds(places.map(p => [p.lat, p.lon])), { padding: [50, 50] })
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchResults([])
    clearMarkers()

    const map = mapInstance.current
    const center = map ? map.getCenter() : { lat: DEFAULT_LAT, lng: DEFAULT_LNG }

    // Intento 1: Overpass API
    try {
      const r = 15000
      const q = `[out:json][timeout:20];(node["name"~"${searchQuery}",i]["amenity"~"restaurant|fast_food|cafe|bar|pub"](around:${r},${center.lat},${center.lng});way["name"~"${searchQuery}",i]["amenity"~"restaurant|fast_food|cafe|bar|pub"](around:${r},${center.lat},${center.lng}););out center;`
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 8000)
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q, signal: controller.signal })
      clearTimeout(t)
      const data = await res.json()
      const places = (data.elements || []).map(el => ({
        id: el.id,
        lat: el.lat ?? el.center?.lat,
        lon: el.lon ?? el.center?.lon,
        name: el.tags?.name || searchQuery,
        address: [el.tags?.['addr:street'], el.tags?.['addr:housenumber'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'Sin dirección',
        phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
        opening_hours: el.tags?.opening_hours || null,
      })).filter(p => p.lat && p.lon)

      if (places.length > 0) { paintResults(places); setSearching(false); return }
    } catch (err) {
      console.warn('Overpass falló, usando Nominatim:', err.message)
    }

    // Fallback: Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=20&addressdetails=1&countrycodes=es&lat=${center.lat}&lon=${center.lng}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      const data = await res.json()
      const places = data.map(p => ({
        id: p.place_id, lat: parseFloat(p.lat), lon: parseFloat(p.lon),
        name: p.display_name.split(',')[0],
        address: p.display_name.split(',').slice(1, 3).join(',').trim(),
        phone: null, opening_hours: null,
      }))
      paintResults(places)
    } catch (err) {
      console.error('Error en Nominatim:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleResultClick = (place, index) => {
    if (!place.lat) return
    const map = mapInstance.current
    if (!map) return
    map.setView([place.lat, place.lon], 17)
    if (markersRef.current[index]) markersRef.current[index].openPopup()
  }

  const toggleCompare = (place) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === place.id)
      if (exists) return prev.filter(p => p.id !== place.id)
      if (prev.length >= 3) return prev
      return [...prev, place]
    })
  }

  const isInCompare = (place) => compareList.some(p => p.id === place.id)

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { id: 'usuarios', label: 'Usuarios', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'restaurantes', label: 'Restaurantes', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/></svg> },
    { id: 'historial', label: 'Historial', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { id: 'analisis', label: 'Análisis', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { id: 'actividad', label: 'Actividad', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { id: 'configuracion', label: 'Configuración', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/><path d="M1 12h6m6 0h6"/></svg> },
  ]

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-left">
          <Link to="/" className="logo"><Logo /></Link>
        </div>
        <div className="header-right">
          <span className="admin-name">{adminUser?.nombre || 'Administrador'}</span>
          <div className="admin-avatar">{(adminUser?.nombre || 'A')[0].toUpperCase()}</div>
          <button className="btn-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Salir
          </button>
        </div>
      </header>

      <aside className="admin-sidebar">
        <nav className="sidebar-nav">
          {sidebarLinks.map(l => (
            <a key={l.id} href="#" className={`sidebar-link${section === l.id ? ' active' : ''}`}
              onClick={e => { e.preventDefault(); setSection(l.id) }}>
              {l.icon}<span>{l.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <main className={`admin-main${section === 'restaurantes' ? ' with-map' : ''}`}>

        {/* DASHBOARD */}
        <section className={`admin-section${section === 'dashboard' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Dashboard</h1><p>Vista general del sistema</p></div></div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <div className="stat-info"><h3>{stats ? stats.totalUsuarios : '—'}</h3><p>Usuarios Totales</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon admin-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              <div className="stat-info"><h3>{stats ? stats.admins : '—'}</h3><p>Administradores</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon active"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
              <div className="stat-info"><h3>{stats ? stats.usuariosNormales : '—'}</h3><p>Usuarios Normales</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon restaurants"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/></svg></div>
              <div className="stat-info"><h3>{stats ? stats.totalRestaurantes : '—'}</h3><p>Restaurantes</p></div>
            </div>
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Usuarios Recientes</h3>
              <div className="recent-list">
                {usuarios.length === 0
                  ? <p className="loading">Sin usuarios aún</p>
                  : usuarios.slice(0, 5).map((u, i) => (
                    <div key={i} className="recent-item">
                      <div className="recent-avatar">{(u.nombre || 'U')[0].toUpperCase()}</div>
                      <div className="recent-info">
                        <h4>{u.nombre || 'Sin nombre'}</h4>
                        <p><span className={`badge ${u.rol}`}>{u.rol}</span></p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="dashboard-card">
              <h3>Actividad Reciente</h3>
              <div className="activity-list">
                {actividad.length === 0
                  ? <p className="loading">Sin actividad registrada</p>
                  : actividad.slice(0, 5).map((a, i) => (
                    <div key={i} className="activity-item">
                      <div>{a.accion}</div>
                      <div className="activity-time">{new Date(a.fecha).toLocaleString('es-ES')}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </section>

        {/* USUARIOS */}
        <section className={`admin-section${section === 'usuarios' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Gestión de Usuarios</h1><p>Administra los usuarios del sistema</p></div>
            <button className="btn-primary" onClick={openNewUser}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuevo Usuario
            </button>
          </div>
          <div className="table-container">
            <table className="admin-table">
              <thead><tr><th>Nombre</th><th>Rol</th><th>Fecha Registro</th><th>Acciones</th></tr></thead>
              <tbody>
                {usuarios.length === 0
                  ? <tr><td colSpan="4" className="loading-row">Sin usuarios registrados</td></tr>
                  : usuarios.map(u => (
                    <tr key={u.id}>
                      <td>{u.nombre || '—'}</td>
                      <td><span className={`badge ${u.rol}`}>{u.rol}</span></td>
                      <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}</td>
                      <td>
                        <button className="btn-action edit" onClick={() => openEditUser(u)}>✏️</button>
                        <button className="btn-action delete" onClick={() => handleDeleteUser(u.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>

        {/* RESTAURANTES con mapa */}
        <section className={`admin-section admin-map-section${section === 'restaurantes' ? ' active' : ''}`}>
          <div className="admin-map-layout">
            <aside className="map-sidebar">
              <div className="map-sidebar-tabs">
                <button className={`map-tab${mapSection === 'mapa' ? ' active' : ''}`} onClick={() => setMapSection('mapa')}>Mapa</button>
                <button className={`map-tab${mapSection === 'comparativas' ? ' active' : ''}`} onClick={() => setMapSection('comparativas')}>
                  Comparar {compareList.length > 0 && <span className="compare-badge-admin">{compareList.length}</span>}
                </button>
              </div>
              <br></br>
              {mapSection === 'mapa' && (
                <>
                  <div className="search-panel">
                    <div className="search-bar-container">
                      <div className="search-input-wrapper">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input type="text" placeholder="Buscar restaurantes..." value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                      </div>
                      <button className="btn-search" onClick={handleSearch} disabled={searching}>
                        {searching
                          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin"><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        }
                      </button>
                    </div>
                    <div className="filters-section">
                      <select className="filter-select"><option>Categoría</option><option>Italiana</option><option>Mexicana</option><option>Asiática</option><option>Española</option><option>Saludable</option></select>
                      <select className="filter-select"><option>Precio</option><option>€ - Económico</option><option>€€ - Moderado</option><option>€€€ - Alto</option></select>
                      <select className="filter-select"><option>Distancia</option><option>Menos de 1 km</option><option>Menos de 5 km</option><option>Menos de 10 km</option></select>
                    </div>
                    <button className="btn-compare" onClick={() => setMapSection('comparativas')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                      Comparar Restaurantes {compareList.length > 0 && `(${compareList.length})`}
                    </button>
                  </div>
                  <div className="results-list">
                    <h3>{searchResults.length > 0 ? `${searchResults.length} resultados` : 'Resultados'}</h3>
                    <div className="restaurant-list">
                      {searching && <p className="no-results">Buscando...</p>}
                      {!searching && searchResults.length === 0 && <p className="no-results">Realiza una búsqueda para ver restaurantes</p>}
                      {!searching && searchResults.map((place, i) => (
                        <div key={place.id || i} className={`restaurant-item${isInCompare(place) ? ' in-compare' : ''}`}
                          onClick={() => handleResultClick(place, i)}>
                          <div className="restaurant-icon">🍽️</div>
                          <div className="restaurant-info">
                            <h4>{place.name}</h4>
                            <p>{place.address}</p>
                          </div>
                          <button className={`btn-add-compare${isInCompare(place) ? ' active' : ''}`}
                            onClick={e => { e.stopPropagation(); toggleCompare(place) }}
                            title={isInCompare(place) ? 'Quitar' : 'Añadir a comparativa'}>
                            {isInCompare(place) ? '✓' : '+'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {mapSection === 'comparativas' && (
                <div className="compare-panel">
                  <div className="compare-panel-header">
                    <h3>Comparativa</h3>
                    {compareList.length > 0 && <button className="btn-clear" onClick={() => setCompareList([])}>Limpiar</button>}
                  </div>
                  {compareList.length === 0 ? (
                    <div className="compare-empty">
                      <p>Pulsa <strong>+</strong> en los resultados del mapa para añadir restaurantes</p>
                      <button className="btn-back-map" onClick={() => setMapSection('mapa')}>← Volver al mapa</button>
                    </div>
                  ) : (
                    <>
                      {compareList.length < 2 && <p className="compare-hint-small">Añade al menos un restaurante más</p>}
                      <div className="compare-list-admin">
                        {compareList.map((place, i) => (
                          <div key={i} className="compare-card-admin">
                            <div className="compare-card-admin-header">
                              <span>{place.name}</span>
                              <button onClick={() => toggleCompare(place)}>✕</button>
                            </div>
                            <div className="compare-detail"><span>📍</span><span>{place.address || '—'}</span></div>
                            <div className="compare-detail"><span>📞</span><span>{place.phone || '—'}</span></div>
                            <div className="compare-detail"><span>🕐</span><span>{place.opening_hours || '—'}</span></div>
                            <div className="compare-detail"><span>🍴</span><span>{place.cuisine ? place.cuisine.replace(/_/g, ' ') : '—'}</span></div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </aside>
            <div className="admin-map-container">
              <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
            </div>
          </div>
        </section>

        {/* HISTORIAL */}
        <section className={`admin-section${section === 'historial' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Historial de Búsquedas</h1><p>Búsquedas realizadas por los usuarios</p></div></div>
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3>Sin historial aún</h3>
            <p>Aquí aparecerán las búsquedas de los usuarios cuando se implemente el registro</p>
          </div>
        </section>

        {/* ANÁLISIS */}
        <section className={`admin-section${section === 'analisis' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Análisis de Menús</h1><p>Análisis realizados por los usuarios</p></div></div>
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h3>Sin análisis aún</h3>
            <p>Aquí aparecerán los análisis de menús cuando los usuarios los realicen</p>
          </div>
        </section>

        {/* ACTIVIDAD */}
        <section className={`admin-section${section === 'actividad' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Registro de Actividad</h1><p>Monitorea las acciones del sistema</p></div></div>
          <div className="table-container">
            <table className="admin-table">
              <thead><tr><th>Fecha/Hora</th><th>Usuario</th><th>Acción</th><th>Detalles</th></tr></thead>
              <tbody>
                {actividad.length === 0
                  ? <tr><td colSpan="4" className="loading-row">Sin actividad registrada</td></tr>
                  : actividad.map((a, i) => (
                    <tr key={i}>
                      <td>{new Date(a.fecha).toLocaleString('es-ES')}</td>
                      <td>{a.usuario || '—'}</td>
                      <td>{a.accion || '—'}</td>
                      <td>{a.detalles || '—'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>

        {/* CONFIGURACIÓN */}
        <section className={`admin-section${section === 'configuracion' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Configuración del Sistema</h1><p>Ajustes generales de la plataforma</p></div></div>
          <div className="config-grid">
            <div className="config-card">
              <h3>Configuración General</h3>
              <div className="form-group"><label>Nombre del Sistema</label><input type="text" defaultValue="MenuSense" /></div>
              <div className="form-group"><label>Email de Contacto</label><input type="email" defaultValue="desarrollo1@holainformatica.com" /></div>
              <div className="form-group"><label>Modo de Mantenimiento</label><label className="switch"><input type="checkbox" /><span className="slider"></span></label></div>
              <button className="btn-primary">Guardar Cambios</button>
            </div>
            <div className="config-card">
              <h3>Seguridad</h3>
              <div className="form-group"><label>Requerir verificación de email</label><label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label></div>
              <div className="form-group"><label>Tiempo de sesión (minutos)</label><input type="number" defaultValue="60" /></div>
              <div className="form-group"><label>Intentos máximos de login</label><input type="number" defaultValue="5" /></div>
              <button className="btn-primary">Guardar Cambios</button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL USUARIO */}
      {modalUser && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={() => setModalUser(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveUser} style={{ padding: '1.5rem' }}>
              <div className="form-group"><label>Nombre</label><input type="text" value={userForm.nombre} onChange={e => setUserForm(f => ({...f, nombre: e.target.value}))} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={userForm.email} onChange={e => setUserForm(f => ({...f, email: e.target.value}))} required /></div>
              <div className="form-group">
                <label>Rol</label>
                <select value={userForm.rol} onChange={e => setUserForm(f => ({...f, rol: e.target.value}))}>
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" value={userForm.password} onChange={e => setUserForm(f => ({...f, password: e.target.value}))} minLength="6" />
                {editUser && <small>Dejar en blanco para mantener la actual</small>}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalUser(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin