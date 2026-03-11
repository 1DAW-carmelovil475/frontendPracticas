import IC from './Icons.jsx'

export default function SavedMenuModal({ menu, onClose }) {
  const a = menu.analysis || {}
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="analysis-modal">
        <div className="modal-header-bar">
          <div>
            <h2>{menu.fileName || 'Análisis de Menú'}</h2>
            {menu.restaurantName && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {menu.restaurantName}
              </p>
            )}
            {menu.date && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                {new Date(menu.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <button className="modal-close-btn" onClick={onClose}><IC.X /></button>
        </div>

        <div className="analysis-results">
          {(menu.image || menu.imageBase64) && (
            <div style={{ borderRadius: '10px', overflow: 'hidden', maxHeight: '200px' }}>
              <img
                src={menu.image || menu.imageBase64}
                alt="Menú"
                style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {a.recomendacion_general && (
            <div className="analysis-summary">
              <h4>Recomendación personalizada</h4>
              <p>{a.recomendacion_general}</p>
            </div>
          )}

          {a.alerta_alergenos && (
            <div className="analysis-alert">
              <IC.Info /> <strong>Alérgenos:</strong> {a.alerta_alergenos}
            </div>
          )}

          {a.platos?.length > 0 && (
            <>
              <h4>Platos detectados</h4>
              <div className="dishes-grid">
                {a.platos.map((p, i) => (
                  <div key={i} className={`dish-card${p.recomendado ? ' recommended' : ''}`}>
                    <div className="dish-header">
                      <span className="dish-name">{p.nombre}</span>
                      {p.precio && <span className="dish-price">{p.precio}</span>}
                      {p.recomendado && <span className="dish-badge"><IC.Check /> Recomendado</span>}
                    </div>
                    {p.descripcion && <p className="dish-desc">{p.descripcion}</p>}
                    {p.alergenos?.length > 0 && (
                      <div className="dish-tags">
                        {p.alergenos.map(a => <span key={a} className="tag alergeno">{a}</span>)}
                      </div>
                    )}
                    {p.apto_para?.length > 0 && (
                      <div className="dish-tags">
                        {p.apto_para.map(a => <span key={a} className="tag apto">{a}</span>)}
                      </div>
                    )}
                    {p.calorias_estimadas && <p className="dish-cal">~{p.calorias_estimadas} kcal</p>}
                    {p.motivo_recomendacion && <p className="dish-motivo">{p.motivo_recomendacion}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {a.resumen_nutricional && (
            <div className="analysis-summary">
              <h4>Resumen nutricional</h4>
              <p>{a.resumen_nutricional}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
