import { useState, useRef, useEffect } from 'react'
import IC from './Icons.jsx'

// ── Carga Google Maps SDK una sola vez ──────────────────────────────
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

export function loadGoogleMaps() {
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

// ── Puntuación calidad/precio ───────────────────────────────────────
export function qualityPriceScore(rating, price_level) {
  if (!rating) return null
  const weight = price_level != null ? [1, 1.5, 2.5, 3.5, 4.5][price_level] ?? 2.5 : 2.5
  return Math.round((rating / weight) * 10) / 10
}

// ── Estrellas ───────────────────────────────────────────────────────
export function StarRating({ rating }) {
  return (
    <span className="star-rating">
      {[1,2,3,4,5].map(i => <IC.Star key={i} filled={i <= Math.round(rating)} />)}
      <span className="rating-num">{rating?.toFixed(1)}</span>
    </span>
  )
}

// ── Nivel de precio ─────────────────────────────────────────────────
export function PriceLevel({ level }) {
  if (level == null) return null
  const signs = ['€','€€','€€€','€€€€']
  return <span className="price-level">{signs[level] || ''}</span>
}

// ── Badge calidad/precio ────────────────────────────────────────────
export function QualityPriceBadge({ rating, price_level }) {
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

// ── Select personalizado ────────────────────────────────────────────
export function CustomSelect({ value, onChange, options, placeholder }) {
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
