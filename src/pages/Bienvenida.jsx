import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_bienvenida.css'

const DEFAULT_LAT = 37.3886
const DEFAULT_LNG = -5.9823
const DEFAULT_ZOOM = 13

function Bienvenida() {
  const [section, setSection] = useState('buscar')
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [prefs, setPrefs] = useState({ vegano: false, vegetariano: false, sinGluten: false, sinLactosa: false })
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [compareList, setCompareList] = useState([])
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u) { navigate('/login'); return }
    setUser(u)
    setFavorites(JSON.parse(localStorage.getItem(`favorites_${u.id}`) || '[]'))
    fetch(`/api/preferencias/${u.id}`)
      .then(r => r.json())
      .then(({ preferencias }) => { if (preferencias) setPrefs(preferencias) })
      .catch(() => {
        const p = JSON.parse(localStorage.getItem(`preferences_${u.id}`) || 'null')
        if (p) setPrefs(p)
      })
  }, [navigate])

  useEffect(() => {
    if (section === 'buscar' && !mapInstance.current && mapRef.current) {
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const savePrefs = async () => {
    if (!user) return
    setSavingPrefs(true)
    try {
      const res = await fetch(`/api/preferencias/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      if (!res.ok) throw new Error('Error al guardar')
      alert('Preferencias guardadas ✓')
    } catch (err) {
      alert('Error al guardar preferencias: ' + err.message)
    } finally {
      setSavingPrefs(false)
    }
  }

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
    try {
      const r = 15000
      const q = `[out:json][timeout:20];(node["name"~"${searchQuery}",i]["amenity"~"restaurant|fast_food|cafe|bar|pub"](around:${r},${center.lat},${center.lng});way["name"~"${searchQuery}",i]["amenity"~"restaurant|fast_food|cafe|bar|pub"](around:${r},${center.lat},${center.lng}););out center;`
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 8000)
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q, signal: controller.signal })
      clearTimeout(t)
      const data = await res.json()
      const places = (data.elements || []).map(el => ({
        id: el.id, lat: el.lat ?? el.center?.lat, lon: el.lon ?? el.center?.lon,
        name: el.tags?.name || searchQuery,
        address: [el.tags?.['addr:street'], el.tags?.['addr:housenumber'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'Sin dirección',
        phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
        opening_hours: el.tags?.opening_hours || null,
        cuisine: el.tags?.cuisine || null,
        website: el.tags?.website || null,
      })).filter(p => p.lat && p.lon)
      if (places.length > 0) { paintResults(places); setSearching(false); return }
    } catch (err) {
      console.warn('Overpass falló, usando Nominatim:', err.message)
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=20&addressdetails=1&countrycodes=es&lat=${center.lat}&lon=${center.lng}`
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      const data = await res.json()
      const places = data.map(p => ({
        id: p.place_id, lat: parseFloat(p.lat), lon: parseFloat(p.lon),
        name: p.display_name.split(',')[0],
        address: p.display_name.split(',').slice(1, 3).join(',').trim(),
        phone: null, opening_hours: null, cuisine: null, website: null,
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

  const goToComparativas = () => setSection('comparativas')

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
              {l.id === 'comparativas' && compareList.length > 0 && (
                <span className="compare-badge">{compareList.length}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="header-right">
          {user?.rol === 'admin' && <Link to="/admin" className="admin-panel-btn">PANEL ADMIN</Link>}
          <span className="user-name">{user?.nombre || 'Usuario'}</span>
          <div className="user-avatar">{(user?.nombre || 'U')[0].toUpperCase()}</div>
          <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Salir</span>
          </button>
        </div>
      </header>

      {section === 'buscar' && (
        <aside className="sidebar visible">
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
            <button className="btn-compare" onClick={goToComparativas}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Comparar Restaurantes {compareList.length > 0 && `(${compareList.length})`}
            </button>
          </div>
          <div className="results-list">
            <h3>{searchResults.length > 0 ? `${searchResults.length} resultados` : 'Resultados cercanos'}</h3>
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
                    title={isInCompare(place) ? 'Quitar de comparativa' : 'Añadir a comparativa'}>
                    {isInCompare(place) ? '✓' : '+'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      <main className="main-content">
        <section className={`content-section map-view${section === 'buscar' ? ' active' : ''}`}>
          <div className="map-container">
            <div id="map" ref={mapRef}></div>
          </div>
        </section>

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
          <div className="section-header">
            <div><h1>Comparativas</h1><p>Compara calidad/precio entre restaurantes</p></div>
            {compareList.length > 0 && (
              <button className="btn-secondary" onClick={() => setCompareList([])}>Limpiar selección</button>
            )}
          </div>

          {compareList.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <h3>Sin restaurantes seleccionados</h3>
              <p>Ve a <strong>Restaurantes</strong>, busca y pulsa <strong>+</strong> en los que quieras comparar (máximo 3)</p>
              <button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setSection('buscar')}>Ir a buscar restaurantes</button>
            </div>
          ) : (
            <>
              <p className="compare-hint">
                {compareList.length < 2
                  ? '👆 Añade al menos un restaurante más desde la sección Restaurantes para comparar'
                  : `Comparando ${compareList.length} restaurantes`}
              </p>
              <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }}>
                {compareList.map((place, i) => (
                  <div key={i} className="compare-card">
                    <div className="compare-card-header">
                      <h2>{place.name}</h2>
                      <button className="compare-remove" onClick={() => toggleCompare(place)}>✕</button>
                    </div>
                    <div className="compare-rows">
                      <div className="compare-row">
                        <span className="compare-label">📍 Dirección</span>
                        <span className="compare-value">{place.address || '—'}</span>
                      </div>
                      <div className="compare-row">
                        <span className="compare-label">📞 Teléfono</span>
                        <span className="compare-value">{place.phone || '—'}</span>
                      </div>
                      <div className="compare-row">
                        <span className="compare-label">🕐 Horario</span>
                        <span className="compare-value">{place.opening_hours || '—'}</span>
                      </div>
                      <div className="compare-row">
                        <span className="compare-label">🍴 Tipo</span>
                        <span className="compare-value">{place.cuisine ? place.cuisine.replace(/_/g, ' ') : '—'}</span>
                      </div>
                      <div className="compare-row">
                        <span className="compare-label">🌐 Web</span>
                        <span className="compare-value">
                          {place.website
                            ? <a href={place.website} target="_blank" rel="noreferrer" style={{color:'var(--primary)'}}>Ver web</a>
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className={`content-section${section === 'analisis' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Análisis de Menús</h1><p>Análisis nutricional y detección de alérgenos</p></div><button className="btn-primary">Analizar Nuevo Menú</button></div>
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h3>Analiza menús con IA</h3><p>Sube una foto del menú para obtener información nutricional y alérgenos</p>
          </div>
        </section>

        <section className={`content-section${section === 'historial' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Historial</h1><p>Tus búsquedas y análisis recientes</p></div></div>
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h3>Sin historial aún</h3><p>Aquí aparecerán tus búsquedas y análisis recientes</p>
          </div>
        </section>

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
                {[['vegano','Vegano'],['vegetariano','Vegetariano'],['sinGluten','Sin Gluten'],['sinLactosa','Sin Lactosa']].map(([k, label]) => (
                  <label key={k} className="checkbox-label">
                    <input type="checkbox" checked={prefs[k]} onChange={e => setPrefs(p => ({ ...p, [k]: e.target.checked }))} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <button className="btn-primary" onClick={savePrefs} disabled={savingPrefs}>
                {savingPrefs ? 'Guardando...' : 'Guardar Preferencias'}
              </button>
            </div>
          </div>
        </section>

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