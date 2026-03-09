import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import IC from '../components/Icons.jsx'
import { loadGoogleMaps } from '../components/utils.jsx'
import RestaurantModal from '../components/RestaurantModal.jsx'
import MenuAnalysisModal from '../components/MenuAnalysisModal.jsx'
import CompareDrawer from '../components/CompareDrawer.jsx'
import RankingsDrawer from '../components/RankingsDrawer.jsx'
import BuscarSection, { MAP_STYLES } from './sections/BuscarSection.jsx'
import FavoritosSection from './sections/FavoritosSection.jsx'
import ComparativasSection from './sections/ComparativasSection.jsx'
import AnalisisSection from './sections/AnalisisSection.jsx'
import HistorialSection from './sections/HistorialSection.jsx'
import PerfilSection from './sections/PerfilSection.jsx'
import '../styles/estilos_bienvenida.css'

const DEFAULT_LAT = 37.3886
const DEFAULT_LNG = -5.9823
const DEFAULT_ZOOM = 13

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
  const [showCompareDrawer, setShowCompareDrawer] = useState(false)
  const [savedComparativas, setSavedComparativas] = useState([])
  const [savedMenus, setSavedMenus] = useState([])
  const [editingNombre, setEditingNombre] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [editingPassword, setEditingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [savingNombre, setSavingNombre] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showRankingsDrawer, setShowRankingsDrawer] = useState(false)
  const [restaurantForMenu, setRestaurantForMenu] = useState(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [filters, setFilters] = useState({ categoria: '', precio: '', distancia: '5000' })
  const [recsPlaces, setRecsPlaces] = useState([])
  const [recsLoading, setRecsLoading] = useState(false)

  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const infoWindowRef = useRef(null)
  const userLocationRef = useRef(null)
  const compareFetchedRef = useRef(new Set())
  const currentMapPlaceIdRef = useRef(null)
  const menuFileRef = useRef(null)
  const menuUploadTargetRef = useRef(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // ── Inicialización ────────────────────────────────────────────────
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsLoaded(true))
      .catch(err => console.error('Error cargando Google Maps:', err))
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return
    mapInstance.current.setOptions({ scrollwheel: !showCompareDrawer, gestureHandling: showCompareDrawer ? 'none' : 'auto' })
  }, [showCompareDrawer])

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u) { navigate('/login'); return }
    setUser(u)
    setNewNombre(u.nombre || '')
    const localFavs = JSON.parse(localStorage.getItem(`favorites_${u.id}`) || '[]')
    setFavorites(localFavs)
    const localHist = JSON.parse(localStorage.getItem(`historial_${u.id}`) || '[]')
    setHistorial(localHist)
    const localComps = JSON.parse(localStorage.getItem(`comparativas_${u.id}`) || '[]')
    setSavedComparativas(localComps)
    fetch(`/api/comparativas/${u.id}`)
      .then(r => r.json())
      .then(({ comparativas }) => {
        if (comparativas?.length > 0) {
          setSavedComparativas(comparativas)
          localStorage.setItem(`comparativas_${u.id}`, JSON.stringify(comparativas))
        }
      }).catch(() => {})
    const localMenus = JSON.parse(localStorage.getItem(`menus_${u.id}`) || '[]')
    setSavedMenus(localMenus)
    fetch(`/api/menus-analizados/${u.id}`)
      .then(r => r.json())
      .then(({ menus }) => {
        if (menus?.length > 0) {
          const merged = menus.map(m => {
            const local = localMenus.find(lm => lm.date === m.date && lm.fileName === m.fileName)
            return local ? { ...m, image: local.image, imageBase64: local.imageBase64 } : m
          })
          setSavedMenus(merged)
          localStorage.setItem(`menus_${u.id}`, JSON.stringify(merged))
        }
      }).catch(() => {})
    fetch(`/api/preferencias/${u.id}`)
      .then(r => r.json())
      .then(({ preferencias }) => { if (preferencias) setPrefs(preferencias) })
      .catch(() => {
        const p = JSON.parse(localStorage.getItem(`preferences_${u.id}`) || 'null')
        if (p) setPrefs(p)
      })
    const localAjustes = JSON.parse(localStorage.getItem(`ajustes_${u.id}`) || 'null')
    if (localAjustes) setAjustes(localAjustes)
  }, [navigate])

  // ── Inicializar mapa ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstance.current) return
    if (section !== 'buscar') return

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
      zoom: DEFAULT_ZOOM,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: MAP_STYLES,
    })

    infoWindowRef.current = new window.google.maps.InfoWindow()
    mapInstance.current = map

    // Click en POI del mapa → añadir a lista y mostrar info
    map.addListener('click', async (event) => {
      if (!event.placeId) return
      event.stop()
      try {
        const res = await fetch(`/api/places/details/${event.placeId}`)
        const details = await res.json()
        if (!details || details.error) return
        const place = { ...details, place_id: event.placeId, fromMapClick: true }
        setSearchResults(prev => {
          // Quitar el POI anterior del mapa (si había uno)
          const withoutPrev = currentMapPlaceIdRef.current
            ? prev.filter(p => p.place_id !== currentMapPlaceIdRef.current)
            : prev
          // No añadir si ya existe
          if (withoutPrev.some(p => p.place_id === event.placeId)) return withoutPrev
          return [place, ...withoutPrev]
        })
        currentMapPlaceIdRef.current = event.placeId
        const pos = { lat: details.lat, lng: details.lon }
        const contentString = `
          <div style="color:#111;max-width:220px;font-family:sans-serif;padding-bottom:4px">
            ${details.photo_ref ? `<img src="/api/places/photo/${details.photo_ref}?w=220" style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:6px;display:block" onerror="this.style.display='none'" />` : ''}
            <strong style="font-size:0.95rem">${details.name}</strong><br/>
            <span style="font-size:0.8rem;color:#555">${details.address || ''}</span>
            ${details.rating ? `<br/><span style="font-size:0.8rem;color:#f7b801">&#9733; ${details.rating}</span>` : ''}
          </div>`
        const marker = new window.google.maps.Marker({
          position: pos, map,
          icon: { url: 'https://maps.google.com/mapfiles/ms/icons/restaurant.png', scaledSize: new window.google.maps.Size(32, 32) },
          animation: window.google.maps.Animation.DROP,
        })
        markersRef.current.push(marker)
        infoWindowRef.current.setContent(contentString)
        infoWindowRef.current.open(map, marker)
        marker.addListener('click', () => {
          infoWindowRef.current.setContent(contentString)
          infoWindowRef.current.open(map, marker)
        })
      } catch {}
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const pos = { lat: coords.latitude, lng: coords.longitude }
          userLocationRef.current = pos
          map.setCenter(pos)
          new window.google.maps.Marker({
            position: pos, map, title: 'Tu ubicación',
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#ff6b35', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
          })
        },
        () => {}
      )
    }
  }, [mapsLoaded, section])

  // ── Cargar comparar detalles ──────────────────────────────────────
  useEffect(() => {
    compareList.forEach(place => {
      const id = place.place_id
      if (id && !id.startsWith('nominatim_') && !compareFetchedRef.current.has(id)) {
        compareFetchedRef.current.add(id)
        fetch(`/api/places/details/${id}`)
          .then(r => r.json())
          .then(details => {
            setCompareList(prev => prev.map(p => p.place_id === id ? { ...p, ...details } : p))
          })
          .catch(() => {})
      }
    })
  }, [compareList])

  // ── Cargar recomendaciones (se activa al abrir el ranking drawer) ──
  useEffect(() => {
    if (!showRankingsDrawer) return
    if (recsPlaces.length > 0) return
    setRecsLoading(true)
    const loc = userLocationRef.current
    const lat = loc?.lat ?? DEFAULT_LAT
    const lng = loc?.lng ?? DEFAULT_LNG
    const prefQuery = prefs.vegano ? 'vegetariano vegano' : prefs.vegetariano ? 'vegetariano' : prefs.sinGluten ? 'sin gluten' : 'restaurante'
    const params = new URLSearchParams({ q: prefQuery, lat, lng, radius: '5000' })
    fetch(`/api/places/search?${params}`)
      .then(r => r.json())
      .then(data => { setRecsPlaces(data.places || []); setRecsLoading(false) })
      .catch(() => setRecsLoading(false))
  }, [showRankingsDrawer])

  // ── Helpers ───────────────────────────────────────────────────────
  const showSaved = (msg) => { setSavedOk(msg); setTimeout(() => setSavedOk(''), 3000) }
  const handleLogout = () => {
    fetch('/api/actividad/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'logout', userId: user?.id })
    }).catch(() => {})
    localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login')
  }

  const savePrefs = async () => {
    if (!user) return
    setSavingPrefs(true)
    try {
      await fetch(`/api/preferencias/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) })
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
      await fetch(`/api/usuario/${user.id}/nombre`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: newNombre.trim() }) })
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
      const res = await fetch(`/api/usuario/${user.id}/password`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ password: newPassword }) })
      if (res.ok) { setNewPassword(''); setEditingPassword(false); showSaved('Contraseña actualizada correctamente') }
      else { const err = await res.json(); alert('Error: ' + (err.error || 'No se pudo actualizar')) }
    } catch { alert('Error de conexión') }
    finally { setSavingPwd(false) }
  }

  const isFavorite = (place) => {
    const id = place?.place_id || place?.id
    return favorites.some(f => (f.place_id || f.id) === id)
  }

  const toggleFavorite = (place) => {
    if (!user) return
    const id = place?.place_id || place?.id
    let newFavs
    if (isFavorite(place)) {
      newFavs = favorites.filter(f => (f.place_id || f.id) !== id)
    } else {
      newFavs = [...favorites, { ...place, place_id: id, savedAt: new Date().toISOString() }]
      showSaved(`${place.name} añadido a favoritos`)
    }
    setFavorites(newFavs)
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavs))
    fetch(`/api/favoritos/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ favoritos: newFavs }) }).catch(() => {})
  }

  const removeFavorite = (place) => {
    const id = place?.place_id || place?.id
    const newFavs = favorites.filter(f => (f.place_id || f.id) !== id)
    setFavorites(newFavs)
    if (user) localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavs))
  }

  const addToHistorial = (query, restaurante = null) => {
    if (!user || !ajustes.privacidad?.guardarHistorial) return
    const entry = { query, restaurante: restaurante?.name || null, place: restaurante || null, fecha: new Date().toISOString() }
    const newHist = [entry, ...historial.filter(h => h.query !== query)].slice(0, 20)
    setHistorial(newHist)
    localStorage.setItem(`historial_${user.id}`, JSON.stringify(newHist))
    fetch(`/api/historial/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ historial: newHist }) }).catch(() => {})
  }

  const clearHistorial = () => {
    setHistorial([])
    if (user) {
      localStorage.removeItem(`historial_${user.id}`)
      fetch(`/api/historial/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ historial: [] }) }).catch(() => {})
    }
  }

  const handleSaveComparativa = (comparativa) => {
    if (!user) return
    const newComps = [comparativa, ...savedComparativas].slice(0, 20)
    setSavedComparativas(newComps)
    localStorage.setItem(`comparativas_${user.id}`, JSON.stringify(newComps))
    fetch(`/api/comparativas/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ comparativas: newComps }) }).catch(() => {})
    showSaved('Comparativa guardada correctamente')
  }

  const deleteComparativa = (index) => {
    const newComps = savedComparativas.filter((_, i) => i !== index)
    setSavedComparativas(newComps)
    if (user) {
      localStorage.setItem(`comparativas_${user.id}`, JSON.stringify(newComps))
      fetch(`/api/comparativas/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ comparativas: newComps }) }).catch(() => {})
    }
  }

  const handleSaveMenu = (menu) => {
    if (!user) return
    const newMenus = [menu, ...savedMenus].slice(0, 20)
    setSavedMenus(newMenus)
    localStorage.setItem(`menus_${user.id}`, JSON.stringify(newMenus))
    fetch(`/api/menus-analizados/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ menus: newMenus }) }).catch(() => {})
    showSaved('Menú guardado correctamente')
  }

  const deleteMenu = (index) => {
    const newMenus = savedMenus.filter((_, i) => i !== index)
    setSavedMenus(newMenus)
    if (user) {
      localStorage.setItem(`menus_${user.id}`, JSON.stringify(newMenus))
      fetch(`/api/menus-analizados/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ menus: newMenus }) }).catch(() => {})
    }
  }

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
        position, map, title: place.name,
        icon: { url: 'https://maps.google.com/mapfiles/ms/icons/restaurant.png', scaledSize: new window.google.maps.Size(32, 32) },
        animation: window.google.maps.Animation.DROP,
      })
      const contentString = `
        <div style="color:#111;max-width:220px;font-family:sans-serif;padding-bottom:4px">
          ${place.photo_ref ? `<img src="/api/places/photo/${place.photo_ref}?w=220" style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:6px;display:block" onerror="this.style.display='none'" />` : ''}
          <strong style="font-size:0.95rem">${place.name}</strong><br/>
          <span style="font-size:0.8rem;color:#555">${place.address}</span>
          ${place.rating ? `<br/><span style="font-size:0.8rem;color:#f7b801">&#9733; ${place.rating}</span>` : ''}
        </div>`
      marker.addListener('click', () => {
        infoWindowRef.current.setContent(contentString)
        infoWindowRef.current.open(map, marker)
        addToHistorial(searchQuery, place)
        if (place.place_id && !place.place_id.startsWith('nominatim_')) setSelectedPlace(place)
      })
      if (i === 0) { infoWindowRef.current.setContent(contentString); infoWindowRef.current.open(map, marker) }
      markersRef.current.push(marker)
      bounds.extend(position)
    })
    if (places.length === 1) map.setCenter({ lat: places[0].lat, lng: places[0].lon })
    else map.fitBounds(bounds)
  }

  const handleSearch = async (overrideQuery) => {
    const q = typeof overrideQuery === 'string' ? overrideQuery : searchQuery
    if (!q.trim()) return
    setSearching(true); setSearchResults([]); clearMarkers()
    addToHistorial(q)
    const map = mapInstance.current
    const userLoc = userLocationRef.current
    const mapCenter = map ? map.getCenter() : null
    const refLat = userLoc ? userLoc.lat : (mapCenter ? mapCenter.lat() : DEFAULT_LAT)
    const refLng = userLoc ? userLoc.lng : (mapCenter ? mapCenter.lng() : DEFAULT_LNG)

    try {
      const params = new URLSearchParams({ q, lat: refLat, lng: refLng, radius: filters.distancia })
      if (filters.categoria) params.set('keyword', filters.categoria)
      if (filters.precio) params.set('precio', filters.precio)
      const res = await fetch(`/api/places/search?${params}`)
      const data = await res.json()
      if (data.places && data.places.length > 0) {
        paintResults(data.places)
        setSearching(false)
        return
      }
    } catch {}

    try {
      const nominatimQ = filters.categoria ? `${q} ${filters.categoria}` : q
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(nominatimQ)}&format=json&limit=20&addressdetails=1&countrycodes=es`
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      let data = await res.json()
      const maxKm = parseInt(filters.distancia) / 1000
      data = data.filter(p => {
        const dLat = (parseFloat(p.lat) - refLat) * Math.PI / 180
        const dLon = (parseFloat(p.lon) - refLng) * Math.PI / 180
        const a = Math.sin(dLat/2)**2 + Math.cos(refLat*Math.PI/180)*Math.cos(parseFloat(p.lat)*Math.PI/180)*Math.sin(dLon/2)**2
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) <= maxKm
      })
      paintResults(data.map(p => ({
        id: p.place_id, place_id: `nominatim_${p.place_id}`,
        lat: parseFloat(p.lat), lon: parseFloat(p.lon),
        name: p.display_name.split(',')[0],
        address: p.display_name.split(',').slice(1,3).join(',').trim(),
        rating: null, price_level: null, photo_ref: null,
      })))
    } catch {}
    finally { setSearching(false) }
  }

  const handleResultClick = (place, i) => {
    if (!place.lat) return
    const map = mapInstance.current; if (!map) return
    map.setCenter({ lat: place.lat, lng: place.lon })
    map.setZoom(17)
    if (markersRef.current[i]) window.google.maps.event.trigger(markersRef.current[i], 'click')
    addToHistorial(searchQuery, place)
    if (place.place_id && !place.place_id.startsWith('nominatim_')) setSelectedPlace(place)
  }

  const toggleCompare = (place) => {
    setCompareList(prev => {
      const id = place.place_id || place.id
      const e = prev.find(p => (p.place_id || p.id) === id)
      if (e) return prev.filter(p => (p.place_id || p.id) !== id)
      if (prev.length >= 3) return prev
      return [...prev, place]
    })
  }

  const removeFromCompare = (place) => {
    const id = place.place_id || place.id
    setCompareList(prev => prev.filter(p => (p.place_id || p.id) !== id))
  }

  const isInCompare = (place) => {
    const id = place?.place_id || place?.id
    return compareList.some(p => (p.place_id || p.id) === id)
  }

  const removeFromResults = (place) => {
    const id = place.place_id || place.id
    setSearchResults(prev => prev.filter(p => (p.place_id || p.id) !== id))
  }

  const handleUploadMenu = (place) => {
    menuUploadTargetRef.current = place
    menuFileRef.current?.click()
  }

  const handleMenuFileChange = (e) => {
    const file = e.target.files?.[0]
    const place = menuUploadTargetRef.current
    if (!file || !place) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = (ev) => {
      handleSaveMenu({
        restaurantPlaceId: place.place_id || place.id,
        restaurantName: place.name,
        imageBase64: ev.target.result,
        mimeType: file.type,
        fileName: file.name,
        date: new Date().toISOString(),
      })
      menuUploadTargetRef.current = null
    }
    reader.readAsDataURL(file)
  }

  const navLinks = [
    { id: 'buscar',       label: 'Restaurantes', icon: <IC.Restaurant /> },
    { id: 'favoritos',    label: 'Favoritos',    icon: <IC.Heart filled={false} /> },
    { id: 'comparativas', label: 'Comparativas', icon: <IC.Bar /> },
    { id: 'analisis',     label: 'Análisis',     icon: <IC.File /> },
    { id: 'historial',    label: 'Historial',    icon: <IC.Clock /> },
    { id: 'perfil',       label: 'Ajustes',      icon: <IC.Settings /> },
  ]

  return (
    <div className="dashboard-page">
      {savedOk && <div className="toast-success"><IC.Check />{savedOk}</div>}

      {/* Input oculto para subir foto de menú desde la tarjeta de restaurante */}
      <input ref={menuFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMenuFileChange} />

      {/* Modales globales */}
      {selectedPlace && (
        <RestaurantModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onToggleFavorite={toggleFavorite}
          isFav={isFavorite(selectedPlace)}
        />
      )}
      {showAnalysis && (
        <MenuAnalysisModal
          onClose={() => { setShowAnalysis(false); setRestaurantForMenu(null) }}
          token={token}
          userPrefs={prefs}
          onSaveMenu={handleSaveMenu}
          restaurantContext={restaurantForMenu}
        />
      )}
      {showCompareDrawer && (
        <CompareDrawer
          compareList={compareList}
          onClose={() => setShowCompareDrawer(false)}
          onRemove={removeFromCompare}
          onClear={() => { setCompareList([]); setShowCompareDrawer(false) }}
          token={token}
          onSave={handleSaveComparativa}
          savedMenus={savedMenus}
        />
      )}
      {showRankingsDrawer && (
        <RankingsDrawer
          recsPlaces={recsPlaces}
          recsLoading={recsLoading}
          prefs={prefs}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          setSelectedPlace={setSelectedPlace}
          onClose={() => setShowRankingsDrawer(false)}
        />
      )}

      {/* Header */}
      <header className="top-header">
        <div className="header-left"><Link to="/" className="logo"><Logo /></Link></div>
        <nav className="top-nav">
          {navLinks.map(l => (
            <a key={l.id} href="#" className={`nav-link${section === l.id ? ' active' : ''}`}
              onClick={e => { e.preventDefault(); setSection(l.id) }}>
              {l.icon}<span>{l.label}</span>
              {l.id === 'comparativas' && savedComparativas.length > 0 && <span className="compare-badge">{savedComparativas.length}</span>}
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

      {/* Secciones */}
      <BuscarSection
        active={section === 'buscar'}
        mapRef={mapRef}
        mapsLoaded={mapsLoaded}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        searching={searching}
        filters={filters}
        setFilters={setFilters}
        searchResults={searchResults}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        isInCompare={isInCompare}
        toggleCompare={toggleCompare}
        handleResultClick={handleResultClick}
        compareList={compareList}
        setShowCompareDrawer={setShowCompareDrawer}
        setShowRankingsDrawer={setShowRankingsDrawer}
        onUploadMenu={handleUploadMenu}
        onRemoveResult={removeFromResults}
      />

      <main className="main-content">
        <FavoritosSection
          active={section === 'favoritos'}
          favorites={favorites}
          removeFavorite={removeFavorite}
          setSelectedPlace={setSelectedPlace}
          setSection={setSection}
        />

        <ComparativasSection
          active={section === 'comparativas'}
          savedComparativas={savedComparativas}
          deleteComparativa={deleteComparativa}
          setSection={setSection}
          setShowCompareDrawer={setShowCompareDrawer}
        />

        <AnalisisSection
          active={section === 'analisis'}
          savedMenus={savedMenus}
          deleteMenu={deleteMenu}
          setShowAnalysis={setShowAnalysis}
        />

        <HistorialSection
          active={section === 'historial'}
          historial={historial}
          clearHistorial={clearHistorial}
          setSearchQuery={setSearchQuery}
          setSection={setSection}
          handleSearch={handleSearch}
          setSelectedPlace={setSelectedPlace}
        />

        {/* Perfil y Ajustes unificados */}
        <PerfilSection
          active={section === 'perfil'}
          user={user}
          editingNombre={editingNombre}
          setEditingNombre={setEditingNombre}
          newNombre={newNombre}
          setNewNombre={setNewNombre}
          saveNombre={saveNombre}
          savingNombre={savingNombre}
          prefs={prefs}
          setPrefs={setPrefs}
          savePrefs={savePrefs}
          savingPrefs={savingPrefs}
          ajustes={ajustes}
          setAjustes={setAjustes}
          saveAjustes={saveAjustes}
          editingPassword={editingPassword}
          setEditingPassword={setEditingPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          showPwd={showPwd}
          setShowPwd={setShowPwd}
          savePassword={savePassword}
          savingPwd={savingPwd}
          clearHistorial={clearHistorial}
          showSaved={showSaved}
        />
      </main>
    </div>
  )
}

export default Bienvenida