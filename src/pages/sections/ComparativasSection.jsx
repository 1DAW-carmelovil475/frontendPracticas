import { useState } from 'react'
import IC from '../../components/Icons.jsx'

const MODE_LABELS = {
  reviews: { label: 'Por reseñas',    color: '#f7b801',        bg: 'rgba(247,184,1,0.1)',  border: 'rgba(247,184,1,0.25)' },
  menu:    { label: 'Por menú',        color: 'var(--accent)',  bg: 'rgba(78,205,196,0.1)', border: 'rgba(78,205,196,0.25)' },
  both:    { label: 'Menú + reseñas', color: 'var(--primary)', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.25)' },
}

function TypeBadge({ mode }) {
  const m = MODE_LABELS[mode] || MODE_LABELS.reviews
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.22rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem',
      fontWeight: 700, background: m.bg, border: `1px solid ${m.border}`,
      color: m.color, whiteSpace: 'nowrap',
    }}>
      {mode === 'menu' ? <IC.File /> : mode === 'both' ? <IC.Sparkles /> : <IC.Star filled={true} />}
      {m.label}
    </span>
  )
}

function CompCard({ comp, idx, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const analysis = comp.analysis || {}

  return (
    <div className="saved-comp-card">
      {/* Fotos de restaurantes */}
      <div className="saved-comp-photos">
        {comp.places?.map((p, i) => (
          p.photo_ref
            ? <img key={i} src={`/api/places/photo/${p.photo_ref}?w=300`} alt={p.name} className="saved-comp-photo" />
            : <div key={i} className="saved-comp-photo-placeholder"><IC.Restaurant /></div>
        ))}
      </div>

      {/* Cuerpo de la card */}
      <div className="saved-comp-body">
        <div className="saved-comp-meta">
          <TypeBadge mode={comp.mode} />
          <span className="saved-comp-date">
            {comp.date ? new Date(comp.date).toLocaleDateString('es-ES', {
              day: '2-digit', month: 'short', year: 'numeric',
            }) : ''}
          </span>
        </div>

        {/* Nombres de los restaurantes */}
        <div className="saved-comp-names">
          {comp.places?.map((p, i) => (
            <span key={i} className="saved-comp-name-tag">
              {p.name}
              {p.rating && <span className="chip-rating"> ★{p.rating}</span>}
            </span>
          ))}
        </div>

        {/* Ganador */}
        {analysis.ganador && (
          <div className="saved-comp-winner">
            <IC.Award /> <strong>{analysis.ganador}</strong>
            {analysis.motivo_ganador && <span> — {analysis.motivo_ganador}</span>}
          </div>
        )}

        {/* Acciones */}
        <div className="saved-comp-actions">
          <button className="btn-comp-expand" onClick={() => setExpanded(e => !e)}>
            {expanded ? '▲ Ver menos' : '▼ Ver más'}
          </button>
          <button className="btn-fav-action danger" onClick={() => onDelete(idx)} title="Eliminar">
            <IC.Trash />
          </button>
        </div>
      </div>

      {/* Análisis expandido */}
      {expanded && (
        <div className="saved-comp-analysis">
          {analysis.resumen_general && (
            <p className="saved-comp-summary">{analysis.resumen_general}</p>
          )}
          {analysis.restaurantes?.length > 0 && (
            <div className="saved-comp-details">
              {analysis.restaurantes.map((r, i) => (
                <div key={i} className={`saved-comp-rest-item${r.nombre === analysis.ganador ? ' winner' : ''}`}>
                  <strong>{r.nombre}</strong>
                  {r.nombre === analysis.ganador && (
                    <span style={{ fontSize: '0.7rem', color: '#f7b801', fontWeight: 700 }}>★ Recomendado</span>
                  )}
                  {r.recomendado_para && (
                    <span className="rec-for-tag"><IC.ChevronRight /> {r.recomendado_para}</span>
                  )}
                  {r.opinion_reseñas && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>"{r.opinion_reseñas}"</p>
                  )}
                  {r.puntos_fuertes?.length > 0 && (
                    <div className="mini-pros">
                      {r.puntos_fuertes.slice(0, 3).map((p, j) => <span key={j} className="pro-tag mini">✓ {p}</span>)}
                    </div>
                  )}
                  {r.puntos_debiles?.length > 0 && (
                    <div className="mini-pros">
                      {r.puntos_debiles.slice(0, 2).map((p, j) => <span key={j} className="con-tag mini">✗ {p}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {analysis.conclusion && (
            <p className="saved-comp-conclusion">{analysis.conclusion}</p>
          )}
        </div>
      )}
    </div>
  )
}

const FILTERS = [
  { id: 'all',     label: 'Todas' },
  { id: 'reviews', label: 'Por reseñas' },
  { id: 'menu',    label: 'Por menú' },
  { id: 'both',    label: 'Menú + reseñas' },
]

export default function ComparativasSection({ active, savedComparativas, deleteComparativa, setSection, setShowCompareDrawer }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? savedComparativas
    : savedComparativas.filter(c => (c.mode || 'reviews') === filter)

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
          <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setSection('buscar')}>Ir a buscar</button>
        </div>
      ) : (
        <>
          <div className="comp-filter-bar">
            {FILTERS.map(f => {
              const count = f.id === 'all' ? null : savedComparativas.filter(c => (c.mode || 'reviews') === f.id).length
              return (
                <button key={f.id} className={`filter-pill${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>
                  {f.label}
                  {count !== null && count > 0 && <span className="filter-pill-count">{count}</span>}
                </button>
              )
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state" style={{ minHeight: '200px' }}>
              <IC.Bar />
              <p>No hay comparativas de este tipo</p>
            </div>
          ) : (
            <div className="saved-comparativas-grid">
              {filtered.map((comp) => {
                const realIdx = savedComparativas.indexOf(comp)
                return <CompCard key={realIdx} comp={comp} idx={realIdx} onDelete={deleteComparativa} />
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}
