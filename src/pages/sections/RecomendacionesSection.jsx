import { useState } from 'react'
import IC from '../../components/Icons.jsx'
import { StarRating, PriceLevel, QualityPriceBadge, qualityPriceScore } from '../../components/utils.jsx'

export default function RecomendacionesSection({ active, recsPlaces, recsLoading, prefs, isFavorite, toggleFavorite, setSelectedPlace, setSection }) {
  const [recsTab, setRecsTab] = useState('topRated')

  return (
    <section className={`content-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div><h1>Rankings y Recomendaciones</h1><p>Los mejores restaurantes cerca de ti</p></div>
      </div>
      <div className="recs-tabs">
        {[['topRated','Top Valorados'],['bestValue','Mejor Calidad/Precio'],['forYou','Para Ti']].map(([tab, label]) => (
          <button key={tab} className={`recs-tab${recsTab === tab ? ' active' : ''}`} onClick={() => setRecsTab(tab)}>{label}</button>
        ))}
      </div>
      {recsLoading ? (
        <div className="empty-state">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin"><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
          <p>Cargando recomendaciones...</p>
        </div>
      ) : recsPlaces.length === 0 ? (
        <div className="empty-state">
          <IC.Award /><h3>Sin datos aún</h3>
          <p>Ve a Restaurantes, busca en tu zona y vuelve aquí para ver el ranking</p>
          <button className="btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setSection('buscar')}>Buscar restaurantes</button>
        </div>
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
  )
}
