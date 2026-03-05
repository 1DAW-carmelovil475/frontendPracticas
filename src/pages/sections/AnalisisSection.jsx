import IC from '../../components/Icons.jsx'

export default function AnalisisSection({ active, savedMenus, deleteMenu, setShowAnalysis }) {
  return (
    <section className={`content-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div>
          <h1>Análisis de Menús</h1>
          <p>{savedMenus.length} menú{savedMenus.length !== 1 ? 's' : ''} guardado{savedMenus.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAnalysis(true)}>
          <IC.Upload /> Analizar Nuevo Menú
        </button>
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
                  {(m.image || m.imageBase64)
                    ? <img src={m.image || m.imageBase64} alt={m.fileName} className="saved-menu-thumb" />
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
  )
}
