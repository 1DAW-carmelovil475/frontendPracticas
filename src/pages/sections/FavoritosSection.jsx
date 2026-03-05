import IC from '../../components/Icons.jsx'
import { StarRating, PriceLevel } from '../../components/utils.jsx'

export default function FavoritosSection({ active, favorites, removeFavorite, setSelectedPlace, setSection }) {
  return (
    <section className={`content-section${active ? ' active' : ''}`}>
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
  )
}
