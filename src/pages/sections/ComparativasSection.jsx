import IC from '../../components/Icons.jsx'

export default function ComparativasSection({ active, savedComparativas, deleteComparativa, setSection, setShowCompareDrawer }) {
  return (
    <section className={`content-section${active ? ' active' : ''}`}>
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
                      <IC.Award /> <strong>{comp.analysis.ganador}</strong>
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
                          {r.recomendado_para && <span className="rec-for-tag"><IC.ChevronRight /> {r.recomendado_para}</span>}
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
  )
}
