import IC from '../../components/Icons.jsx'

export default function HistorialSection({ active, historial, clearHistorial, setSearchQuery, setSection, handleSearch, setSelectedPlace }) {
  return (
    <section className={`content-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div><h1>Historial</h1><p>Tus últimas búsquedas</p></div>
        {historial.length > 0 && <button className="btn-secondary" onClick={clearHistorial}>Limpiar historial</button>}
      </div>
      {historial.length === 0 ? (
        <div className="empty-state">
          <IC.Clock /><h3>Sin historial aún</h3><p>Tus búsquedas aparecerán aquí</p>
        </div>
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
  )
}
