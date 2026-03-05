import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_bienvenida.css'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY
const DEFAULT_LAT = 37.3886
const DEFAULT_LNG = -5.9823
const DEFAULT_ZOOM = 13

const IC = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Heart: ({ filled }) => <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
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
  Star: ({ filled }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f7b801' : 'none'} stroke="#f7b801" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.29 6.29l1.14-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Globe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  ExternalLink: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Award: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Save: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Sparkles: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Scan: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>,
}

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

function StarRating({ rating }) {
  return (
    <span className="star-rating">
      {[1,2,3,4,5].map(i => <IC.Star key={i} filled={i <= Math.round(rating)} />)}
      <span className="rating-num">{rating?.toFixed(1)}</span>
    </span>
  )
}

function PriceLevel({ level }) {
  if (level == null) return null
  const signs = ['€','€€','€€€','€€€€']
  return <span className="price-level">{signs[level] || ''}</span>
}

function qualityPriceScore(rating, price_level) {
  if (!rating) return null
  const weight = price_level != null ? [1, 1.5, 2.5, 3.5, 4.5][price_level] ?? 2.5 : 2.5
  return Math.round((rating / weight) * 10) / 10
}

function QualityPriceBadge({ rating, price_level }) {
  const score = qualityPriceScore(rating, price_level)
  if (score === null) return null
  const label = score >= 3.5 ? 'Excelente' : score >= 2.5 ? 'Buena' : score >= 1.5 ? 'Aceptable' : 'Cara'
  const color = score >= 3.5 ? '#27ae60' : score >= 2.5 ? '#2980b9' : score >= 1.5 ? '#f39c12' : '#e74c3c'
  return (
    <span className="qp-badge" style={{ background: color + '22', color, border: `1px solid ${color}66` }}>
      {label} · {score.toFixed(1)}
    </span>
  )
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

// ── Modal restaurante ───────────────────────────────────────────────
function RestaurantModal({ place, onClose, onToggleFavorite, isFav }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!place?.place_id) { setLoading(false); return }
    fetch(`/api/places/details/${place.place_id}`)
      .then(r => r.json())
      .then(d => { setDetails(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [place?.place_id])

  const d = details || place
  const photoUrl = d?.photo_ref ? `/api/places/photo/${d.photo_ref}?w=600` : null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="restaurant-modal">
        {photoUrl && <div className="modal-photo" style={{ backgroundImage: `url(${photoUrl})` }} />}
        <div className="modal-body">
          <button className="modal-close-btn" onClick={onClose}><IC.X /></button>
          <div className="modal-title-row">
            <h2>{d?.name}</h2>
            <button className={`btn-fav-modal${isFav ? ' active' : ''}`} onClick={() => onToggleFavorite(place)}>
              <IC.Heart filled={isFav} />{isFav ? 'Guardado' : 'Guardar'}
            </button>
          </div>
          {(d?.rating || d?.price_level != null) && (
            <div className="modal-meta">
              {d?.rating && <StarRating rating={d.rating} />}
              {d?.user_ratings_total > 0 && <span className="muted-text">({d.user_ratings_total} reseñas)</span>}
              <PriceLevel level={d?.price_level} />
              {d?.open_now != null && (
                <span className={`open-badge ${d.open_now ? 'open' : 'closed'}`}>{d.open_now ? 'Abierto ahora' : 'Cerrado'}</span>
              )}
            </div>
          )}
          {loading && <p className="loading-text">Cargando detalles...</p>}
          <div className="modal-details-grid">
            {d?.address && <div className="detail-row"><IC.Pin /><span>{d.address}</span></div>}
            {d?.phone && <div className="detail-row"><IC.Phone /><span>{d.phone}</span></div>}
            {d?.website && <div className="detail-row"><IC.Globe /><a href={d.website} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'4px'}}>{d.website}<IC.ExternalLink /></a></div>}
          </div>
          {details?.opening_hours && (
            <div className="modal-hours">
              <h4>Horario</h4>
              <ul>{details.opening_hours.map((h, i) => <li key={i}>{h}</li>)}</ul>
            </div>
          )}
          {details?.reviews?.length > 0 && (
            <div className="modal-reviews">
              <h4>Reseñas de Google</h4>
              {details.reviews.map((rv, i) => (
                <div key={i} className="review-item">
                  {rv.photo && <img src={rv.photo} alt={rv.author} className="review-avatar" referrerPolicy="no-referrer" />}
                  <div className="review-content">
                    <div className="review-header">
                      <strong>{rv.author}</strong>
                      <StarRating rating={rv.rating} />
                      <span className="muted-text">{rv.time}</span>
                    </div>
                    <p>{rv.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Scanner de análisis de menú ─────────────────────────────────────
function MenuScannerAnimation({ fileName, imageUrl }) {
  const [phase, setPhase] = useState(0)
  const phases = [
    { label: 'Detectando platos...', progress: 15 },
    { label: 'Leyendo ingredientes...', progress: 35 },
    { label: 'Identificando alérgenos...', progress: 55 },
    { label: 'Calculando calorías...', progress: 72 },
    { label: 'Generando recomendaciones...', progress: 88 },
    { label: 'Finalizando análisis...', progress: 97 },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % phases.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  const current = phases[phase]

  return (
    <div className="scanner-container">
      <div className="scanner-frame">
        <div className="scanner-corners">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
        </div>
        <div className="scanner-line" />
        <div className="scanner-dots">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="scan-dot" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        {imageUrl
          ? <img src={imageUrl} alt="Menú" className="scanner-preview-img" />
          : <div className="scanner-icon-center"><IC.File /></div>
        }
      </div>

      <div className="scanner-info">
        <div className="scanner-phase-label">
          <IC.Sparkles />
          <span>{current.label}</span>
        </div>
        {fileName && <p className="scanner-filename">{fileName}</p>}
        <div className="scanner-progress-track">
          <div
            className="scanner-progress-fill"
            style={{ width: `${current.progress}%` }}
          />
          <span className="scanner-progress-pct">{current.progress}%</span>
        </div>
        <div className="scanner-particles">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="particle" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Modal análisis menú ─────────────────────────────────────────────
function MenuAnalysisModal({ onClose, token, userPrefs, onSaveMenu }) {
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [mimeType, setMimeType] = useState('image/jpeg')
  const [fileName, setFileName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [savedOk, setSavedOk] = useState(false)
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    setMimeType(file.type || 'image/jpeg')
    setFileName(file.name || 'menú.jpg')
    setImage(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = (e) => setImageBase64(e.target.result.split(',')[1])
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!imageBase64) return
    setAnalyzing(true); setError(null)
    try {
      const res = await fetch('/api/ai/analyze-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64, mimeType, userPrefs })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en el análisis')
      setAnalysis(data.analysis)
    } catch (err) { setError(err.message) }
    finally { setAnalyzing(false) }
  }

  const handleSave = () => {
    if (!analysis) return
    onSaveMenu({ image, fileName, analysis, date: new Date().toISOString() })
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 3000)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="analysis-modal">
        <div className="modal-header-bar">
          <h2>Análisis de Menú con IA</h2>
          <button className="modal-close-btn" onClick={onClose}><IC.X /></button>
        </div>
        {!analysis ? (
          <div className="analysis-upload">
            {analyzing ? (
              <MenuScannerAnimation fileName={fileName} imageUrl={image} />
            ) : (
              <div className={`upload-zone${image ? ' has-image' : ''}`} onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}>
                {image ? <img src={image} alt="Menú" className="preview-img" /> : <><IC.Upload /><p>Arrastra la foto del menú aquí o haz clic para seleccionar</p></>}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {error && <div className="analysis-error"><IC.Info /> {error}</div>}
            {!analyzing && (
              <button className="btn-primary btn-full" onClick={handleAnalyze} disabled={!imageBase64 || analyzing}>
                <IC.Scan />Analizar menú
              </button>
            )}
          </div>
        ) : (
          <div className="analysis-results">
            {analysis.recomendacion_general && <div className="analysis-summary"><h4>Recomendación personalizada</h4><p>{analysis.recomendacion_general}</p></div>}
            {analysis.alerta_alergenos && <div className="analysis-alert"><IC.Info /> <strong>Alérgenos:</strong> {analysis.alerta_alergenos}</div>}
            <h4>Platos detectados</h4>
            <div className="dishes-grid">
              {(analysis.platos || []).map((p, i) => (
                <div key={i} className={`dish-card${p.recomendado ? ' recommended' : ''}`}>
                  <div className="dish-header">
                    <span className="dish-name">{p.nombre}</span>
                    {p.precio && <span className="dish-price">{p.precio}</span>}
                    {p.recomendado && <span className="dish-badge"><IC.Check /> Recomendado</span>}
                  </div>
                  {p.descripcion && <p className="dish-desc">{p.descripcion}</p>}
                  {p.alergenos?.length > 0 && <div className="dish-tags">{p.alergenos.map(a => <span key={a} className="tag alergeno">{a}</span>)}</div>}
                  {p.apto_para?.length > 0 && <div className="dish-tags">{p.apto_para.map(a => <span key={a} className="tag apto">{a}</span>)}</div>}
                  {p.calorias_estimadas && <p className="dish-cal">~{p.calorias_estimadas} kcal</p>}
                  {p.motivo_recomendacion && <p className="dish-motivo">{p.motivo_recomendacion}</p>}
                </div>
              ))}
            </div>
            {analysis.resumen_nutricional && <div className="analysis-summary"><h4>Resumen nutricional</h4><p>{analysis.resumen_nutricional}</p></div>}
            <div className="analysis-actions-row">
              <button className="btn-secondary" onClick={() => { setAnalysis(null); setImage(null); setImageBase64(null); setSavedOk(false) }}>
                Analizar otro menú
              </button>
              <button className={`btn-save-footer${savedOk ? ' saved' : ''}`} onClick={handleSave} disabled={savedOk}>
                {savedOk ? <><IC.Check /> ¡Guardado!</> : <><IC.Save /> Guardar menú</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Panel lateral de comparación con IA ────────────────────────────
function CompareDrawer({ compareList, onClose, onRemove, onClear, token, onSave }) {
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    if (compareList.length < 2) { setAiAnalysis(null); return }
    generateAIAnalysis()
  }, [compareList.map(p => p.place_id || p.id).join(',')])

  const generateAIAnalysis = async () => {
    if (compareList.length < 2) return
    setLoadingAI(true); setAiError(null); setAiAnalysis(null)
    try {
      const restaurantData = compareList.map(p => ({
        nombre: p.name,
        rating: p.rating,
        user_ratings_total: p.user_ratings_total,
        price_level: p.price_level,
        address: p.address,
        open_now: p.open_now,
        reseñas: p.reviews?.map(r => r.text).filter(Boolean).slice(0, 3) || []
      }))

      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ restaurantes: restaurantData })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en el análisis')
      setAiAnalysis(data.analysis)
    } catch (err) {
      setAiError('No se pudo generar el análisis. ' + (err.message || 'Revisa tu conexión.'))
    } finally {
      setLoadingAI(false)
    }
  }

  const handleSave = () => {
    if (!aiAnalysis) return
    onSave({ places: compareList, analysis: aiAnalysis, date: new Date().toISOString() })
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 3000)
  }

  return (
    <>
      <div className="compare-drawer-overlay" onClick={onClose} />
      <div className="compare-drawer">
        {/* Header */}
        <div className="compare-drawer-header">
          <div>
            <h2>Comparativa IA</h2>
            <p>{compareList.length} restaurante{compareList.length !== 1 ? 's' : ''} seleccionado{compareList.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><IC.X /></button>
        </div>

        {/* Restaurantes seleccionados */}
        <div className="compare-drawer-places">
          {compareList.map((place, i) => (
            <div key={i} className="compare-drawer-place-chip">
              {place.photo_ref
                ? <img src={`/api/places/photo/${place.photo_ref}?w=60`} alt={place.name} className="chip-photo" />
                : <div className="chip-icon"><IC.Restaurant /></div>}
              <div className="chip-info">
                <span className="chip-name">{place.name}</span>
                {place.rating && <StarRating rating={place.rating} />}
              </div>
              <button className="chip-remove" onClick={() => onRemove(place)}><IC.X /></button>
            </div>
          ))}
          {compareList.length < 3 && (
            <div className="compare-drawer-add-hint">
              <span>+</span> Añade más desde Restaurantes (máx. 3)
            </div>
          )}
        </div>

        {compareList.length < 2 ? (
          <div className="compare-drawer-empty">
            <IC.Bar />
            <p>Selecciona al menos 2 restaurantes para comparar</p>
          </div>
        ) : (
          <div className="compare-drawer-body">
            {/* Análisis IA */}
            <div className="compare-ai-section">
              <div className="compare-ai-header">
                <IC.Sparkles />
                <h3>Análisis de la IA</h3>
                {!loadingAI && <button className="btn-refresh-ai" onClick={generateAIAnalysis} title="Regenerar análisis">↻</button>}
              </div>

              {loadingAI && (
                <div className="compare-ai-loading">
                  <div className="ai-loading-dots">
                    <span /><span /><span />
                  </div>
                  <p>Analizando reseñas y datos...</p>
                </div>
              )}

              {aiError && (
                <div className="analysis-error"><IC.Info /> {aiError}</div>
              )}

              {aiAnalysis && !loadingAI && (
                <div className="compare-ai-results">
                  {/* Resumen general */}
                  <div className="ai-summary-box">
                    <p>{aiAnalysis.resumen_general}</p>
                  </div>

                  {/* Por restaurante */}
                  {aiAnalysis.restaurantes?.map((r, i) => (
                    <div key={i} className={`ai-restaurant-card${r.nombre === aiAnalysis.ganador ? ' winner' : ''}`}>
                      {r.nombre === aiAnalysis.ganador && (
                        <div className="winner-badge">🏆 Recomendado</div>
                      )}
                      <h4>{r.nombre}</h4>

                      {/* Resumen de reseñas estilo Amazon */}
                      {(() => {
                        const place = compareList.find(p => p.name === r.nombre)
                        const total = place?.user_ratings_total || 0
                        const rating = place?.rating || 0
                        // Distribución estimada de estrellas basada en rating
                        const dist = [5,4,3,2,1].map(star => {
                          const diff = Math.abs(star - rating)
                          const raw = Math.max(0, 1 - diff * 0.4)
                          return raw
                        })
                        const sum = dist.reduce((a,b) => a+b, 0)
                        const pcts = dist.map(d => Math.round((d/sum)*100))
                        return total > 0 ? (
                          <div className="reviews-summary-box">
                            <div className="reviews-summary-title">
                              <IC.Star filled={true} /> Resumen de reseñas
                            </div>
                            <div className="reviews-rating-overview">
                              <div className="reviews-big-score">{rating.toFixed(1)}</div>
                              <div className="reviews-score-detail">
                                <StarRating rating={rating} />
                                <p>{total.toLocaleString()} reseñas en Google</p>
                              </div>
                              <div className="reviews-bars">
                                {[5,4,3,2,1].map((star, si) => (
                                  <div key={star} className="review-bar-row">
                                    <span>{star}★</span>
                                    <div className="review-bar-track">
                                      <div className="review-bar-fill" style={{ width: `${pcts[si]}%` }} />
                                    </div>
                                    <span className="review-bar-count">{pcts[si]}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {r.opinion_reseñas && (
                              <p className="reviews-summary-text">"{r.opinion_reseñas}"</p>
                            )}
                            {(r.puntos_fuertes?.length > 0 || r.puntos_debiles?.length > 0) && (
                              <div className="reviews-highlights" style={{marginTop:'0.75rem'}}>
                                <div className="reviews-highlights-title">Lo más mencionado</div>
                                <div className="reviews-sentiment-row">
                                  {r.puntos_fuertes?.map((p, j) => (
                                    <span key={j} className="sentiment-tag positive">✓ {p}</span>
                                  ))}
                                  {r.puntos_debiles?.map((p, j) => (
                                    <span key={j} className="sentiment-tag negative">✗ {p}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{marginBottom:'0.5rem'}}>
                            {r.opinion_reseñas && <p className="ai-reviews-opinion">💬 {r.opinion_reseñas}</p>}
                            <div className="ai-pros-cons">
                              {r.puntos_fuertes?.length > 0 && <div className="ai-pros">{r.puntos_fuertes.map((p,j) => <span key={j} className="pro-tag">✓ {p}</span>)}</div>}
                              {r.puntos_debiles?.length > 0 && <div className="ai-cons">{r.puntos_debiles.map((p,j) => <span key={j} className="con-tag">✗ {p}</span>)}</div>}
                            </div>
                          </div>
                        )
                      })()}

                      {r.recomendado_para && (
                        <p className="ai-rec-for">🎯 Ideal para: {r.recomendado_para}</p>
                      )}
                    </div>
                  ))}

                  {/* Conclusión */}
                  {aiAnalysis.conclusion && (
                    <div className="ai-conclusion-box">
                      <div className="ai-conclusion-label"><IC.Sparkles /> Conclusión</div>
                      <p>{aiAnalysis.conclusion}</p>
                      {aiAnalysis.motivo_ganador && (
                        <p className="ai-winner-reason">🏆 <strong>{aiAnalysis.ganador}</strong>: {aiAnalysis.motivo_ganador}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabla rápida */}
            <div className="compare-quick-table">
              <h3>Datos rápidos</h3>
              <div className="quick-table-grid" style={{ gridTemplateColumns: `120px repeat(${compareList.length}, 1fr)` }}>
                <div className="qt-header-cell" />
                {compareList.map((p, i) => (
                  <div key={i} className="qt-header-cell">{p.name}</div>
                ))}
                {[
                  ['Valoración', p => p.rating ? `⭐ ${p.rating}` : '—'],
                  ['Precio', p => p.price_level != null ? ['€','€€','€€€','€€€€'][p.price_level] : '—'],
                  ['Reseñas', p => p.user_ratings_total ? `${p.user_ratings_total}` : '—'],
                  ['Estado', p => p.open_now != null ? (p.open_now ? '🟢 Abierto' : '🔴 Cerrado') : '—'],
                  ['Cal/precio', p => { const s = qualityPriceScore(p.rating, p.price_level); return s ? `${s}` : '—' }],
                ].map(([label, fn]) => (
                  <>
                    <div className="qt-label-cell">{label}</div>
                    {compareList.map((p, i) => (
                      <div key={i} className="qt-value-cell">{fn(p)}</div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        )}

        {compareList.length > 0 && (
          <div className="compare-drawer-footer">
            <button className="btn-secondary" onClick={onClear}>Limpiar selección</button>
            {aiAnalysis && (
              <button
                className={`btn-save-footer${savedOk ? ' saved' : ''}`}
                onClick={handleSave}
                disabled={savedOk}
              >
                {savedOk ? <><IC.Check /> ¡Guardada!</> : <><IC.Save /> Guardar comparativa</>}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════════
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
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [filters, setFilters] = useState({ categoria: '', precio: '', distancia: '5000' })

  const [recsPlaces, setRecsPlaces] = useState([])
  const [recsLoading, setRecsLoading] = useState(false)
  const [recsTab, setRecsTab] = useState('topRated')

  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const infoWindowRef = useRef(null)
  const userLocationRef = useRef(null)
  const compareFetchedRef = useRef(new Set())
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsLoaded(true))
      .catch(err => console.error('Error cargando Google Maps:', err))
  }, [])

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u) { navigate('/login'); return }
    setUser(u)
    setNewNombre(u.nombre || '')
    const localFavs = JSON.parse(localStorage.getItem(`favorites_${u.id}`) || '[]')
    setFavorites(localFavs)
    const localHist = JSON.parse(localStorage.getItem(`historial_${u.id}`) || '[]')
    setHistorial(localHist)
    // Cargar comparativas — primero localStorage como cache, luego BD
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
    // Cargar menús — primero localStorage, luego BD (sin campo image que no se persiste)
    const localMenus = JSON.parse(localStorage.getItem(`menus_${u.id}`) || '[]')
    setSavedMenus(localMenus)
    fetch(`/api/menus-analizados/${u.id}`)
      .then(r => r.json())
      .then(({ menus }) => {
        if (menus?.length > 0) {
          // Mezclar: BD tiene los datos, localStorage puede tener la imagen (blob local)
          const merged = menus.map(m => {
            const local = localMenus.find(lm => lm.date === m.date && lm.fileName === m.fileName)
            return local ? { ...m, image: local.image } : m
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

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstance.current) return
    if (section !== 'buscar') return

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
        { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
        { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
        { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
        { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
        { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
        { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
        { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
        { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
        { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
        { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023747' }] },
        { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
        { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
        { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
        { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
      ],
    })

    infoWindowRef.current = new window.google.maps.InfoWindow()
    mapInstance.current = map

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const pos = { lat: coords.latitude, lng: coords.longitude }
          userLocationRef.current = pos
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

  useEffect(() => {
    if (section !== 'recomendaciones') return
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
  }, [section])

  const showSaved = (msg) => { setSavedOk(msg); setTimeout(() => setSavedOk(''), 3000) }
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }

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
    fetch(`/api/comparativas/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ comparativas: newComps })
    }).catch(() => {})
    showSaved('Comparativa guardada correctamente')
  }

  const deleteComparativa = (index) => {
    const newComps = savedComparativas.filter((_, i) => i !== index)
    setSavedComparativas(newComps)
    if (user) {
      localStorage.setItem(`comparativas_${user.id}`, JSON.stringify(newComps))
      fetch(`/api/comparativas/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ comparativas: newComps })
      }).catch(() => {})
    }
  }

  const handleSaveMenu = (menu) => {
    if (!user) return
    const newMenus = [menu, ...savedMenus].slice(0, 20)
    setSavedMenus(newMenus)
    localStorage.setItem(`menus_${user.id}`, JSON.stringify(newMenus))
    fetch(`/api/menus-analizados/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ menus: newMenus })
    }).catch(() => {})
    showSaved('Menú guardado correctamente')
  }

  const deleteMenu = (index) => {
    const newMenus = savedMenus.filter((_, i) => i !== index)
    setSavedMenus(newMenus)
    if (user) {
      localStorage.setItem(`menus_${user.id}`, JSON.stringify(newMenus))
      fetch(`/api/menus-analizados/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ menus: newMenus })
      }).catch(() => {})
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
    if (markersRef.current[i]) {
      window.google.maps.event.trigger(markersRef.current[i], 'click')
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

  const navLinks = [
    { id: 'buscar', label: 'Restaurantes', icon: <IC.Restaurant /> },
    { id: 'favoritos', label: 'Favoritos', icon: <IC.Heart filled={false} /> },
    { id: 'recomendaciones', label: 'Rankings', icon: <IC.Award /> },
    { id: 'comparativas', label: 'Comparativas', icon: <IC.Bar /> },
    { id: 'analisis', label: 'Análisis', icon: <IC.File /> },
    { id: 'historial', label: 'Historial', icon: <IC.Clock /> },
    { id: 'perfil', label: 'Perfil', icon: <IC.User /> },
    { id: 'configuracion', label: 'Ajustes', icon: <IC.Settings /> },
  ]

  return (
    <div className="dashboard-page">
      {savedOk && <div className="toast-success"><IC.Check />{savedOk}</div>}

      {selectedPlace && (
        <RestaurantModal place={selectedPlace} onClose={() => setSelectedPlace(null)}
          onToggleFavorite={toggleFavorite} isFav={isFavorite(selectedPlace)} token={token} />
      )}
      {showAnalysis && (
        <MenuAnalysisModal onClose={() => setShowAnalysis(false)} token={token} userPrefs={prefs} onSaveMenu={handleSaveMenu} />
      )}

      {/* Compare Drawer */}
      {showCompareDrawer && (
        <CompareDrawer
          compareList={compareList}
          onClose={() => setShowCompareDrawer(false)}
          onRemove={removeFromCompare}
          onClear={() => { setCompareList([]); setShowCompareDrawer(false) }}
          token={token}
          onSave={handleSaveComparativa}
        />
      )}

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
                {searching
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin"><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
                  : <IC.Search />}
              </button>
            </div>
            <div className="filters-section">
              <CustomSelect value={filters.categoria} onChange={v => setFilters(f => ({...f, categoria: f.categoria === v ? '' : v}))} placeholder="Categoría" options={[{value:'italiana',label:'Italiana'},{value:'mexicana',label:'Mexicana'},{value:'japonesa',label:'Japonesa'},{value:'china',label:'China'},{value:'asiatica',label:'Asiática'},{value:'espanola',label:'Española'},{value:'americana',label:'Americana'},{value:'saludable',label:'Saludable'},{value:'vegetariana',label:'Vegetariana'}]} />
              <CustomSelect value={filters.precio} onChange={v => setFilters(f => ({...f, precio: f.precio === v ? '' : v}))} placeholder="Precio" options={[{value:'1',label:'€ Solo baratos'},{value:'2',label:'€€ Moderados'},{value:'3',label:'€€€ Caros'},{value:'4',label:'€€€€ Muy caros'}]} />
              <CustomSelect value={filters.distancia} onChange={v => setFilters(f => ({...f, distancia: v}))} placeholder="Distancia" options={[{value:'500',label:'Menos de 500m'},{value:'1000',label:'Menos de 1km'},{value:'2000',label:'Menos de 2km'},{value:'5000',label:'Menos de 5km'},{value:'10000',label:'Menos de 10km'},{value:'20000',label:'Menos de 20km'},{value:'50000',label:'Menos de 50km'}]} />
            </div>
            {/* Botón comparar — ahora abre el drawer */}
            <button className="btn-compare" onClick={() => setShowCompareDrawer(true)}>
              <IC.Bar />Comparar con IA {compareList.length > 0 && `(${compareList.length})`}
            </button>
          </div>
          <div className="results-list">
            <h3>{searchResults.length > 0 ? `${searchResults.length} resultados` : 'Resultados cercanos'}</h3>
            <div className="restaurant-list">
              {searching && <p className="no-results">Buscando...</p>}
              {!searching && searchResults.length === 0 && <p className="no-results">Realiza una búsqueda para ver restaurantes</p>}
              {!searching && searchResults.map((place, i) => (
                <div key={place.place_id || place.id || i}
                  className={`restaurant-item${isInCompare(place) ? ' in-compare' : ''}`}
                  onClick={() => handleResultClick(place, i)}>
                  {place.photo_ref
                    ? <img src={`/api/places/photo/${place.photo_ref}?w=80`} alt={place.name} style={{width:'46px',height:'46px',objectFit:'cover',borderRadius:'8px',flexShrink:0}} />
                    : <div className="restaurant-icon-svg"><IC.Restaurant /></div>}
                  <div className="restaurant-info">
                    <h4>{place.name}</h4>
                    <p>{place.address}</p>
                    {place.rating && <div className="result-meta"><StarRating rating={place.rating} /><PriceLevel level={place.price_level} /></div>}
                  </div>
                  <div className="result-actions">
                    <button className={`btn-fav${isFavorite(place) ? ' active' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleFavorite(place) }}>
                      <IC.Heart filled={isFavorite(place)} />
                    </button>
                    <button className={`btn-add-compare${isInCompare(place) ? ' active' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleCompare(place) }}>
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
          <div className="map-container">
            <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}>
              {!mapsLoaded && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#1a1a1a', color:'#aaa', fontSize:'0.95rem' }}>
                  Cargando Google Maps...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAVORITOS */}
        <section className={`content-section${section === 'favoritos' ? ' active' : ''}`}>
          <div className="section-header">
            <div>
              <h1>Mis Favoritos</h1>
              <p>{favorites.length} {favorites.length === 1 ? 'restaurante guardado' : 'restaurantes guardados'}</p>
            </div>
          </div>
          {favorites.length === 0 ? (
            <div className="empty-state">
              <IC.Heart filled={false} />
              <h3>No tienes favoritos aún</h3>
              <p>Busca restaurantes y pulsa el corazón para guardarlos aquí</p>
              <button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setSection('buscar')}>Buscar restaurantes</button>
            </div>
          ) : (
            <div className="favorites-grid">
              {favorites.map((f, i) => {
                const canOpen = f.place_id && !f.place_id.startsWith('nominatim_')
                return (
                  <div key={i} className="fav-card" onClick={() => canOpen && setSelectedPlace(f)}>
                    <div className="fav-card-photo-wrap">
                      {f.photo_ref
                        ? <img src={`/api/places/photo/${f.photo_ref}?w=400`} alt={f.name} className="fav-card-photo" />
                        : <div className="fav-card-photo-placeholder"><IC.Restaurant /></div>}
                      {f.open_now != null && (
                        <span className={`fav-open-badge ${f.open_now ? 'open' : 'closed'}`}>
                          {f.open_now ? 'Abierto' : 'Cerrado'}
                        </span>
                      )}
                    </div>
                    <div className="fav-card-body">
                      <div className="fav-card-title-row">
                        <h4>{f.name}</h4>
                        {f.price_level != null && <PriceLevel level={f.price_level} />}
                      </div>
                      {f.rating && (
                        <div className="fav-card-rating">
                          <StarRating rating={f.rating} />
                          {f.user_ratings_total > 0 && <span className="muted-text">({f.user_ratings_total})</span>}
                        </div>
                      )}
                      <p className="fav-card-address"><IC.Pin /> {f.address || 'Sin dirección'}</p>
                    </div>
                    <div className="fav-card-footer">
                      {f.savedAt && (
                        <span className="fav-date">
                          <IC.Clock /> {new Date(f.savedAt).toLocaleDateString('es-ES', {day:'2-digit',month:'short',year:'numeric'})}
                        </span>
                      )}
                      <div className="fav-card-actions">
                        {canOpen && (
                          <button className="btn-fav-action" title="Ver detalles" onClick={e => { e.stopPropagation(); setSelectedPlace(f) }}>
                            <IC.Info />
                          </button>
                        )}
                        <button className="btn-fav-action danger" title="Eliminar de favoritos" onClick={e => { e.stopPropagation(); removeFavorite(f) }}>
                          <IC.Trash />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* COMPARATIVAS GUARDADAS */}
        <section className={`content-section${section === 'comparativas' ? ' active' : ''}`}>
          <div className="section-header">
            <div>
              <h1>Comparativas Guardadas</h1>
              <p>{savedComparativas.length} comparativa{savedComparativas.length !== 1 ? 's' : ''} guardada{savedComparativas.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn-primary" onClick={() => { setSection('buscar'); setTimeout(() => setShowCompareDrawer(true), 100) }}>
              <IC.Bar /> Nueva comparativa
            </button>
          </div>

          {savedComparativas.length === 0 ? (
            <div className="empty-state">
              <IC.Bar />
              <h3>Sin comparativas guardadas</h3>
              <p>Ve a <strong>Restaurantes</strong>, selecciona varios con <strong>+</strong> y pulsa <strong>Comparar con IA</strong></p>
              <button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setSection('buscar')}>Ir a buscar</button>
            </div>
          ) : (
            <div className="saved-comparativas-list">
              {savedComparativas.map((comp, idx) => (
                <div key={idx} className="saved-comp-card">
                  <div className="saved-comp-header">
                    <div className="saved-comp-places">
                      {comp.places?.map((p, i) => (
                        <span key={i} className="saved-comp-place-chip">
                          {p.photo_ref
                            ? <img src={`/api/places/photo/${p.photo_ref}?w=40`} alt={p.name} />
                            : <span className="chip-placeholder"><IC.Restaurant /></span>}
                          {p.name}
                          {p.rating && <span className="chip-rating">⭐{p.rating}</span>}
                        </span>
                      ))}
                    </div>
                    <div className="saved-comp-actions">
                      <span className="saved-comp-date">
                        {comp.date ? new Date(comp.date).toLocaleDateString('es-ES', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}
                      </span>
                      <button className="btn-fav-action danger" onClick={() => deleteComparativa(idx)} title="Eliminar">
                        <IC.Trash />
                      </button>
                    </div>
                  </div>

                  {comp.analysis && (
                    <div className="saved-comp-analysis">
                      {comp.analysis.resumen_general && (
                        <p className="saved-comp-summary">{comp.analysis.resumen_general}</p>
                      )}
                      {comp.analysis.ganador && (
                        <div className="saved-comp-winner">
                          🏆 <strong>{comp.analysis.ganador}</strong>
                          {comp.analysis.motivo_ganador && <span> — {comp.analysis.motivo_ganador}</span>}
                        </div>
                      )}
                      {comp.analysis.conclusion && (
                        <p className="saved-comp-conclusion">{comp.analysis.conclusion}</p>
                      )}
                      {comp.analysis.restaurantes?.length > 0 && (
                        <div className="saved-comp-details">
                          {comp.analysis.restaurantes.map((r, i) => (
                            <div key={i} className={`saved-comp-rest-item${r.nombre === comp.analysis.ganador ? ' winner' : ''}`}>
                              <strong>{r.nombre}</strong>
                              {r.recomendado_para && <span className="rec-for-tag">🎯 {r.recomendado_para}</span>}
                              {r.puntos_fuertes?.length > 0 && (
                                <div className="mini-pros">
                                  {r.puntos_fuertes.slice(0, 2).map((p, j) => <span key={j} className="pro-tag mini">✓ {p}</span>)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECOMENDACIONES / RANKINGS */}
        <section className={`content-section${section === 'recomendaciones' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Rankings y Recomendaciones</h1><p>Los mejores restaurantes cerca de ti</p></div>
          </div>
          <div className="recs-tabs">
            {[['topRated','Top Valorados'],['bestValue','Mejor Calidad/Precio'],['forYou','Para Ti']].map(([tab, label]) => (
              <button key={tab} className={`recs-tab${recsTab === tab ? ' active' : ''}`} onClick={() => setRecsTab(tab)}>{label}</button>
            ))}
          </div>
          {recsLoading ? (
            <div className="empty-state"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin"><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg><p>Cargando recomendaciones...</p></div>
          ) : recsPlaces.length === 0 ? (
            <div className="empty-state"><IC.Award /><h3>Sin datos aún</h3><p>Ve a Restaurantes, busca en tu zona y vuelve aquí para ver el ranking</p><button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setSection('buscar')}>Buscar restaurantes</button></div>
          ) : (() => {
            const sorted = [...recsPlaces].filter(p => p.rating)
            const topRated = [...sorted].sort((a, b) => b.rating - a.rating)
            const bestValue = [...sorted].sort((a, b) => (qualityPriceScore(b.rating, b.price_level) || 0) - (qualityPriceScore(a.rating, a.price_level) || 0))
            const forYou = [...sorted].filter(p => {
              if (prefs.vegano || prefs.vegetariano) return true
              if (prefs.sinGluten) return true
              return p.rating >= 4
            }).sort((a, b) => b.rating - a.rating)
            const list = recsTab === 'topRated' ? topRated : recsTab === 'bestValue' ? bestValue : forYou
            return (
              <div className="recs-grid">
                {list.map((place, i) => (
                  <div key={place.place_id || i} className="rec-card" onClick={() => place.place_id && !place.place_id.startsWith('nominatim_') && setSelectedPlace(place)}>
                    <div className="rec-rank">#{i + 1}</div>
                    <div className="rec-photo-wrap">
                      {place.photo_ref
                        ? <img src={`/api/places/photo/${place.photo_ref}?w=300`} alt={place.name} className="rec-photo" />
                        : <div className="rec-photo-placeholder"><IC.Restaurant /></div>}
                    </div>
                    <div className="rec-body">
                      <h4>{place.name}</h4>
                      <div className="rec-meta">
                        {place.rating && <StarRating rating={place.rating} />}
                        <PriceLevel level={place.price_level} />
                      </div>
                      {recsTab === 'bestValue' && <QualityPriceBadge rating={place.rating} price_level={place.price_level} />}
                      <p className="rec-address"><IC.Pin /> {place.address}</p>
                    </div>
                    <div className="rec-actions">
                      <button className={`btn-fav${isFavorite(place) ? ' active' : ''}`} onClick={e => { e.stopPropagation(); toggleFavorite(place) }}>
                        <IC.Heart filled={isFavorite(place)} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </section>

        {/* ANÁLISIS */}
        <section className={`content-section${section === 'analisis' ? ' active' : ''}`}>
          <div className="section-header">
            <div>
              <h1>Análisis de Menús</h1>
              <p>{savedMenus.length} menú{savedMenus.length !== 1 ? 's' : ''} guardado{savedMenus.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn-primary" onClick={() => setShowAnalysis(true)}><IC.Upload /> Analizar Nuevo Menú</button>
          </div>
          {savedMenus.length === 0 ? (
            <div className="empty-state">
              <IC.File /><h3>Analiza menús con IA</h3>
              <p>Sube una foto del menú para obtener información nutricional, alérgenos y recomendaciones personalizadas</p>
              <button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setShowAnalysis(true)}>Subir foto de menú</button>
            </div>
          ) : (
            <div className="saved-menus-list">
              {savedMenus.map((m, idx) => (
                <div key={idx} className="saved-menu-card">
                  <div className="saved-menu-header">
                    <div className="saved-menu-thumb-wrap">
                      {m.image
                        ? <img src={m.image} alt={m.fileName} className="saved-menu-thumb" />
                        : <div className="saved-menu-thumb-placeholder"><IC.File /></div>}
                    </div>
                    <div className="saved-menu-meta">
                      <span className="saved-menu-filename">{m.fileName || 'Menú sin nombre'}</span>
                      <span className="saved-menu-date">
                        <IC.Clock /> {m.date ? new Date(m.date).toLocaleDateString('es-ES', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}
                      </span>
                      {m.analysis?.recomendacion_general && (
                        <p className="saved-menu-rec">{m.analysis.recomendacion_general}</p>
                      )}
                    </div>
                    <div className="saved-menu-actions">
                      <span className="saved-menu-count">{m.analysis?.platos?.length || 0} platos</span>
                      <button className="btn-fav-action danger" onClick={() => deleteMenu(idx)} title="Eliminar"><IC.Trash /></button>
                    </div>
                  </div>
                  {m.analysis?.platos?.length > 0 && (
                    <div className="saved-menu-dishes">
                      {m.analysis.platos.slice(0, 4).map((p, i) => (
                        <div key={i} className={`saved-menu-dish-chip${p.adaptado ? ' adapted' : ''}`}>
                          <span>{p.nombre}</span>
                          {p.precio && <span className="chip-rating">{p.precio}</span>}
                        </div>
                      ))}
                      {m.analysis.platos.length > 4 && (
                        <span className="saved-menu-more">+{m.analysis.platos.length - 4} más</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* HISTORIAL */}
        <section className={`content-section${section === 'historial' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Historial</h1><p>Tus últimas búsquedas</p></div>
            {historial.length > 0 && <button className="btn-secondary" onClick={clearHistorial}>Limpiar historial</button>}
          </div>
          {historial.length === 0 ? (
            <div className="empty-state"><IC.Clock /><h3>Sin historial aún</h3><p>Tus búsquedas aparecerán aquí</p></div>
          ) : (
            <div className="historial-list">
              {historial.map((h, i) => (
                <div key={i} className="historial-item" onClick={() => { setSearchQuery(h.query); setSection('buscar'); handleSearch(h.query) }}>
                  {h.place?.photo_ref
                    ? <img src={`/api/places/photo/${h.place.photo_ref}?w=80`} alt={h.place.name} className="historial-thumb" />
                    : <div className="historial-icon"><IC.Search /></div>}
                  <div className="historial-info">
                    <span className="historial-query">{h.query}</span>
                    {h.restaurante && <span className="historial-restaurante">{h.restaurante}</span>}
                    {h.place?.rating && <span className="historial-rating"><IC.Star filled={true} /> {h.place.rating}</span>}
                  </div>
                  <div className="historial-fecha-actions">
                    <div className="historial-fecha">{h.fecha ? new Date(h.fecha).toLocaleDateString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : ''}</div>
                    {h.place?.place_id && !h.place.place_id.startsWith('nominatim_') && (
                      <button className="btn-hist-open" title="Ver detalles" onClick={e => { e.stopPropagation(); setSelectedPlace(h.place); setSection('buscar') }}>
                        <IC.Info />
                      </button>
                    )}
                  </div>
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
                <label className="checkbox-label"><input type="checkbox" checked={ajustes.notificaciones?.nuevosRestaurantes ?? true} onChange={e => setAjustes(a => ({...a,notificaciones:{...a.notificaciones,nuevosRestaurantes:e.target.checked}}))} /><span>Nuevos restaurantes cerca</span></label>
                <label className="checkbox-label"><input type="checkbox" checked={ajustes.notificaciones?.ofertas ?? true} onChange={e => setAjustes(a => ({...a,notificaciones:{...a.notificaciones,ofertas:e.target.checked}}))} /><span>Ofertas y promociones</span></label>
                <label className="checkbox-label"><input type="checkbox" checked={ajustes.notificaciones?.recordatorios ?? false} onChange={e => setAjustes(a => ({...a,notificaciones:{...a.notificaciones,recordatorios:e.target.checked}}))} /><span>Recordatorios semanales</span></label>
              </div>
              <button className="btn-primary" onClick={saveAjustes}>Guardar</button>
            </div>
            <div className="profile-card">
              <h3><IC.Lock /> Privacidad</h3>
              <div className="preferences-grid">
                <label className="checkbox-label"><input type="checkbox" checked={ajustes.privacidad?.geolocalizacion ?? true} onChange={e => setAjustes(a => ({...a,privacidad:{...a.privacidad,geolocalizacion:e.target.checked}}))} /><span>Permitir geolocalización</span></label>
                <label className="checkbox-label"><input type="checkbox" checked={ajustes.privacidad?.guardarHistorial ?? true} onChange={e => setAjustes(a => ({...a,privacidad:{...a.privacidad,guardarHistorial:e.target.checked}}))} /><span>Guardar historial de búsquedas</span></label>
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
                  <p style={{color:'var(--muted)',fontSize:'0.9rem',marginBottom:'1rem'}}>Tu contraseña está protegida.</p>
                  <button className="btn-secondary" onClick={() => setEditingPassword(true)}>Cambiar contraseña</button>
                </div>
              )}
            </div>
            <div className="profile-card danger-zone">
              <h3>Zona de peligro</h3>
              <p style={{color:'var(--muted)',fontSize:'0.875rem',marginBottom:'1rem'}}>Estas acciones son permanentes.</p>
              <button className="btn-danger" onClick={() => { if (confirm('¿Limpiar todo el historial?')) { clearHistorial(); showSaved('Historial eliminado') } }}>Limpiar historial de búsquedas</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Bienvenida