import { useState, useEffect } from 'react'
import IC from './Icons.jsx'
import { StarRating, PriceLevel } from './utils.jsx'

export default function RestaurantModal({ place, onClose, onToggleFavorite, isFav }) {
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
