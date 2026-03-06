import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import MenuAnalysisModal from '../components/MenuAnalysisModal.jsx'
import '../styles/estilos_admin.css'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY
const DEFAULT_LAT = 37.3886
const DEFAULT_LNG = -5.9823
const DEFAULT_ZOOM = 13

// ── Carga Google Maps SDK una sola vez ──────────────────────────────
function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) { resolve(window.google.maps); return }
    if (document.getElementById('gmap-script')) {
      const wait = setInterval(() => {
        if (window.google && window.google.maps) { clearInterval(wait); resolve(window.google.maps) }
      }, 100)
      return
    }
    const script = document.createElement('script')
    script.id = 'gmap-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&language=es`
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google.maps)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

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
  Star: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#f7b801" stroke="#f7b801" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Trophy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

function CustomSelect({ value, onChange, options, placeholder, resetLabel }) {
  return (
    <div className="custom-select">
      <select
        className="custom-select-native"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">{resetLabel || placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className="custom-select-arrow"><IC.ChevronDown /></span>
    </div>
  )
}

function Admin() {
  const [section, setSection] = useState('dashboard')
  const [adminUser, setAdminUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [historial, setHistorial] = useState([])
  const [actividad, setActividad] = useState([])
  const [loadingActividad, setLoadingActividad] = useState(false)
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
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [tokenLogs, setTokenLogs] = useState([])
  const [loadingTokens, setLoadingTokens] = useState(false)
  const [tokenStats, setTokenStats] = useState(null)
  const [adminMenus, setAdminMenus] = useState([])
  const [loadingAdminMenus, setLoadingAdminMenus] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [compareAIResult, setCompareAIResult] = useState(null)
  const [comparingAI, setComparingAI] = useState(false)

  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const infoWindowRef = useRef(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  // ── Cargar Google Maps SDK ──────────────────────────────────────
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsLoaded(true))
      .catch(err => console.error('Error cargando Google Maps:', err))
  }, [])

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u || u.rol !== 'admin') { navigate('/bienvenida'); return }
    setAdminUser(u)
    loadStats()
    loadUsuarios()
    loadActividad()
  }, [navigate])

  useEffect(() => {
    if (section === 'historial') loadHistorial()
    if (section === 'tokens') loadTokenLogs()
    if (section === 'analisis') loadAdminMenus()
  }, [section])

  // ── Inicializar Google Maps ─────────────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstance.current) return
    if (section !== 'restaurantes') return

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
      zoom: DEFAULT_ZOOM,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
        { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
      ],
    })

    infoWindowRef.current = new window.google.maps.InfoWindow()
    mapInstance.current = map

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const pos = { lat: coords.latitude, lng: coords.longitude }
          map.setCenter(pos)
          new window.google.maps.Marker({
            position: pos,
            map,
            title: 'Tu ubicación',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#ff6b35',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            }
          })
        },
        () => {}
      )
    }
  }, [mapsLoaded, section])

  const loadStats = async () => {
    try {
      let res = await fetch('/admin/estadisticas-ext', { headers })
      if (res.ok) { setStats(await res.json()); return }
      res = await fetch('/admin/estadisticas', { headers })
      if (res.ok) setStats(await res.json())
    } catch {}
  }

  const loadUsuarios = async () => {
    setLoadingUsuarios(true)
    try {
      const res = await fetch('/admin/usuarios', { headers })
      if (res.ok) setUsuarios(await res.json())
    } catch {}
    finally { setLoadingUsuarios(false) }
  }

  const loadActividad = async () => {
    setLoadingActividad(true)
    try {
      const res = await fetch('/admin/actividad', { headers })
      if (res.ok) setActividad(await res.json())
    } catch {}
    finally { setLoadingActividad(false) }
  }

  const loadHistorial = async () => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u?.id) return
    setLoadingHistorial(true)
    try {
      const res = await fetch(`/api/historial/${u.id}`, { headers })
      if (res.ok) setHistorial((await res.json()).historial || [])
      else setHistorial([])
    } catch { setHistorial([]) }
    finally { setLoadingHistorial(false) }
  }

  const saveHistorial = async (hist) => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u?.id) return
    fetch(`/api/historial/${u.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ historial: hist })
    }).catch(() => {})
  }

  const saveSearchToHistorial = (query, restaurante) => {
    if (!query?.trim()) return
    const entry = { query: query.trim(), fecha: new Date().toISOString(), restaurante: restaurante || null }
    const next = [entry, ...historial].slice(0, 50)
    setHistorial(next)
    saveHistorial(next)
  }

  const loadTokenLogs = async () => {
    setLoadingTokens(true)
    try {
      const res = await fetch('/admin/tokens', { headers })
      if (res.ok) {
        const data = await res.json()
        setTokenLogs(data.logs || [])
        setTokenStats(data.stats || null)
      } else {
        setTokenLogs([])
      }
    } catch { setTokenLogs([]) }
    finally { setLoadingTokens(false) }
  }

  const loadAdminMenus = async () => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u?.id) return
    setLoadingAdminMenus(true)
    try {
      const res = await fetch(`/api/menus-analizados/${u.id}`, { headers })
      if (res.ok) setAdminMenus((await res.json()).menus || [])
      else setAdminMenus([])
    } catch { setAdminMenus([]) }
    finally { setLoadingAdminMenus(false) }
  }

  const saveAdminMenus = async (menus) => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u?.id) return
    fetch(`/api/menus-analizados/${u.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ menus })
    }).catch(() => {})
  }

  const handleSaveAdminMenu = (menuData) => {
    setAdminMenus(prev => {
      const next = [menuData, ...prev]
      saveAdminMenus(next)
      return next
    })
  }

  const deleteAdminMenu = (idx) => {
    setAdminMenus(prev => {
      const next = prev.filter((_, i) => i !== idx)
      saveAdminMenus(next)
      return next
    })
  }

  const handleCompareAI = async (list) => {
    const targets = list ?? compareList
    if (targets.length < 2) return
    setComparingAI(true); setCompareAIResult(null)
    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          restaurantes: targets.map(p => ({
            name: p.name, address: p.address,
            rating: p.rating, user_ratings_total: p.user_ratings_total,
            price_level: p.price_level,
          }))
        })
      })
      if (res.ok) setCompareAIResult(await res.json())
    } catch {}
    finally { setComparingAI(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login')
  }

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
    if (!confirm('¿Eliminar este usuario?')) return
    try { await fetch(`/admin/usuarios/${id}`, { method: 'DELETE', headers }); loadUsuarios(); loadStats() } catch {}
  }

  const openNewUser = () => { setEditUser(null); setUserForm({ nombre: '', email: '', rol: 'usuario', password: '' }); setModalUser(true) }
  const openEditUser = (u) => { setEditUser(u); setUserForm({ nombre: u.nombre || '', email: u.email || '', rol: u.rol || 'usuario', password: '' }); setModalUser(true) }

  // ── Mapa ────────────────────────────────────────────────────────
  const clearMarkers = () => {
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
  }

  const paintResults = (places) => {
    setSearchResults(places)
    const map = mapInstance.current
    if (!map || places.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()

    places.forEach((place, i) => {
      const position = { lat: place.lat, lng: place.lon }
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: place.name,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/restaurant.png',
          scaledSize: new window.google.maps.Size(32, 32),
        },
        animation: window.google.maps.Animation.DROP,
      })

      const contentString = `
        <div style="color:#111;max-width:220px;font-family:sans-serif">
          <strong style="font-size:0.95rem">${place.name}</strong><br/>
          <span style="font-size:0.8rem;color:#555">${place.address}</span>
          ${place.rating ? `<br/><span style="font-size:0.8rem">★ ${place.rating}</span>` : ''}
        </div>`

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(contentString)
        infoWindowRef.current.open(map, marker)
      })

      if (i === 0) {
        infoWindowRef.current.setContent(contentString)
        infoWindowRef.current.open(map, marker)
      }

      markersRef.current.push(marker)
      bounds.extend(position)
    })

    if (places.length === 1) map.setCenter({ lat: places[0].lat, lng: places[0].lon })
    else map.fitBounds(bounds)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true); setSearchResults([]); clearMarkers()
    const map = mapInstance.current
    const center = map ? map.getCenter() : { lat: () => DEFAULT_LAT, lng: () => DEFAULT_LNG }

    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(searchQuery)}&lat=${center.lat()}&lng=${center.lng()}`, { headers })
      if (res.ok) {
        const data = await res.json()
        if (data.places && data.places.length > 0) {
          paintResults(data.places)
          saveSearchToHistorial(searchQuery, data.places[0]?.name)
          setSearching(false); return
        }
      }
    } catch {}

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=20&addressdetails=1&countrycodes=es`
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      const data = await res.json()
      const places = data.map(p => ({
        id: p.place_id, place_id: `nominatim_${p.place_id}`,
        lat: parseFloat(p.lat), lon: parseFloat(p.lon),
        name: p.display_name.split(',')[0],
        address: p.display_name.split(',').slice(1, 3).join(',').trim(),
        rating: null,
      }))
      paintResults(places)
      if (places.length > 0) saveSearchToHistorial(searchQuery, places[0]?.name)
    } catch {}
    finally { setSearching(false) }
  }

  const handleResultClick = (place, i) => {
    if (!place.lat) return
    const map = mapInstance.current; if (!map) return
    map.setCenter({ lat: place.lat, lng: place.lon })
    map.setZoom(17)
    if (markersRef.current[i]) window.google.maps.event.trigger(markersRef.current[i], 'click')
  }

  const toggleCompare = (place) => {
    setCompareList(prev => {
      const id = place.place_id || place.id
      const exists = prev.find(p => (p.place_id || p.id) === id)
      if (exists) {
        setCompareAIResult(null)
        return prev.filter(p => (p.place_id || p.id) !== id)
      }
      if (prev.length >= 3) return prev
      return [...prev, place]
    })
  }
  const isInCompare = (place) => {
    const id = place.place_id || place.id
    return compareList.some(p => (p.place_id || p.id) === id)
  }

  const filteredUsuarios = usuarios.filter(u =>
    !userSearch || (u.nombre || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
  )
  const filteredHistorial = historial.filter(h =>
    !historialFilter || (h.query || '').toLowerCase().includes(historialFilter.toLowerCase()) || (h.usuario || '').toLowerCase().includes(historialFilter.toLowerCase())
  )

  const actividadFallback = usuarios.slice(0, 8).map((u, i) => ({
    id: i, fecha: new Date(Date.now() - i * 7200000).toISOString(),
    usuario: u.nombre || 'Usuario',
    accion: i % 3 === 0 ? 'Login' : i % 3 === 1 ? 'Búsqueda' : 'Favorito',
    detalles: i % 3 === 0 ? 'Inicio de sesión' : i % 3 === 1 ? 'Buscó restaurantes' : 'Añadió favorito',
    tipo: i % 3 === 0 ? 'success' : i % 3 === 1 ? 'info' : 'warning',
  }))

  const activityData = actividad.length > 0
    ? actividad.map((a, i) => ({ ...a, tipo: a.tipo || (i % 3 === 0 ? 'success' : i % 3 === 1 ? 'info' : 'warning') }))
    : actividadFallback

  const sidebarLinks = [
    { id: 'dashboard',     label: 'Dashboard',    icon: <IC.Dashboard /> },
    { id: 'usuarios',      label: 'Usuarios',      icon: <IC.Users /> },
    { id: 'restaurantes',  label: 'Restaurantes',  icon: <IC.Restaurant /> },
    { id: 'historial',     label: 'Historial',     icon: <IC.Clock /> },
    { id: 'analisis',      label: 'Análisis',      icon: <IC.File /> },
    { id: 'actividad',     label: 'Actividad',     icon: <IC.Activity /> },
    { id: 'tokens',        label: 'Tokens IA',     icon: <IC.Bar /> },
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
                {loadingUsuarios ? <p className="loading">Cargando...</p>
                  : usuarios.length === 0 ? <p className="loading">Sin usuarios aún</p>
                  : usuarios.slice(0, 5).map((u, i) => (
                    <div key={u.id || i} className="recent-item">
                      <div className="recent-avatar">{(u.nombre || 'U')[0].toUpperCase()}</div>
                      <div className="recent-info">
                        <h4>{u.nombre || 'Sin nombre'}</h4>
                        <p><span className={`badge ${u.rol}`}>{u.rol}</span>{u.email && <span style={{marginLeft:'0.5rem',color:'var(--muted)',fontSize:'0.8rem'}}>{u.email}</span>}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="dashboard-card">
              <h3>Actividad Reciente</h3>
              <div className="activity-list">
                {loadingActividad ? <p className="loading">Cargando...</p>
                  : activityData.slice(0, 5).map((a, i) => (
                    <div key={a.id || i} className="activity-item">
                      <div className="activity-dot" data-tipo={a.tipo}></div>
                      <div>
                        <div><strong>{a.usuario || '—'}</strong> — {a.accion || '—'}</div>
                        <div className="activity-time">{new Date(a.fecha).toLocaleString('es-ES')}</div>
                      </div>
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
              <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Preferencias</th><th>Registro</th><th>Acciones</th></tr></thead>
              <tbody>
                {loadingUsuarios ? <tr><td colSpan="6" className="loading-row">Cargando usuarios...</td></tr>
                  : filteredUsuarios.length === 0 ? <tr><td colSpan="6" className="loading-row">Sin usuarios registrados</td></tr>
                  : filteredUsuarios.map(u => (
                    <tr key={u.id}>
                      <td><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><div className="recent-avatar" style={{width:'34px',height:'34px',fontSize:'0.85rem',flexShrink:0}}>{(u.nombre||'U')[0].toUpperCase()}</div><span>{u.nombre||'—'}</span></div></td>
                      <td style={{color:'var(--muted)',fontSize:'0.875rem'}}>{u.email||'—'}</td>
                      <td><span className={`badge ${u.rol}`}>{u.rol}</span></td>
                      <td><div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap'}}>{(u.preferencias_alimentarias||[]).length===0?<span style={{color:'var(--muted)',fontSize:'0.8rem'}}>—</span>:(u.preferencias_alimentarias||[]).map(p=><span key={p} className="badge usuario" style={{fontSize:'0.7rem',padding:'0.15rem 0.5rem',textTransform:'none'}}>{p}</span>)}</div></td>
                      <td>{u.created_at?new Date(u.created_at).toLocaleDateString('es-ES'):'—'}</td>
                      <td><div style={{display:'flex',gap:'0.5rem'}}><button className="btn-action edit" onClick={()=>openEditUser(u)}><IC.Edit /></button><button className="btn-action delete" onClick={()=>handleDeleteUser(u.id)}><IC.Trash /></button></div></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>

        {/* RESTAURANTES — GOOGLE MAPS */}
        <section className={`admin-section admin-map-section${section === 'restaurantes' ? ' active' : ''}`}>
          <div className="admin-map-layout">
            <aside className="map-sidebar">
              <div className="map-sidebar-tabs">
                <button className={`map-tab${mapSection === 'mapa' ? ' active' : ''}`} onClick={() => setMapSection('mapa')}><IC.Search />Mapa</button>
                <button className={`map-tab${mapSection === 'comparativas' ? ' active' : ''}`} onClick={() => { setMapSection('comparativas'); if (compareList.length >= 2) handleCompareAI() }}>
                  <IC.Bar />Comparar{compareList.length > 0 && <span className="compare-badge-admin">{compareList.length}</span>}
                </button>
              </div>

              {mapSection === 'mapa' && (
                <>
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
                    <button className="btn-compare" onClick={() => setMapSection('comparativas')}><IC.Bar />Comparar {compareList.length > 0 && `(${compareList.length})`}</button>
                  </div>
                  <div className="results-list">
                    <h3>{searchResults.length > 0 ? `${searchResults.length} resultados` : 'Resultados'}</h3>
                    <div className="restaurant-list">
                      {searching && <p className="no-results">Buscando...</p>}
                      {!searching && searchResults.length === 0 && <p className="no-results">Realiza una búsqueda para ver restaurantes</p>}
                      {!searching && searchResults.map((place, i) => (
                        <div key={place.place_id || place.id || i} className={`restaurant-item${isInCompare(place) ? ' in-compare' : ''}`} onClick={() => handleResultClick(place, i)}>
                          {place.photo_ref
                            ? <img src={`/api/places/photo/${place.photo_ref}?w=80`} alt={place.name} style={{width:'46px',height:'46px',objectFit:'cover',borderRadius:'8px',flexShrink:0}} />
                            : <div className="restaurant-icon-svg"><IC.Restaurant /></div>}
                          <div className="restaurant-info">
                            <h4>{place.name}</h4>
                            <p>{place.address}</p>
                            {place.rating && <span style={{display:'flex',alignItems:'center',gap:'0.2rem',fontSize:'0.75rem',color:'var(--muted)',marginTop:'0.2rem'}}><IC.Star /> {place.rating}</span>}
                          </div>
                          <button className={`btn-add-compare${isInCompare(place) ? ' active' : ''}`} onClick={e => { e.stopPropagation(); toggleCompare(place) }}>
                            {isInCompare(place) ? <IC.Check /> : '+'}
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
                    {compareList.length > 0 && <button className="btn-clear" onClick={() => { setCompareList([]); setCompareAIResult(null) }}>Limpiar</button>}
                  </div>
                  {compareList.length === 0 ? (
                    <div className="compare-empty"><p>Pulsa <strong>+</strong> en los resultados para añadir restaurantes</p><button className="btn-back-map" onClick={() => setMapSection('mapa')}>Volver al mapa</button></div>
                  ) : (
                    <>
                      {compareList.length < 2 && <p className="compare-hint-small">Añade al menos un restaurante más para comparar</p>}

                      {comparingAI && (
                        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.5rem 0',color:'var(--muted)',fontSize:'0.85rem'}}>
                          <div className="spinner" style={{width:'14px',height:'14px',borderWidth:'2px',margin:0}} />Analizando con IA...
                        </div>
                      )}

                      <div className="compare-list-admin">
                        {compareList.map((place, i) => (
                          <div key={i} className="compare-card-admin">
                            <div className="compare-card-admin-header"><span>{place.name}</span><button onClick={() => { toggleCompare(place); setCompareAIResult(null) }}><IC.X /></button></div>
                            <div className="compare-detail"><IC.Pin /><span>{place.address || '—'}</span></div>
                            <div className="compare-detail"><IC.Phone /><span>{place.phone || '—'}</span></div>
                            <div className="compare-detail"><IC.Clock /><span>{place.open_now != null ? (place.open_now ? 'Abierto ahora' : 'Cerrado') : '—'}</span></div>
                            <div className="compare-detail"><IC.Star /><span>{place.rating ? `${place.rating} (${place.user_ratings_total || 0} reseñas)` : '—'}</span></div>
                          </div>
                        ))}
                      </div>

                      {compareAIResult && (
                        <div style={{marginTop:'0.75rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                          {compareAIResult.analysis?.resumen_general && (
                            <div style={{background:'rgba(78,205,196,0.08)',border:'1px solid rgba(78,205,196,0.2)',borderRadius:'8px',padding:'0.875rem',fontSize:'0.82rem',color:'var(--text)',lineHeight:1.6}}>
                              {compareAIResult.analysis.resumen_general}
                            </div>
                          )}
                          {compareAIResult.analysis?.ganador && (
                            <div style={{background:'rgba(255,107,53,0.1)',border:'1px solid rgba(255,107,53,0.3)',borderRadius:'8px',padding:'0.75rem',fontSize:'0.82rem',display:'flex',flexDirection:'column',gap:'0.25rem'}}>
                              <div style={{display:'flex',alignItems:'center',gap:'0.4rem',color:'var(--primary)',fontWeight:700}}>
                                <IC.Trophy />Ganador: {compareAIResult.analysis.ganador}
                              </div>
                              {compareAIResult.analysis.motivo_ganador && <p style={{color:'var(--muted)'}}>{compareAIResult.analysis.motivo_ganador}</p>}
                            </div>
                          )}
                          {(compareAIResult.analysis?.restaurantes || []).map((r, i) => (
                            <div key={i} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'8px',padding:'0.75rem',fontSize:'0.8rem'}}>
                              <strong style={{fontSize:'0.875rem'}}>{r.nombre}</strong>
                              {r.puntos_fuertes?.length > 0 && (
                                <div style={{marginTop:'0.375rem',color:'var(--success)',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
                                  {r.puntos_fuertes.map((p, j) => <div key={j} style={{display:'flex',alignItems:'center',gap:'0.3rem'}}><IC.Check />{p}</div>)}
                                </div>
                              )}
                              {r.puntos_debiles?.length > 0 && (
                                <div style={{marginTop:'0.25rem',color:'var(--danger)',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
                                  {r.puntos_debiles.map((p, j) => <div key={j} style={{display:'flex',alignItems:'center',gap:'0.3rem'}}><IC.X />{p}</div>)}
                                </div>
                              )}
                              {r.recomendado_para && <div style={{marginTop:'0.25rem',color:'var(--muted)'}}>Ideal para: {r.recomendado_para}</div>}
                            </div>
                          ))}
                          {compareAIResult.analysis?.conclusion && (
                            <div style={{fontSize:'0.82rem',color:'var(--muted)',padding:'0.5rem 0',lineHeight:1.6}}>
                              {compareAIResult.analysis.conclusion}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </aside>

            {/* MAPA GOOGLE MAPS */}
            <div className="admin-map-container">
              <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
                {!mapsLoaded && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#0f0f0f', color:'#aaa', fontSize:'0.95rem' }}>
                    Cargando Google Maps...
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* HISTORIAL */}
        <section className={`admin-section${section === 'historial' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Historial</h1><p>Tus últimas búsquedas</p></div>
            {historial.length > 0 && (
              <button className="btn-secondary" onClick={() => { setHistorial([]); saveHistorial([]) }}>Limpiar historial</button>
            )}
          </div>
          <div className="table-toolbar">
            <div className="toolbar-search-wrapper">
              <IC.Search />
              <input type="text" placeholder="Filtrar búsquedas..." value={historialFilter} onChange={e => setHistorialFilter(e.target.value)} />
            </div>
          </div>
          {loadingHistorial
            ? <div className="empty-state"><div className="spinner"></div><p>Cargando historial...</p></div>
            : filteredHistorial.length === 0
              ? <div className="empty-state"><IC.Clock /><h3>Sin historial aún</h3><p>Tus búsquedas en el mapa de restaurantes aparecerán aquí</p></div>
              : <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                  {filteredHistorial.map((h, i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.875rem 1.25rem',background:'var(--card)',border:'1px solid var(--border)',borderRadius:'8px',cursor:'pointer',transition:'border-color 0.2s'}}
                      onClick={() => { setHistorialFilter(''); setSearchQuery(h.query || ''); setSection('restaurantes'); setMapSection('mapa') }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,107,53,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                      <div style={{width:'38px',height:'38px',borderRadius:'8px',background:'rgba(255,107,53,0.1)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <IC.Search />
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:'0.95rem'}}>{h.query || '—'}</div>
                        {h.restaurante && <div style={{fontSize:'0.82rem',color:'var(--muted)',marginTop:'0.1rem'}}>{h.restaurante}</div>}
                      </div>
                      <div style={{fontSize:'0.8rem',color:'var(--muted)',flexShrink:0}}>
                        {h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}
                      </div>
                    </div>
                  ))}
                </div>
          }
        </section>

        {/* ANÁLISIS */}
        <section className={`admin-section${section === 'analisis' ? ' active' : ''}`}>
          <div className="section-header">
            <div>
              <h1>Análisis de Menús</h1>
              <p>{adminMenus.length} menú{adminMenus.length !== 1 ? 's' : ''} guardado{adminMenus.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn-primary" onClick={() => setShowAnalysis(true)}>
              <IC.File /> Analizar Nuevo Menú
            </button>
          </div>
          {loadingAdminMenus
            ? <div className="empty-state"><div className="spinner"></div><p>Cargando análisis...</p></div>
            : adminMenus.length === 0
              ? <div className="empty-state">
                  <IC.File /><h3>Analiza menús con IA</h3>
                  <p>Sube una foto del menú para obtener información nutricional, alérgenos y recomendaciones personalizadas</p>
                  <button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setShowAnalysis(true)}>Subir foto de menú</button>
                </div>
              : <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                  {adminMenus.map((m, idx) => (
                    <div key={idx} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1rem 1.25rem'}}>
                        <div style={{width:'56px',height:'56px',borderRadius:'8px',overflow:'hidden',flexShrink:0,background:'rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {m.imageBase64
                            ? <img src={m.imageBase64} alt={m.fileName} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                            : <IC.File />}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:'0.95rem',marginBottom:'0.15rem'}}>{m.fileName || 'Menú sin nombre'}</div>
                          <div style={{fontSize:'0.82rem',color:'var(--muted)'}}>
                            {m.date ? new Date(m.date).toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}
                          </div>
                          {m.analysis?.recomendacion_general && (
                            <p style={{fontSize:'0.82rem',color:'var(--muted)',marginTop:'0.25rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.analysis.recomendacion_general}</p>
                          )}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexShrink:0}}>
                          <span className="badge usuario">{m.analysis?.platos?.length || 0} platos</span>
                          <button className="btn-action delete" onClick={() => deleteAdminMenu(idx)} title="Eliminar"><IC.Trash /></button>
                        </div>
                      </div>
                      {m.analysis?.platos?.length > 0 && (
                        <div style={{padding:'0 1.25rem 1rem',display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                          {m.analysis.platos.slice(0, 5).map((p, i) => (
                            <span key={i} style={{padding:'0.2rem 0.6rem',borderRadius:'12px',fontSize:'0.78rem',fontWeight:600,background:'rgba(78,205,196,0.12)',color:'var(--accent)'}}>
                              {p.nombre}
                            </span>
                          ))}
                          {m.analysis.platos.length > 5 && (
                            <span style={{fontSize:'0.78rem',color:'var(--muted)',alignSelf:'center'}}>+{m.analysis.platos.length - 5} más</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
          }
        </section>

        {/* ACTIVIDAD */}
        <section className={`admin-section${section === 'actividad' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Registro de Actividad</h1><p>Acciones recientes en el sistema</p></div></div>
          <div className="actividad-filters">
            {[{id:'todos',label:'Todos'},{id:'login',label:'Logins'},{id:'busqueda',label:'Búsquedas'},{id:'favorito',label:'Favoritos'}].map(f => (
              <button key={f.id} className={`filter-pill${actividadFilter === f.id ? ' active' : ''}`} onClick={() => setActividadFilter(f.id)}>{f.label}</button>
            ))}
          </div>
          {loadingActividad ? <div className="empty-state"><div className="spinner"></div><p>Cargando actividad...</p></div>
            : <div className="actividad-timeline">{activityData.filter(a => actividadFilter === 'todos' || a.accion?.toLowerCase().includes(actividadFilter === 'busqueda' ? 'búsqueda' : actividadFilter)).map((a, i) => (
                <div key={a.id||i} className={`actividad-item tipo-${a.tipo||'info'}`}>
                  <div className="actividad-icon">{a.accion?.toLowerCase().includes('login')?<IC.Login />:a.accion?.toLowerCase().includes('favorito')?<IC.Heart />:<IC.Search />}</div>
                  <div className="actividad-content">
                    <div className="actividad-header"><span className="actividad-usuario">{a.usuario||'—'}</span><span className={`badge actividad-tipo-${a.tipo||'info'}`}>{a.accion||'—'}</span></div>
                    <div className="actividad-detalle">{a.detalles||'—'}</div>
                    <div className="actividad-fecha">{new Date(a.fecha).toLocaleString('es-ES')}</div>
                  </div>
                </div>
              ))}</div>
          }
        </section>

        {/* CONFIGURACIÓN */}
        <section className={`admin-section${section === 'configuracion' ? ' active' : ''}`}>
          <div className="section-header"><div><h1>Configuración del Sistema</h1><p>Ajustes generales de la plataforma</p></div></div>
          <div className="config-grid">
            <div className="config-card">
              <h3>Configuración General</h3>
              <div className="form-group"><label>Nombre del Sistema</label><input type="text" defaultValue="MenuSense" /></div>
              <div className="form-group"><label>Email de Contacto</label><input type="email" defaultValue="desarrollo1@holainformatica.com" /></div>
              <div className="form-group"><label>Modo de Mantenimiento</label><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><label className="switch"><input type="checkbox" /><span className="slider"></span></label><span style={{fontSize:'0.875rem',color:'var(--muted)'}}>Desactivado</span></div></div>
              <button className="btn-primary" onClick={() => showSaved('Configuración guardada')}>Guardar Cambios</button>
            </div>
            <div className="config-card">
              <h3>Seguridad</h3>
              <div className="form-group"><label>Verificación de email</label><div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}><label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label><span style={{fontSize:'0.875rem',color:'var(--muted)'}}>Activado</span></div></div>
              <div className="form-group"><label>Tiempo de sesión (min)</label><input type="number" defaultValue="60" /></div>
              <div className="form-group"><label>Intentos máximos de login</label><input type="number" defaultValue="5" /></div>
              <button className="btn-primary" onClick={() => showSaved('Seguridad guardada')}>Guardar Cambios</button>
            </div>
          </div>
        </section>
      {/* TOKENS OPENAI */}
        <section className={`admin-section${section === 'tokens' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Uso de Tokens IA</h1><p>Registro de tokens OpenAI consumidos por petición</p></div>
            <button className="btn-secondary" onClick={loadTokenLogs}><IC.Activity />Actualizar</button>
          </div>

          {/* Stats resumen */}
          {tokenStats && (
            <div className="stats-grid" style={{marginBottom:'1.5rem'}}>
              <div className="stat-card">
                <div className="stat-icon users"><IC.Bar /></div>
                <div className="stat-info"><h3>{tokenStats.totalPeticiones ?? '—'}</h3><p>Peticiones totales</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon active"><IC.Activity /></div>
                <div className="stat-info"><h3>{tokenStats.totalTokens?.toLocaleString() ?? '—'}</h3><p>Tokens totales</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon admin-icon"><IC.File /></div>
                <div className="stat-info"><h3>{tokenStats.tokensPrompt?.toLocaleString() ?? '—'}</h3><p>Tokens prompt</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon restaurants"><IC.Restaurant /></div>
                <div className="stat-info"><h3>{tokenStats.tokensRespuesta?.toLocaleString() ?? '—'}</h3><p>Tokens respuesta</p></div>
              </div>
            </div>
          )}

          {loadingTokens
            ? <div className="empty-state"><div className="spinner"></div><p>Cargando registros...</p></div>
            : tokenLogs.length === 0
              ? <div className="empty-state"><IC.Bar /><h3>Sin registros aún</h3><p>Los consumos de tokens aparecerán aquí cuando los usuarios usen las funciones de IA</p></div>
              : <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Usuario</th>
                        <th>Tipo</th>
                        <th>Modelo</th>
                        <th style={{textAlign:'right'}}>Tokens prompt</th>
                        <th style={{textAlign:'right'}}>Tokens respuesta</th>
                        <th style={{textAlign:'right'}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokenLogs.map((log, i) => (
                        <tr key={log.id || i}>
                          <td style={{fontSize:'0.82rem',color:'var(--muted)'}}>{log.created_at ? new Date(log.created_at).toLocaleString('es-ES') : '—'}</td>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                              <div className="recent-avatar" style={{width:'28px',height:'28px',fontSize:'0.75rem',flexShrink:0}}>
                                {(log.usuario || 'U')[0].toUpperCase()}
                              </div>
                              {log.usuario || '—'}
                            </div>
                          </td>
                          <td><span className="badge usuario" style={{textTransform:'none'}}>{log.tipo || '—'}</span></td>
                          <td style={{fontSize:'0.82rem',color:'var(--muted)'}}>{log.modelo || 'gpt-4o-mini'}</td>
                          <td style={{textAlign:'right'}}>{log.prompt_tokens?.toLocaleString() ?? '—'}</td>
                          <td style={{textAlign:'right'}}>{log.completion_tokens?.toLocaleString() ?? '—'}</td>
                          <td style={{textAlign:'right',fontWeight:700,color:'var(--primary)'}}>{log.total_tokens?.toLocaleString() ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          }
        </section>

      </main>

      {showAnalysis && (
        <MenuAnalysisModal
          onClose={() => setShowAnalysis(false)}
          token={token}
          userPrefs={{}}
          onSaveMenu={(menuData) => { handleSaveAdminMenu(menuData); setShowAnalysis(false) }}
        />
      )}

      {/* MODAL USUARIO */}
      {modalUser && (
        <div className="modal active" onClick={e => e.target === e.currentTarget && setModalUser(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={() => setModalUser(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveUser} style={{padding:'1.5rem'}}>
              <div className="form-group"><label>Nombre completo</label><input type="text" value={userForm.nombre} onChange={e => setUserForm(f=>({...f,nombre:e.target.value}))} required /></div>
              <div className="form-group"><label>Correo electrónico</label><input type="email" value={userForm.email} onChange={e => setUserForm(f=>({...f,email:e.target.value}))} required={!editUser} /></div>
              <div className="form-group"><label>Rol de usuario</label>
                <CustomSelect value={userForm.rol} onChange={v=>setUserForm(f=>({...f,rol:v}))} placeholder="Seleccionar rol"
                  options={[{value:'usuario',label:'Usuario estándar'},{value:'admin',label:'Administrador'}]} />
              </div>
              <div className="form-group"><label>Contraseña {editUser && <span style={{color:'var(--muted)',fontWeight:400}}>(dejar vacío para mantener)</span>}</label>
                <input type="password" value={userForm.password} onChange={e=>setUserForm(f=>({...f,password:e.target.value}))} minLength={editUser?0:6} required={!editUser} />
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