import { useState } from 'react'
import IC from './Icons.jsx'
import { StarRating, PriceLevel, QualityPriceBadge, qualityPriceScore } from './utils.jsx'

export default function RankingsDrawer({ recsPlaces, recsLoading, prefs, isFavorite, toggleFavorite, setSelectedPlace, onClose }) {
  const [recsTab, setRecsTab] = useState('topRated')

  const sorted = [...recsPlaces].filter(p => p.rating)
  const topRated = [...sorted].sort((a, b) => b.rating - a.rating)
  const bestValue = [...sorted].sort((a, b) => (qualityPriceScore(b.rating, b.price_level) || 0) - (qualityPriceScore(a.rating, a.price_level) || 0))
  const forYou = [...sorted].filter(p => {
    if (prefs.vegano || prefs.vegetariano || prefs.sinGluten) return true
    return p.rating >= 4
  }).sort((a, b) => b.rating - a.rating)
  const list = recsTab === 'topRated' ? topRated : recsTab === 'bestValue' ? bestValue : forYou

  return (
    <>
      <div className="compare-drawer-overlay" onClick={onClose} />
      <div className="compare-drawer rankings-drawer">
        <div className="compare-drawer-header">
          <div>
            <h2><IC.Award /> Rankings</h2>
            <p>Los mejores restaurantes cerca de ti</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><IC.X /></button>
        </div>

        <div className="rankings-drawer-tabs">
          {[['topRated', 'Top Valorados'], ['bestValue', 'Mejor Cal/Precio'], ['forYou', 'Para Ti']].map(([tab, label]) => (
            <button key={tab} className={`rankings-tab${recsTab === tab ? ' active' : ''}`} onClick={() => setRecsTab(tab)}>
              {label}
            </button>
          ))}
        </div>

        <div className="compare-drawer-body">
          {recsLoading ? (
            <div className="rankings-loading">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
              </svg>
              <p>Cargando rankings...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="rankings-empty">
              <IC.Award />
              <h3>Sin datos aún</h3>
              <p>Busca restaurantes en el mapa para verlos aquí</p>
            </div>
          ) : list.map((place, i) => (
            <div
              key={place.place_id || i}
              className="rankings-item"
              onClick={() => place.place_id && !place.place_id.startsWith('nominatim_') && setSelectedPlace(place)}
            >
              <div className="rankings-rank">#{i + 1}</div>
              {place.photo_ref
                ? <img src={`/api/places/photo/${place.photo_ref}?w=80`} alt={place.name} className="rankings-photo" />
                : <div className="rankings-icon"><IC.Restaurant /></div>}
              <div className="rankings-info">
                <h4>{place.name}</h4>
                <div className="rankings-meta">
                  {place.rating && <StarRating rating={place.rating} />}
                  <PriceLevel level={place.price_level} />
                </div>
                {recsTab === 'bestValue' && <QualityPriceBadge rating={place.rating} price_level={place.price_level} />}
                <p className="rankings-address"><IC.Pin /> {place.address}</p>
              </div>
              <button
                className={`btn-fav${isFavorite(place) ? ' active' : ''}`}
                onClick={e => { e.stopPropagation(); toggleFavorite(place) }}
              >
                <IC.Heart filled={isFavorite(place)} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
