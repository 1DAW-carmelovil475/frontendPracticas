import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_bienvenida.css'

const DEFAULT_LAT = 37.3886
const DEFAULT_LNG = -5.9823
const DEFAULT_ZOOM = 13

const IC = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Heart: ({ filled }) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Bar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  File: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Restaurant: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/></svg>,
  Pin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Lock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
}

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
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

function Bienvenida() {
  const [section, setSection] = useState('buscar')
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [historial, setHistorial] = useState([])
  const [prefs, setPrefs] = useState({ vegano: false, vegetariano: false, sinGluten: false, sinLactosa: false })
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [ajustes, setAjustes] = useState({
    notificaciones: { nuevosRestaurantes: true, ofertas: true, recordatorios: false },
    privacidad: { geolocalizacion: true, guardarHistorial: true },
  })
  const [savedOk, setSavedOk] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [compareList, setCompareList] = useState([])
  const [editingNombre, setEditingNombre] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [editingPassword, setEditingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [savingNombre, setSavingNombre] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u) { navigate('/login'); return }
    setUser(u)
    setNewNombre(u.nombre || '')
    // Cargar favoritos (localStorage como fallback)
    const localFavs = JSON.parse(localStorage.getItem(`favorites_${u.id}`) || '[]')
    setFavorites(localFavs)
    // Cargar historial
    const localHist = JSON.parse(localStorage.getItem(`historial_${u.id}`) || '[]')
    setHistorial(localHist)
    // Cargar preferencias
    fetch(`/api/preferencias/${u.id}`)
      .then(r => r.json())
      .then(({ preferencias }) => { if (preferencias) setPrefs(preferencias) })
      .catch(() => {
        const p = JSON.parse(localStorage.getItem(`preferences_${u.id}`) || 'null')
        if (p) setPrefs(p)
      })
    // Cargar ajustes
    const localAjustes = JSON.parse(localStorage.getItem(`ajustes_${u.id}`) || 'null')
    if (localAjustes) setAjustes(localAjustes)
  }, [navigate])

  useEffect(() => {
    if (section === 'buscar' && !mapInstance.current && mapRef.current) {
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

  const showSaved = (msg) => { setSavedOk(msg); setTimeout(() => setSavedOk(''), 3000) }

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }

  const savePrefs = async () => {
    if (!user) return
    setSavingPrefs(true)
    try {
      const res = await fetch(`/api/preferencias/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) })
      if (!res.ok) throw new Error()
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(prefs))
      showSaved('Preferencias guardadas correctamente')
    } catch { showSaved('Preferencias guardadas localmente') }
    finally { setSavingPrefs(false) }
  }

  const saveAjustes = () => {
    if (!user) return
    localStorage.setItem(`ajustes_${user.id}`, JSON.stringify(ajustes))
    showSaved('Ajustes guardados correctamente')
  }

  const saveNombre = async () => {
    if (!user || !newNombre.trim()) return
    setSavingNombre(true)
    try {
      const res = await fetch(`/api/usuario/${user.id}/nombre`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: newNombre.trim() }) })
      const updatedUser = { ...user, nombre: newNombre.trim() }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setEditingNombre(false)
      showSaved('Nombre actualizado correctamente')
    } catch { showSaved('Error al actualizar el nombre') }
    finally { setSavingNombre(false) }
  }

  const savePassword = async () => {
    if (!user || newPassword.length < 6) { alert('La contraseña debe tener al menos 6 caracteres'); return }
    setSavingPwd(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/usuario/${user.id}/password`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ password: newPassword }) })
      if (res.ok) { setNewPassword(''); setEditingPassword(false); showSaved('Contraseña actualizada correctamente') }
      else { const err = await res.json(); alert('Error: ' + (err.error || 'No se pudo actualizar')) }
    } catch { alert('Error de conexión') }
    finally { setSavingPwd(false) }
  }

  // Favoritos
  const isFavorite = (place) => favorites.some(f => f.id === place.id || f.name === place.name)

  const toggleFavorite = (place) => {
    if (!user) return
    let newFavs
    if (isFavorite(place)) {
      newFavs = favorites.filter(f => f.id !== place.id && f.name !== place.name)
    } else {
      newFavs = [...favorites, { ...place, savedAt: new Date().toISOString() }]
      showSaved(`${place.name} añadido a favoritos`)
    }
    setFavorites(newFavs)
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavs))
    // Intentar sincronizar con backend
    const token = localStorage.getItem('token')
    fetch(`/api/favoritos/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ favoritos: newFavs }) }).catch(() => {})
  }

  const removeFavorite = (place) => {
    const newFavs = favorites.filter(f => f.id !== place.id && f.name !== place.name)
    setFavorites(newFavs)
    if (user) localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavs))
  }

  // Historial
  const addToHistorial = (query, restaurante = null) => {
    if (!user || !ajustes.privacidad?.guardarHistorial) return
    const entry = { query, restaurante: restaurante?.name || null, fecha: new Date().toISOString() }
    const newHist = [entry, ...historial.filter(h => h.query !== query)].slice(0, 20)
    setHistorial(newHist)
    localStorage.setItem(`historial_${user.id}`, JSON.stringify(newHist))
    // Sync backend
    const token = localStorage.getItem('token')
    fetch(`/api/historial/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ historial: newHist }) }).catch(() => {})
  }

  const clearHistorial = () => {
    setHistorial([])
    if (user) { localStorage.removeItem(`historial_${user.id}`); const token = localStorage.getItem('token'); fetch(`/api/historial/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ historial: [] }) }).catch(() => {}) }
  }

  // Mapa
  const clearMarkers = () => { markersRef.current.forEach(m => m.remove()); markersRef.current = [] }
  const paintResults = (places) => {
    setSearchResults(places)
    const map = mapInstance.current; if (!map || places.length === 0) return
    places.forEach((place, i) => {
      const popup = `<b>${place.name}</b><br/>${place.address}${place.phone ? `<br/>${place.phone}` : ''}`
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
    addToHistorial(searchQuery)
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
        phone: el.tags?.phone || null, opening_hours: el.tags?.opening_hours || null, cuisine: el.tags?.cuisine || null, website: el.tags?.website || null,
      })).filter(p => p.lat && p.lon)
      if (places.length > 0) { paintResults(places); setSearching(false); return }
    } catch {}
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=20&addressdetails=1&countrycodes=es&lat=${center.lat}&lon=${center.lng}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } }); const data = await res.json()
      paintResults(data.map(p => ({ id: p.place_id, lat: parseFloat(p.lat), lon: parseFloat(p.lon), name: p.display_name.split(',')[0], address: p.display_name.split(',').slice(1,3).join(',').trim(), phone: null, opening_hours: null, cuisine: null, website: null })))
    } catch {} finally { setSearching(false) }
  }

  const handleResultClick = (place, i) => {
    if (!place.lat) return
    const map = mapInstance.current; if (!map) return
    map.setView([place.lat, place.lon], 17)
    if (markersRef.current[i]) markersRef.current[i].openPopup()
    addToHistorial(searchQuery, place)
  }

  const toggleCompare = (place) => {
    setCompareList(prev => { const e = prev.find(p => p.id === place.id); if (e) return prev.filter(p => p.id !== place.id); if (prev.length >= 3) return prev; return [...prev, place] })
  }
  const isInCompare = (place) => compareList.some(p => p.id === place.id)

  const navLinks = [
    { id: 'buscar', label: 'Restaurantes', icon: <IC.Restaurant /> },
    { id: 'favoritos', label: 'Favoritos', icon: <IC.Heart filled={false} /> },
    { id: 'comparativas', label: 'Comparativas', icon: <IC.Bar /> },
    { id: 'analisis', label: 'Análisis', icon: <IC.File /> },
    { id: 'historial', label: 'Historial', icon: <IC.Clock /> },
    { id: 'perfil', label: 'Perfil', icon: <IC.User /> },
    { id: 'configuracion', label: 'Ajustes', icon: <IC.Settings /> },
  ]

  return (
    <div className="dashboard-page">
      {savedOk && <div className="toast-success"><IC.Check />{savedOk}</div>}

      <header className="top-header">
        <div className="header-left"><Link to="/" className="logo"><Logo /></Link></div>
        <nav className="top-nav">
          {navLinks.map(l => (
            <a key={l.id} href="#" className={`nav-link${section === l.id ? ' active' : ''}`}
              onClick={e => { e.preventDefault(); setSection(l.id) }}>
              {l.icon}<span>{l.label}</span>
              {l.id === 'comparativas' && compareList.length > 0 && <span className="compare-badge">{compareList.length}</span>}
              {l.id === 'favoritos' && favorites.length > 0 && <span className="compare-badge">{favorites.length}</span>}
            </a>
          ))}
        </nav>
        <div className="header-right">
          {user?.rol === 'admin' && <Link to="/admin" className="admin-panel-btn">PANEL ADMIN</Link>}
          <span className="user-name">{user?.nombre || 'Usuario'}</span>
          <div className="user-avatar">{(user?.nombre || 'U')[0].toUpperCase()}</div>
          <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión"><IC.Logout /><span>Salir</span></button>
        </div>
      </header>

      {section === 'buscar' && (
        <aside className="sidebar visible">
          <div className="search-panel">
            <div className="search-bar-container">
              <div className="search-input-wrapper">
                <IC.Search />
                <input type="text" placeholder="Buscar restaurantes..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
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
            <button className="btn-compare" onClick={() => setSection('comparativas')}>
              <IC.Bar />Comparar {compareList.length > 0 && `(${compareList.length})`}
            </button>
          </div>
          <div className="results-list">
            <h3>{searchResults.length > 0 ? `${searchResults.length} resultados` : 'Resultados cercanos'}</h3>
            <div className="restaurant-list">
              {searching && <p className="no-results">Buscando...</p>}
              {!searching && searchResults.length === 0 && <p className="no-results">Realiza una búsqueda para ver restaurantes</p>}
              {!searching && searchResults.map((place, i) => (
                <div key={place.id || i} className={`restaurant-item${isInCompare(place) ? ' in-compare' : ''}`} onClick={() => handleResultClick(place, i)}>
                  <div className="restaurant-icon-svg"><IC.Restaurant /></div>
                  <div className="restaurant-info"><h4>{place.name}</h4><p>{place.address}</p></div>
                  <div style={{display:'flex',gap:'0.3rem',flexShrink:0}}>
                    <button className={`btn-fav${isFavorite(place) ? ' active' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleFavorite(place) }}
                      title={isFavorite(place) ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
                      <IC.Heart filled={isFavorite(place)} />
                    </button>
                    <button className={`btn-add-compare${isInCompare(place) ? ' active' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleCompare(place) }}
                      title={isInCompare(place) ? 'Quitar de comparativa' : 'Añadir a comparativa'}>
                      {isInCompare(place) ? <IC.Check /> : '+'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      <main className="main-content">
        {/* MAPA */}
        <section className={`content-section map-view${section === 'buscar' ? ' active' : ''}`}>
          <div className="map-container"><div id="map" ref={mapRef}></div></div>
        </section>

        {/* FAVORITOS */}
        <section className={`content-section${section === 'favoritos' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Mis Favoritos</h1><p>{favorites.length} restaurantes guardados</p></div></div>
          {favorites.length === 0 ? (
            <div className="empty-state">
              <IC.Heart filled={false} />
              <h3>No tienes favoritos aún</h3>
              <p>Busca restaurantes y pulsa el corazón para guardarlos aquí</p>
              <button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setSection('buscar')}>Buscar restaurantes</button>
            </div>
          ) : (
            <div className="favorites-grid">
              {favorites.map((f, i) => (
                <div key={i} className="fav-card">
                  <div className="fav-card-icon"><IC.Restaurant /></div>
                  <div className="fav-card-body">
                    <h4>{f.name}</h4>
                    <p><IC.Pin /> {f.address || 'Sin dirección'}</p>
                    {f.savedAt && <span className="fav-date">Guardado {new Date(f.savedAt).toLocaleDateString('es-ES')}</span>}
                  </div>
                  <button className="btn-remove-fav" onClick={() => removeFavorite(f)} title="Eliminar de favoritos"><IC.Trash /></button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COMPARATIVAS */}
        <section className={`content-section${section === 'comparativas' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Comparativas</h1><p>Compara restaurantes entre sí</p></div>
            {compareList.length > 0 && <button className="btn-secondary" onClick={() => setCompareList([])}>Limpiar selección</button>}
          </div>
          {compareList.length === 0 ? (
            <div className="empty-state">
              <IC.Bar />
              <h3>Sin restaurantes seleccionados</h3>
              <p>Ve a <strong>Restaurantes</strong>, busca y pulsa <strong>+</strong> en los que quieras comparar (máx. 3)</p>
              <button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setSection('buscar')}>Ir a buscar</button>
            </div>
          ) : (
            <>
              {compareList.length < 2 && <p className="compare-hint">Añade al menos un restaurante más desde Restaurantes</p>}
              <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }}>
                {compareList.map((place, i) => (
                  <div key={i} className="compare-card">
                    <div className="compare-card-header"><h2>{place.name}</h2><button className="compare-remove" onClick={() => toggleCompare(place)}>✕</button></div>
                    <div className="compare-rows">
                      {[['Dirección',place.address||'—',<IC.Pin />],['Teléfono',place.phone||'—',<IC.Restaurant />],['Horario',place.opening_hours||'—',<IC.Clock />],['Tipo',place.cuisine?place.cuisine.replace(/_/g,' '):'—',<IC.File />]].map(([label,val,icon])=>(
                        <div key={label} className="compare-row">
                          <span className="compare-label">{icon} {label}</span>
                          <span className="compare-value">{val}</span>
                        </div>
                      ))}
                      {place.website && <div className="compare-row"><span className="compare-label">Web</span><span className="compare-value"><a href={place.website} target="_blank" rel="noreferrer" style={{color:'var(--primary)'}}>Ver web</a></span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ANÁLISIS */}
        <section className={`content-section${section === 'analisis' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Análisis de Menús</h1><p>Análisis nutricional y alérgenos</p></div><button className="btn-primary">Analizar Nuevo Menú</button></div>
          <div className="empty-state">
            <IC.File />
            <h3>Analiza menús con IA</h3>
            <p>Sube una foto del menú para obtener información nutricional y alérgenos</p>
          </div>
        </section>

        {/* HISTORIAL */}
        <section className={`content-section${section === 'historial' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Historial</h1><p>Tus últimas búsquedas</p></div>
            {historial.length > 0 && <button className="btn-secondary" onClick={clearHistorial}>Limpiar historial</button>}
          </div>
          {historial.length === 0 ? (
            <div className="empty-state">
              <IC.Clock />
              <h3>Sin historial aún</h3>
              <p>Tus búsquedas de restaurantes aparecerán aquí automáticamente</p>
            </div>
          ) : (
            <div className="historial-list">
              {historial.map((h, i) => (
                <div key={i} className="historial-item" onClick={() => { setSearchQuery(h.query); setSection('buscar'); setTimeout(() => handleSearch(), 100) }}>
                  <div className="historial-icon"><IC.Search /></div>
                  <div className="historial-info">
                    <span className="historial-query">{h.query}</span>
                    {h.restaurante && <span className="historial-restaurante">{h.restaurante}</span>}
                  </div>
                  <div className="historial-fecha">{h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : ''}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PERFIL */}
        <section className={`content-section${section === 'perfil' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Mi Perfil</h1><p>Gestiona tu información y preferencias</p></div></div>
          <div className="profile-container">
            <div className="profile-card">
              <h3>Información Personal</h3>
              <div className="profile-info">
                <div className="info-row">
                  <label>Nombre</label>
                  {editingNombre ? (
                    <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flex:1}}>
                      <input type="text" value={newNombre} onChange={e => setNewNombre(e.target.value)} className="inline-input" />
                      <button className="btn-primary" style={{padding:'0.4rem 0.75rem',fontSize:'0.85rem'}} onClick={saveNombre} disabled={savingNombre}>{savingNombre ? '...' : 'Guardar'}</button>
                      <button className="btn-secondary" style={{padding:'0.4rem 0.75rem',fontSize:'0.85rem'}} onClick={() => { setEditingNombre(false); setNewNombre(user?.nombre||'') }}>Cancelar</button>
                    </div>
                  ) : (
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flex:1}}>
                      <span>{user?.nombre || '-'}</span>
                      <button className="btn-link" onClick={() => setEditingNombre(true)}>Editar</button>
                    </div>
                  )}
                </div>
                <div className="info-row"><label>Email</label><span>{user?.email || '-'}</span></div>
                <div className="info-row"><label>Rol</label><span className={`badge ${user?.rol}`}>{user?.rol || '-'}</span></div>
              </div>
            </div>
            <div className="profile-card">
              <h3>Preferencias Alimentarias</h3>
              <div className="preferences-grid">
                {[['vegano','Vegano'],['vegetariano','Vegetariano'],['sinGluten','Sin Gluten'],['sinLactosa','Sin Lactosa']].map(([k, label]) => (
                  <label key={k} className="checkbox-label">
                    <input type="checkbox" checked={prefs[k]} onChange={e => setPrefs(p => ({ ...p, [k]: e.target.checked }))} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <button className="btn-primary" onClick={savePrefs} disabled={savingPrefs}>{savingPrefs ? 'Guardando...' : 'Guardar Preferencias'}</button>
            </div>
          </div>
        </section>

        {/* CONFIGURACIÓN */}
        <section className={`content-section${section === 'configuracion' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Ajustes</h1><p>Personaliza tu experiencia</p></div></div>
          <div className="profile-container">

            <div className="profile-card">
              <h3><IC.Bell /> Notificaciones</h3>
              <div className="preferences-grid">
                <label className="checkbox-label">
                  <input type="checkbox" checked={ajustes.notificaciones?.nuevosRestaurantes ?? true} onChange={e => setAjustes(a => ({...a, notificaciones: {...a.notificaciones, nuevosRestaurantes: e.target.checked}}))} />
                  <span>Nuevos restaurantes cerca</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={ajustes.notificaciones?.ofertas ?? true} onChange={e => setAjustes(a => ({...a, notificaciones: {...a.notificaciones, ofertas: e.target.checked}}))} />
                  <span>Ofertas y promociones</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={ajustes.notificaciones?.recordatorios ?? false} onChange={e => setAjustes(a => ({...a, notificaciones: {...a.notificaciones, recordatorios: e.target.checked}}))} />
                  <span>Recordatorios semanales</span>
                </label>
              </div>
              <button className="btn-primary" onClick={saveAjustes}>Guardar</button>
            </div>

            <div className="profile-card">
              <h3><IC.Lock /> Privacidad</h3>
              <div className="preferences-grid">
                <label className="checkbox-label">
                  <input type="checkbox" checked={ajustes.privacidad?.geolocalizacion ?? true} onChange={e => setAjustes(a => ({...a, privacidad: {...a.privacidad, geolocalizacion: e.target.checked}}))} />
                  <span>Permitir geolocalización</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={ajustes.privacidad?.guardarHistorial ?? true} onChange={e => setAjustes(a => ({...a, privacidad: {...a.privacidad, guardarHistorial: e.target.checked}}))} />
                  <span>Guardar historial de búsquedas</span>
                </label>
              </div>
              <button className="btn-primary" onClick={saveAjustes}>Guardar</button>
            </div>

            <div className="profile-card">
              <h3><IC.Lock /> Cambiar Contraseña</h3>
              {editingPassword ? (
                <div className="form-group" style={{marginTop:'0.5rem'}}>
                  <div style={{position:'relative'}}>
                    <input type={showPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña (mín. 6 caracteres)" style={{width:'100%',paddingRight:'2.5rem'}} />
                    <button style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--muted)',cursor:'pointer'}} onClick={() => setShowPwd(s => !s)}>
                      {showPwd ? <IC.EyeOff /> : <IC.Eye />}
                    </button>
                  </div>
                  <div style={{display:'flex',gap:'0.5rem',marginTop:'0.75rem'}}>
                    <button className="btn-primary" onClick={savePassword} disabled={savingPwd}>{savingPwd ? 'Guardando...' : 'Cambiar contraseña'}</button>
                    <button className="btn-secondary" onClick={() => { setEditingPassword(false); setNewPassword('') }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{marginTop:'0.5rem'}}>
                  <p style={{color:'var(--muted)',fontSize:'0.9rem',marginBottom:'1rem'}}>Tu contraseña está protegida. Puedes cambiarla en cualquier momento.</p>
                  <button className="btn-secondary" onClick={() => setEditingPassword(true)}>Cambiar contraseña</button>
                </div>
              )}
            </div>

            <div className="profile-card danger-zone">
              <h3>Zona de peligro</h3>
              <p style={{color:'var(--muted)',fontSize:'0.875rem',marginBottom:'1rem'}}>Estas acciones son permanentes y no se pueden deshacer.</p>
              <button className="btn-danger" onClick={() => { if (confirm('¿Limpiar todo el historial de búsquedas?')) { clearHistorial(); showSaved('Historial eliminado') } }}>Limpiar historial de búsquedas</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Bienvenida