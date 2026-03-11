import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import Logo from '../components/Logo.jsx'
import IC from '../components/Icons.jsx'
import RestaurantModal from '../components/RestaurantModal.jsx'
import MenuAnalysisModal from '../components/MenuAnalysisModal.jsx'
import CompareDrawer from '../components/CompareDrawer.jsx'
import RankingsDrawer from '../components/RankingsDrawer.jsx'
import BuscarSection from './sections/BuscarSection.jsx'
import FavoritosSection from './sections/FavoritosSection.jsx'
import ComparativasSection from './sections/ComparativasSection.jsx'
import AnalisisSection from './sections/AnalisisSection.jsx'
import HistorialSection from './sections/HistorialSection.jsx'
import PerfilSection from './sections/PerfilSection.jsx'
import '../styles/estilos_bienvenida.css'

mapboxgl.accessToken = 'pk.eyJ1IjoicGhvdG9yb3NlOCIsImEiOiJjbW05bDNxOHEwNGg3MnJzaHBlOGkyN2g2In0.Oc3p2lxarQWmVc1mC_LCTA'

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
  const userLocationRef = useRef(null)
  const compareFetchedRef = useRef(new Set())
  const currentMapPlaceIdRef = useRef(null)
  const menuFileRef = useRef(null)
  const menuUploadTargetRef = useRef(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // ── Inicialización ────────────────────────────────────────────────
  useEffect(() => {
    setMapsLoaded(true)
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return
    if (showCompareDrawer) {
      mapInstance.current.scrollZoom.disable()
      mapInstance.current.dragPan.disable()
    } else {
      mapInstance.current.scrollZoom.enable()
      mapInstance.current.dragPan.enable()
    }
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

  // ── Inicializar mapa (Mapbox 3D) ──────────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstance.current) return
    if (section !== 'buscar') return

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [DEFAULT_LNG, DEFAULT_LAT],
      zoom: DEFAULT_ZOOM,
      pitch: 50,
      bearing: -10,
      antialias: true,
    })

    mapInstance.current = map

    map.on('load', () => {
      // Capa de edificios 3D
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#1d2c4d',
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'height']],
          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'min_height']],
          'fill-extrusion-opacity': 0.85,
        },
      })

      // ── Capa de iconos de restaurantes/comida ──────────────────
      const FOOD_MAKI = ['restaurant', 'cafe', 'bar', 'fast-food', 'bakery',
        'beer', 'wine', 'cocktail', 'ice-cream', 'pizza', 'food']

      map.addLayer({
        id: 'food-pois',
        type: 'symbol',
        source: 'composite',
        'source-layer': 'poi_label',
        filter: ['in', ['get', 'maki'], ['literal', FOOD_MAKI]],
        layout: {
          'icon-image': ['get', 'maki'],
          'icon-size': 1.3,
          'icon-allow-overlap': false,
          'text-field': ['get', 'name'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 11,
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
          'text-optional': true,
          'text-max-width': 8,
        },
        paint: {
          'icon-color': '#ff6b35',
          'icon-halo-color': '#111111',
          'icon-halo-width': 1,
          'text-color': '#eeeeee',
          'text-halo-color': 'rgba(0,0,0,0.85)',
          'text-halo-width': 1.5,
        },
        minzoom: 14,
      })

      // ── Capa de iconos de negocios generales ────────────────────
      map.addLayer({
        id: 'general-pois',
        type: 'symbol',
        source: 'composite',
        'source-layer': 'poi_label',
        filter: ['!', ['in', ['get', 'maki'], ['literal', FOOD_MAKI]]],
        layout: {
          'icon-image': ['get', 'maki'],
          'icon-size': 1.0,
          'icon-allow-overlap': false,
          'text-field': ['get', 'name'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 10,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-optional': true,
          'text-max-width': 7,
        },
        paint: {
          'icon-color': '#bbbbbb',
          'icon-halo-color': '#111111',
          'icon-halo-width': 0.8,
          'text-color': '#cccccc',
          'text-halo-color': 'rgba(0,0,0,0.85)',
          'text-halo-width': 1.5,
        },
        minzoom: 15,
      })

      // Cursor pointer al pasar sobre POIs
      const setCursorPointer = () => { map.getCanvas().style.cursor = 'pointer' }
      const resetCursor = () => { map.getCanvas().style.cursor = '' }
      ;['food-pois', 'general-pois', 'poi-label'].forEach(layer => {
        map.on('mouseenter', layer, setCursorPointer)
        map.on('mouseleave', layer, resetCursor)
      })

      // Click en POI del mapa → buscar en Google Places y añadir a lista
      map.on('click', async (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ['food-pois', 'general-pois', 'poi-label'],
        })
        if (!features.length) return
        const feature = features[0]
        const name = feature.properties?.name
        if (!name) return
        const { lng, lat } = event.lngLat
        try {
          const params = new URLSearchParams({ q: name, lat, lng, radius: '300' })
          const res = await fetch(`/api/places/search?${params}`)
          const data = await res.json()
          if (!data.places?.length) return
          const details = data.places[0]
          const place = { ...details, fromMapClick: true }
          setSearchResults(prev => {
            const withoutPrev = currentMapPlaceIdRef.current
              ? prev.filter(p => p.place_id !== currentMapPlaceIdRef.current)
              : prev
            if (withoutPrev.some(p => p.place_id === place.place_id)) return withoutPrev
            return [place, ...withoutPrev]
          })
          currentMapPlaceIdRef.current = place.place_id
          const popup = new mapboxgl.Popup({ closeOnClick: true, maxWidth: '240px' })
            .setHTML(`
              <div style="color:#111;max-width:220px;font-family:sans-serif;padding-bottom:4px">
                ${details.photo_ref ? `<img src="/api/places/photo/${details.photo_ref}?w=220" style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:6px;display:block" onerror="this.style.display='none'" />` : ''}
                <strong style="font-size:0.95rem">${details.name}</strong><br/>
                <span style="font-size:0.8rem;color:#555">${details.address || ''}</span>
                ${details.rating ? `<br/><span style="font-size:0.8rem;color:#f7b801">&#9733; ${details.rating}</span>` : ''}
              </div>`)
          const el = createMarkerEl()
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map)
          popup.addTo(map)
          let closed = false
          const entry = { marker, popup, lngLat: [lng, lat], placeId: place.place_id }
          markersRef.current.push(entry)
          popup.on('close', () => {
            if (closed) return
            closed = true
            marker.remove()
            markersRef.current = markersRef.current.filter(m => m !== entry)
            if (currentMapPlaceIdRef.current === place.place_id) currentMapPlaceIdRef.current = null
            setSearchResults(prev => prev.filter(p => (p.place_id || p.id) !== place.place_id))
          })
        } catch {}
      })

      // Geolocalización
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const pos = { lat: coords.latitude, lng: coords.longitude }
            userLocationRef.current = pos
            map.flyTo({ center: [pos.lng, pos.lat], zoom: DEFAULT_ZOOM })
            const el = document.createElement('div')
            Object.assign(el.style, {
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#ff6b35', border: '2px solid white',
              boxShadow: '0 0 10px rgba(255,107,53,0.7)',
            })
            new mapboxgl.Marker({ element: el })
              .setLngLat([pos.lng, pos.lat])
              .addTo(map)
          },
          () => {}
        )
      }
    })
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

  // ── Helpers de mapa ──────────────────────────────────────────────
  const createMarkerEl = () => {
    const el = document.createElement('div')
    el.className = 'map-marker-pin'
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 42" width="36" height="42" style="pointer-events:none;display:block">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 24 18 24s18-10.5 18-24C36 8.06 27.94 0 18 0z" fill="#ff6b35"/>
        <circle cx="18" cy="17" r="9" fill="white" opacity="0.95"/>
        <path d="M18 11c-1.1 0-2 .9-2 2v1h-2v1.5h.5l.5 4h6l.5-4H22V14h-2v-1c0-1.1-.9-2-2-2zm-1 5.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm2 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm-3.5-2h5v.5h-5V14.5z" fill="#ff6b35"/>
      </svg>`
    return el
  }

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
    markersRef.current.forEach(({ marker, popup }) => { popup?.remove(); marker.remove() })
    markersRef.current = []
  }

  const paintResults = (places) => {
    setSearchResults(places)
    const map = mapInstance.current
    if (!map || places.length === 0) return
    const lngLats = []
    places.forEach((place, i) => {
      const lngLat = [place.lon, place.lat]
      lngLats.push(lngLat)
      const popupHTML = `
        <div style="color:#111;max-width:220px;font-family:sans-serif;padding-bottom:4px">
          ${place.photo_ref ? `<img src="/api/places/photo/${place.photo_ref}?w=220" style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:6px;display:block" onerror="this.style.display='none'" />` : ''}
          <strong style="font-size:0.95rem">${place.name}</strong><br/>
          <span style="font-size:0.8rem;color:#555">${place.address}</span>
          ${place.rating ? `<br/><span style="font-size:0.8rem;color:#f7b801">&#9733; ${place.rating}</span>` : ''}
        </div>`
      const popup = new mapboxgl.Popup({ closeOnClick: false, maxWidth: '240px' }).setHTML(popupHTML)
      const el = createMarkerEl('restaurant')
      el.addEventListener('click', () => {
        addToHistorial(searchQuery, place)
        if (place.place_id && !place.place_id.startsWith('nominatim_')) setSelectedPlace(place)
      })
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map)
      if (i === 0) popup.addTo(map)
      markersRef.current.push({ marker, popup, lngLat })
    })
    if (places.length === 1) {
      map.flyTo({ center: lngLats[0], zoom: 16, pitch: 50 })
    } else {
      const bounds = lngLats.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(lngLats[0], lngLats[0])
      )
      map.fitBounds(bounds, { padding: 80 })
    }
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
    map.flyTo({ center: [place.lon, place.lat], zoom: 17, pitch: 50, bearing: -10 })
    if (markersRef.current[i]) {
      const { popup, lngLat } = markersRef.current[i]
      popup.setLngLat(lngLat).addTo(map)
    }
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
    const entry = markersRef.current.find(m => m.placeId === id)
    if (entry) entry.popup.remove()
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