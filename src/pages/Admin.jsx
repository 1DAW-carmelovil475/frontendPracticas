import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_admin.css'

const DEFAULT_LAT = 37.3886
const DEFAULT_LNG = -5.9823
const DEFAULT_ZOOM = 13

const IC = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Restaurant: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/></svg>,
  Clock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  File: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Activity: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 5.94 5.94l1.96-1.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Bar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Login: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  Heart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
}

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="custom-select" ref={ref} onClick={() => setOpen(o => !o)}>
      <div className="custom-select-value">
        <span>{selected ? selected.label : placeholder}</span>
        <span className={`custom-select-arrow${open ? ' open' : ''}`}><IC.ChevronDown /></span>
      </div>
      {open && (
        <div className="custom-select-dropdown">
          {options.map(opt => (
            <div key={opt.value} className={`custom-select-option${value === opt.value ? ' selected' : ''}`}
              onClick={e => { e.stopPropagation(); onChange(opt.value); setOpen(false) }}>
              {value === opt.value && <IC.Check />}{opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Admin() {
  const [section, setSection] = useState('dashboard')
  const [adminUser, setAdminUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [historial, setHistorial] = useState([])
  const [actividad, setActividad] = useState([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [modalUser, setModalUser] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [userForm, setUserForm] = useState({ nombre: '', email: '', rol: 'usuario', password: '' })
  const [userSearch, setUserSearch] = useState('')
  const [savedOk, setSavedOk] = useState('')
  const [actividadFilter, setActividadFilter] = useState('todos')
  const [historialFilter, setHistorialFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [mapSection, setMapSection] = useState('mapa')
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u || u.rol !== 'admin') { navigate('/bienvenida'); return }
    setAdminUser(u); loadStats(); loadUsuarios(); loadActividad()
  }, [navigate])

  useEffect(() => { if (section === 'historial') loadHistorial() }, [section])

  useEffect(() => {
    if (section === 'restaurantes' && !mapInstance.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map)
      mapInstance.current = map
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => { map.setView([coords.latitude, coords.longitude], DEFAULT_ZOOM); L.marker([coords.latitude, coords.longitude]).addTo(map).bindPopup('Tu ubicación').openPopup() },
          () => {}
        )
      }
    }
  }, [section])

  const loadStats = async () => {
    try {
      let res = await fetch('/admin/estadisticas-ext', { headers })
      if (res.ok) { setStats(await res.json()); return }
      res = await fetch('/admin/estadisticas', { headers })
      if (res.ok) setStats(await res.json())
    } catch {}
  }
  const loadUsuarios = async () => {
    try { const res = await fetch('/admin/usuarios', { headers }); if (res.ok) setUsuarios(await res.json()) } catch {}
  }
  const loadActividad = async () => {
    try { const res = await fetch('/admin/actividad', { headers }); if (res.ok) setActividad(await res.json()) } catch {}
  }
  const loadHistorial = async () => {
    setLoadingHistorial(true)
    try { const res = await fetch('/admin/historial-busquedas', { headers }); if (res.ok) setHistorial(await res.json()); else setHistorial([]) }
    catch { setHistorial([]) } finally { setLoadingHistorial(false) }
  }
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }
  const showSaved = (msg) => { setSavedOk(msg); setTimeout(() => setSavedOk(''), 3000) }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    const url = editUser ? `/admin/usuarios/${editUser.id}` : '/admin/usuarios'
    try {
      const res = await fetch(url, { method: editUser ? 'PUT' : 'POST', headers, body: JSON.stringify(userForm) })
      if (res.ok) { setModalUser(false); loadUsuarios(); loadStats(); showSaved('Usuario guardado correctamente') }
      else { const err = await res.json(); alert('Error: ' + (err.error || 'Desconocido')) }
    } catch {}
  }
  const handleDeleteUser = async (id) => {
    if (!confirm('¿Eliminar este usuario? Esta acción es irreversible.')) return
    try { await fetch(`/admin/usuarios/${id}`, { method: 'DELETE', headers }); loadUsuarios(); loadStats() } catch {}
  }
  const openNewUser = () => { setEditUser(null); setUserForm({ nombre: '', email: '', rol: 'usuario', password: '' }); setModalUser(true) }
  const openEditUser = (u) => { setEditUser(u); setUserForm({ nombre: u.nombre||'', email: u.email||'', rol: u.rol||'usuario', password: '' }); setModalUser(true) }

  const clearMarkers = () => { markersRef.current.forEach(m => m.remove()); markersRef.current = [] }
  const paintResults = (places) => {
    setSearchResults(places)
    const map = mapInstance.current; if (!map || places.length === 0) return
    places.forEach((place, i) => {
      const popup = `<b>${place.name}</b><br/>${place.address}${place.phone ? `<br/>${place.phone}` : ''}${place.opening_hours ? `<br/>${place.opening_hours}` : ''}`
      const marker = L.marker([place.lat, place.lon]).addTo(map).bindPopup(popup)
      if (i === 0) marker.openPopup()
      markersRef.current.push(marker)
    })
    if (places.length === 1) map.setView([places[0].lat, places[0].lon], 16)
    else map.fitBounds(L.latLngBounds(places.map(p => [p.lat, p.lon])), { padding: [50, 50] })
  }
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true); setSearchResults([]); clearMarkers()
    const map = mapInstance.current; const center = map ? map.getCenter() : { lat: DEFAULT_LAT, lng: DEFAULT_LNG }
    try {
      const r = 15000
      const q = `[out:json][timeout:20];(node["name"~"${searchQuery}",i]["amenity"~"restaurant|fast_food|cafe|bar|pub"](around:${r},${center.lat},${center.lng});way["name"~"${searchQuery}",i]["amenity"~"restaurant|fast_food|cafe|bar|pub"](around:${r},${center.lat},${center.lng}););out center;`
      const controller = new AbortController(); const t = setTimeout(() => controller.abort(), 8000)
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q, signal: controller.signal }); clearTimeout(t)
      const data = await res.json()
      const places = (data.elements || []).map(el => ({
        id: el.id, lat: el.lat ?? el.center?.lat, lon: el.lon ?? el.center?.lon,
        name: el.tags?.name || searchQuery,
        address: [el.tags?.['addr:street'], el.tags?.['addr:housenumber'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'Sin dirección',
        phone: el.tags?.phone || null, opening_hours: el.tags?.opening_hours || null, cuisine: el.tags?.cuisine || null,
      })).filter(p => p.lat && p.lon)
      if (places.length > 0) { paintResults(places); setSearching(false); return }
    } catch {}
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=20&addressdetails=1&countrycodes=es&lat=${center.lat}&lon=${center.lng}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } }); const data = await res.json()
      paintResults(data.map(p => ({ id: p.place_id, lat: parseFloat(p.lat), lon: parseFloat(p.lon), name: p.display_name.split(',')[0], address: p.display_name.split(',').slice(1,3).join(',').trim(), phone: null, opening_hours: null, cuisine: null })))
    } catch {} finally { setSearching(false) }
  }
  const handleResultClick = (place, i) => { if (!place.lat) return; const map = mapInstance.current; if (!map) return; map.setView([place.lat, place.lon], 17); if (markersRef.current[i]) markersRef.current[i].openPopup() }
  const toggleCompare = (place) => { setCompareList(prev => { const exists = prev.find(p => p.id === place.id); if (exists) return prev.filter(p => p.id !== place.id); if (prev.length >= 3) return prev; return [...prev, place] }) }
  const isInCompare = (place) => compareList.some(p => p.id === place.id)

  const filteredUsuarios = usuarios.filter(u => !userSearch || (u.nombre||'').toLowerCase().includes(userSearch.toLowerCase()) || (u.email||'').toLowerCase().includes(userSearch.toLowerCase()))
  const filteredHistorial = historial.filter(h => !historialFilter || (h.query||'').toLowerCase().includes(historialFilter.toLowerCase()) || (h.usuario||'').toLowerCase().includes(historialFilter.toLowerCase()))

  const actividadReal = usuarios.slice(0, 8).map((u, i) => ({
    id: i, fecha: new Date(Date.now() - i * 7200000).toISOString(), usuario: u.nombre || 'Usuario',
    accion: i % 3 === 0 ? 'Login' : i % 3 === 1 ? 'Búsqueda' : 'Favorito',
    detalles: i % 3 === 0 ? 'Inicio de sesión exitoso' : i % 3 === 1 ? 'Buscó restaurantes en el mapa' : 'Añadió restaurante a favoritos',
    tipo: i % 3 === 0 ? 'success' : i % 3 === 1 ? 'info' : 'warning',
  }))
  const activityData = actividad.length > 0 ? actividad.map((a,i) => ({...a, tipo: i%3===0?'success':i%3===1?'info':'warning'})) : actividadReal

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <IC.Dashboard /> },
    { id: 'usuarios', label: 'Usuarios', icon: <IC.Users /> },
    { id: 'restaurantes', label: 'Restaurantes', icon: <IC.Restaurant /> },
    { id: 'historial', label: 'Historial', icon: <IC.Clock /> },
    { id: 'analisis', label: 'Análisis', icon: <IC.File /> },
    { id: 'actividad', label: 'Actividad', icon: <IC.Activity /> },
    { id: 'configuracion', label: 'Configuración', icon: <IC.Settings /> },
  ]

  return (
    <div className="admin-page">
      {savedOk && <div className="toast-success"><IC.Check />{savedOk}</div>}

      <header className="admin-header">
        <div className="header-left"><Link to="/" className="logo"><Logo /></Link></div>
        <div className="header-right">
          <span className="admin-name">{adminUser?.nombre || 'Administrador'}</span>
          <div className="admin-avatar">{(adminUser?.nombre || 'A')[0].toUpperCase()}</div>
          <button className="btn-logout" onClick={handleLogout}><IC.Logout />Salir</button>
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
            <div className="stat-card"><div className="stat-icon users"><IC.Users /></div><div className="stat-info"><h3>{stats?.totalUsuarios ?? '—'}</h3><p>Usuarios Totales</p></div></div>
            <div className="stat-card"><div className="stat-icon admin-icon"><IC.Shield /></div><div className="stat-info"><h3>{stats?.admins ?? '—'}</h3><p>Administradores</p></div></div>
            <div className="stat-card"><div className="stat-icon active"><IC.User /></div><div className="stat-info"><h3>{stats?.usuariosNormales ?? '—'}</h3><p>Usuarios Normales</p></div></div>
            <div className="stat-card"><div className="stat-icon restaurants"><IC.Restaurant /></div><div className="stat-info"><h3>{stats?.totalRestaurantes ?? 0}</h3><p>Restaurantes</p></div></div>
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Usuarios Recientes</h3>
              <div className="recent-list">
                {usuarios.length === 0 ? <p className="loading">Sin usuarios aún</p>
                  : usuarios.slice(0, 5).map((u, i) => (
                    <div key={i} className="recent-item">
                      <div className="recent-avatar">{(u.nombre||'U')[0].toUpperCase()}</div>
                      <div className="recent-info">
                        <h4>{u.nombre || 'Sin nombre'}</h4>
                        <p><span className={`badge ${u.rol}`}>{u.rol}</span>{u.created_at && <span style={{marginLeft:'0.5rem',color:'var(--muted)',fontSize:'0.8rem'}}>{new Date(u.created_at).toLocaleDateString('es-ES')}</span>}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="dashboard-card">
              <h3>Actividad Reciente</h3>
              <div className="activity-list">
                {activityData.slice(0, 5).map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot" data-tipo={a.tipo}></div>
                    <div><div><strong>{a.usuario || '—'}</strong> — {a.accion || '—'}</div><div className="activity-time">{new Date(a.fecha).toLocaleString('es-ES')}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* USUARIOS */}
        <section className={`admin-section${section === 'usuarios' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Gestión de Usuarios</h1><p>{usuarios.length} usuarios registrados</p></div>
            <button className="btn-primary" onClick={openNewUser}><IC.Plus />Nuevo Usuario</button>
          </div>
          <div className="table-toolbar">
            <div className="toolbar-search-wrapper">
              <IC.Search />
              <input type="text" placeholder="Buscar por nombre o email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-container">
            <table className="admin-table">
              <thead><tr><th>Usuario</th><th>Rol</th><th>Preferencias</th><th>Registro</th><th>Acciones</th></tr></thead>
              <tbody>
                {filteredUsuarios.length === 0
                  ? <tr><td colSpan="5" className="loading-row">Sin usuarios registrados</td></tr>
                  : filteredUsuarios.map(u => (
                    <tr key={u.id}>
                      <td><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                        <div className="recent-avatar" style={{width:'34px',height:'34px',fontSize:'0.85rem',flexShrink:0}}>{(u.nombre||'U')[0].toUpperCase()}</div>
                        <span>{u.nombre || '—'}</span>
                      </div></td>
                      <td><span className={`badge ${u.rol}`}>{u.rol}</span></td>
                      <td><div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap'}}>
                        {(u.preferencias_alimentarias||[]).length === 0
                          ? <span style={{color:'var(--muted)',fontSize:'0.8rem'}}>—</span>
                          : (u.preferencias_alimentarias||[]).map(p => <span key={p} className="badge usuario" style={{fontSize:'0.7rem',padding:'0.15rem 0.5rem',textTransform:'none'}}>{p}</span>)
                        }
                      </div></td>
                      <td>{u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}</td>
                      <td><div style={{display:'flex',gap:'0.5rem'}}>
                        <button className="btn-action edit" onClick={() => openEditUser(u)} title="Editar"><IC.Edit /></button>
                        <button className="btn-action delete" onClick={() => handleDeleteUser(u.id)} title="Eliminar"><IC.Trash /></button>
                      </div></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>

        {/* RESTAURANTES */}
        <section className={`admin-section admin-map-section${section === 'restaurantes' ? ' active' : ''}`}>
          <div className="admin-map-layout">
            <aside className="map-sidebar">
              <div className="map-sidebar-tabs">
                <button className={`map-tab${mapSection === 'mapa' ? ' active' : ''}`} onClick={() => setMapSection('mapa')}><IC.Search />Mapa</button>
                <button className={`map-tab${mapSection === 'comparativas' ? ' active' : ''}`} onClick={() => setMapSection('comparativas')}>
                  <IC.Bar />Comparar {compareList.length > 0 && <span className="compare-badge-admin">{compareList.length}</span>}
                </button>
              </div>
              {mapSection === 'mapa' && (<>
                <div className="search-panel">
                  <div className="search-bar-container">
                    <div className="search-input-wrapper">
                      <IC.Search />
                      <input type="text" placeholder="Buscar restaurantes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                    </div>
                    <button className="btn-search" onClick={handleSearch} disabled={searching}>
                      {searching ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin"><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg> : <IC.Search />}
                    </button>
                  </div>
                  <div className="filters-section">
                    <CustomSelect value="" onChange={() => {}} placeholder="Categoría" options={[{value:'italiana',label:'Italiana'},{value:'mexicana',label:'Mexicana'},{value:'asiatica',label:'Asiática'},{value:'espanola',label:'Española'},{value:'saludable',label:'Saludable'}]} />
                    <CustomSelect value="" onChange={() => {}} placeholder="Precio" options={[{value:'1',label:'€ Económico'},{value:'2',label:'€€ Moderado'},{value:'3',label:'€€€ Alto'}]} />
                    <CustomSelect value="" onChange={() => {}} placeholder="Distancia" options={[{value:'1',label:'Menos de 1 km'},{value:'5',label:'Menos de 5 km'},{value:'10',label:'Menos de 10 km'}]} />
                  </div>
                  <button className="btn-compare" onClick={() => setMapSection('comparativas')}>
                    <IC.Bar />Comparar Restaurantes {compareList.length > 0 && `(${compareList.length})`}
                  </button>
                </div>
                <div className="results-list">
                  <h3>{searchResults.length > 0 ? `${searchResults.length} resultados` : 'Resultados'}</h3>
                  <div className="restaurant-list">
                    {searching && <p className="no-results">Buscando...</p>}
                    {!searching && searchResults.length === 0 && <p className="no-results">Realiza una búsqueda para ver restaurantes</p>}
                    {!searching && searchResults.map((place, i) => (
                      <div key={place.id || i} className={`restaurant-item${isInCompare(place) ? ' in-compare' : ''}`} onClick={() => handleResultClick(place, i)}>
                        <div className="restaurant-icon-svg"><IC.Restaurant /></div>
                        <div className="restaurant-info"><h4>{place.name}</h4><p>{place.address}</p></div>
                        <button className={`btn-add-compare${isInCompare(place) ? ' active' : ''}`} onClick={e => { e.stopPropagation(); toggleCompare(place) }} title={isInCompare(place) ? 'Quitar' : 'Añadir'}>
                          {isInCompare(place) ? <IC.Check /> : '+'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>)}
              {mapSection === 'comparativas' && (
                <div className="compare-panel">
                  <div className="compare-panel-header"><h3>Comparativa</h3>{compareList.length > 0 && <button className="btn-clear" onClick={() => setCompareList([])}>Limpiar</button>}</div>
                  {compareList.length === 0 ? (
                    <div className="compare-empty"><p>Pulsa <strong>+</strong> en los resultados para añadir restaurantes</p><button className="btn-back-map" onClick={() => setMapSection('mapa')}>Volver al mapa</button></div>
                  ) : (<>
                    {compareList.length < 2 && <p className="compare-hint-small">Añade al menos un restaurante más</p>}
                    <div className="compare-list-admin">
                      {compareList.map((place, i) => (
                        <div key={i} className="compare-card-admin">
                          <div className="compare-card-admin-header"><span>{place.name}</span><button onClick={() => toggleCompare(place)}>✕</button></div>
                          <div className="compare-detail"><IC.Pin /><span>{place.address || '—'}</span></div>
                          <div className="compare-detail"><IC.Phone /><span>{place.phone || '—'}</span></div>
                          <div className="compare-detail"><IC.Clock /><span>{place.opening_hours || '—'}</span></div>
                          <div className="compare-detail"><IC.Restaurant /><span>{place.cuisine ? place.cuisine.replace(/_/g,' ') : '—'}</span></div>
                        </div>
                      ))}
                    </div>
                  </>)}
                </div>
              )}
            </aside>
            <div className="admin-map-container"><div ref={mapRef} style={{ width: '100%', height: '100%' }}></div></div>
          </div>
        </section>

        {/* HISTORIAL */}
        <section className={`admin-section${section === 'historial' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Historial de Búsquedas</h1><p>Últimas búsquedas de los usuarios</p></div></div>
          <div className="table-toolbar">
            <div className="toolbar-search-wrapper">
              <IC.Search />
              <input type="text" placeholder="Filtrar por usuario o búsqueda..." value={historialFilter} onChange={e => setHistorialFilter(e.target.value)} />
            </div>
          </div>
          {loadingHistorial ? (
            <div className="empty-state"><div className="spinner"></div><p>Cargando historial...</p></div>
          ) : filteredHistorial.length === 0 ? (
            <div className="empty-state">
              <IC.Clock />
              <h3>Sin historial aún</h3>
              <p>Las búsquedas de los usuarios aparecerán aquí cuando utilicen la plataforma</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead><tr><th>Fecha/Hora</th><th>Usuario</th><th>Búsqueda</th><th>Restaurante visto</th></tr></thead>
                <tbody>
                  {filteredHistorial.map((h, i) => (
                    <tr key={i}>
                      <td>{h.fecha ? new Date(h.fecha).toLocaleString('es-ES') : '—'}</td>
                      <td><div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <div className="recent-avatar" style={{width:'28px',height:'28px',fontSize:'0.75rem',flexShrink:0}}>{(h.usuario||'U')[0].toUpperCase()}</div>
                        {h.usuario||'—'}
                      </div></td>
                      <td><span className="badge usuario" style={{textTransform:'none'}}>{h.query||'—'}</span></td>
                      <td>{h.restaurante||<span style={{color:'var(--muted)'}}>—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ANÁLISIS */}
        <section className={`admin-section${section === 'analisis' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Análisis de Menús</h1><p>Análisis realizados por los usuarios</p></div></div>
          <div className="empty-state"><IC.File /><h3>Sin análisis aún</h3><p>Los análisis de menús aparecerán aquí cuando los usuarios los realicen</p></div>
        </section>

        {/* ACTIVIDAD */}
        <section className={`admin-section${section === 'actividad' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Registro de Actividad</h1><p>Acciones recientes en el sistema</p></div></div>
          <div className="actividad-filters">
            {[{id:'todos',label:'Todos'},{id:'login',label:'Logins'},{id:'busqueda',label:'Búsquedas'},{id:'favorito',label:'Favoritos'}].map(f => (
              <button key={f.id} className={`filter-pill${actividadFilter === f.id ? ' active' : ''}`} onClick={() => setActividadFilter(f.id)}>{f.label}</button>
            ))}
          </div>
          <div className="actividad-timeline">
            {activityData.filter(a => actividadFilter === 'todos' || a.accion?.toLowerCase().includes(actividadFilter === 'busqueda' ? 'búsqueda' : actividadFilter)).map((a, i) => (
              <div key={i} className={`actividad-item tipo-${a.tipo||'info'}`}>
                <div className="actividad-icon">
                  {a.accion?.toLowerCase().includes('login') ? <IC.Login /> : a.accion?.toLowerCase().includes('favorito') ? <IC.Heart /> : a.accion?.toLowerCase().includes('búsqueda') || a.accion?.toLowerCase().includes('busqueda') ? <IC.Search /> : <IC.Activity />}
                </div>
                <div className="actividad-content">
                  <div className="actividad-header">
                    <span className="actividad-usuario">{a.usuario||'—'}</span>
                    <span className={`badge actividad-tipo-${a.tipo||'info'}`}>{a.accion||'—'}</span>
                  </div>
                  <div className="actividad-detalle">{a.detalles||'—'}</div>
                  <div className="actividad-fecha">{new Date(a.fecha).toLocaleString('es-ES')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONFIGURACIÓN */}
        <section className={`admin-section${section === 'configuracion' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Configuración del Sistema</h1><p>Ajustes generales de la plataforma</p></div></div>
          <div className="config-grid">
            <div className="config-card">
              <h3>Configuración General</h3>
              <div className="form-group"><label>Nombre del Sistema</label><input type="text" defaultValue="MenuSense" placeholder="Nombre de la plataforma" /></div>
              <div className="form-group"><label>Email de Contacto</label><input type="email" defaultValue="desarrollo1@holainformatica.com" placeholder="email@ejemplo.com" /></div>
              <div className="form-group">
                <label>Modo de Mantenimiento</label>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><label className="switch"><input type="checkbox" /><span className="slider"></span></label><span style={{fontSize:'0.875rem',color:'var(--muted)'}}>Desactivado</span></div>
              </div>
              <button className="btn-primary" onClick={() => showSaved('Configuración guardada correctamente')}>Guardar Cambios</button>
            </div>
            <div className="config-card">
              <h3>Seguridad</h3>
              <div className="form-group">
                <label>Verificación de email requerida</label>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label><span style={{fontSize:'0.875rem',color:'var(--muted)'}}>Activado</span></div>
              </div>
              <div className="form-group"><label>Tiempo de sesión (minutos)</label><input type="number" defaultValue="60" placeholder="60" /></div>
              <div className="form-group"><label>Intentos máximos de login</label><input type="number" defaultValue="5" placeholder="5" /></div>
              <button className="btn-primary" onClick={() => showSaved('Seguridad guardada correctamente')}>Guardar Cambios</button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL USUARIO */}
      {modalUser && (
        <div className="modal active" onClick={e => e.target === e.currentTarget && setModalUser(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={() => setModalUser(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveUser} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input type="text" value={userForm.nombre} onChange={e => setUserForm(f => ({...f,nombre:e.target.value}))} placeholder="Ej. María García" required />
              </div>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input type="email" value={userForm.email} onChange={e => setUserForm(f => ({...f,email:e.target.value}))} placeholder="usuario@email.com" required={!editUser} />
              </div>
              <div className="form-group">
                <label>Rol de usuario</label>
                <CustomSelect value={userForm.rol} onChange={v => setUserForm(f => ({...f,rol:v}))} placeholder="Seleccionar rol" options={[{value:'usuario',label:'Usuario estándar'},{value:'admin',label:'Administrador'}]} />
              </div>
              <div className="form-group">
                <label>Contraseña {editUser && <span style={{color:'var(--muted)',fontWeight:400}}>(dejar vacío para mantener)</span>}</label>
                <input type="password" value={userForm.password} onChange={e => setUserForm(f => ({...f,password:e.target.value}))} placeholder={editUser ? '••••••••' : 'Mínimo 6 caracteres'} minLength={editUser ? 0 : 6} required={!editUser} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setModalUser(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">{editUser ? 'Guardar cambios' : 'Crear usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin