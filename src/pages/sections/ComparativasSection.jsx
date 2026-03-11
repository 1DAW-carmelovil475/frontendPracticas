import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import IC from '../../components/Icons.jsx'

const COLORS = ['#ff6b35', '#4ecdc4', '#f7b801']

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

function buildChartData(comp) {
  const places = comp.places || []
  const aiRests = comp.analysis?.restaurantes || []
  const names = places.map(p => p.name)
  const getAI = (name) => aiRests.find(r => r.nombre === name) || {}
  const kpis = []

  const r1 = { kpi: 'Valoración' }
  places.forEach(p => { r1[p.name] = p.rating ? +p.rating.toFixed(1) : 0 })
  kpis.push(r1)

  const r2 = { kpi: 'Popularidad' }
  places.forEach(p => {
    const n = p.user_ratings_total || 0
    r2[p.name] = n > 0 ? +(Math.min(5, Math.log10(n + 1) / Math.log10(10001) * 5)).toFixed(1) : 0
  })
  kpis.push(r2)

  const r3 = { kpi: 'Asequibilidad' }
  places.forEach(p => {
    const pl = p.price_level != null ? p.price_level : 2
    r3[p.name] = +((4 - pl) / 3 * 5).toFixed(1)
  })
  kpis.push(r3)

  // Fiabilidad: rating consistency + review volume = trustworthiness
  const r4 = { kpi: 'Fiabilidad' }
  places.forEach(p => {
    const ratScore = p.rating ? (p.rating / 5) * 0.55 : 0
    const n = p.user_ratings_total || 0
    const revScore = n > 0 ? (Math.log10(n + 1) / Math.log10(10001)) * 0.45 : 0
    r4[p.name] = +((ratScore + revScore) * 5).toFixed(1)
  })
  kpis.push(r4)

  if (aiRests.length > 0) {
    const r5 = { kpi: 'Puntos fuertes' }
    const r6 = { kpi: 'Menos puntos débiles' }
    places.forEach(p => {
      const ai = getAI(p.name)
      r5[p.name] = Math.min(5, ai.puntos_fuertes?.length || 0)
      r6[p.name] = Math.max(0, 5 - (ai.puntos_debiles?.length || 0))
    })
    kpis.push(r5)
    kpis.push(r6)
  }

  return { data: kpis, names }
}

// ── Drawer fijo (~65 vw desde la derecha) ────────────────────────
function CompDrawer({ comp, onClose }) {
  const analysis = comp.analysis || {}
  const { data: chartData, names } = buildChartData(comp)

  return (
    <div className="comp-drawer-fixed">
      {/* Header */}
      <div className="comp-drawer-fixed-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          <TypeBadge mode={comp.mode} />
          <span className="saved-comp-date">
            {comp.date ? new Date(comp.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
          </span>
          {comp.places?.map((p, i) => (
            <span key={i} className="saved-comp-name-tag" style={{ color: COLORS[i % COLORS.length] }}>
              {p.name}{p.rating && <span className="chip-rating"> ★{p.rating}</span>}
            </span>
          ))}
        </div>
        <button className="comp-drawer-close" onClick={onClose}><IC.X /></button>
      </div>

      {/* Body: izquierda = gráfico, derecha = detalles */}
      <div className="comp-drawer-fixed-body">

        {/* Columna izquierda: LineChart tall + narrow */}
        <div className="comp-drawer-chart-col">
          <div className="comp-drawer-chart-title">
            KPI <span style={{ fontWeight: 400, fontSize: '0.7rem', opacity: 0.55 }}>(0–5)</span>
          </div>
          <div className="comp-drawer-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis dataKey="kpi" stroke="var(--muted)" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis type="number" domain={[0, 5]} stroke="var(--muted)" tick={{ fontSize: 10 }} width={26} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '0.82rem' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.12)' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }} />
                {names.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: '#0f0f0f', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#0f0f0f' }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Columna derecha: detalles de la comparativa */}
        <div className="comp-drawer-detail-col">
          {/* Franja de fotos */}
          <div className="comp-drawer-photos">
            {comp.places?.map((p, i) => (
              p.photo_ref
                ? <img key={i} src={`/api/places/photo/${p.photo_ref}?w=500`} alt={p.name} className="comp-drawer-photo" />
                : <div key={i} className="comp-drawer-photo-placeholder"><IC.Restaurant /></div>
            ))}
          </div>

          <div className="comp-drawer-content">
            {analysis.ganador && (
              <div className="saved-comp-winner">
                <IC.Award /> <strong>{analysis.ganador}</strong>
                {analysis.motivo_ganador && <span> — {analysis.motivo_ganador}</span>}
              </div>
            )}

            {analysis.resumen_general && (
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text)' }}>{analysis.resumen_general}</p>
            )}

            {analysis.restaurantes?.length > 0 && (
              <div className="comp-drawer-details">
                {analysis.restaurantes.map((r, i) => (
                  <div key={i} className={`saved-comp-rest-item${r.nombre === analysis.ganador ? ' winner' : ''}`}>
                    <strong style={{ color: COLORS[i % COLORS.length] }}>{r.nombre}</strong>
                    {r.nombre === analysis.ganador && (
                      <span style={{ fontSize: '0.7rem', color: '#f7b801', fontWeight: 700 }}>★ Recomendado</span>
                    )}
                    {r.recomendado_para && (
                      <span className="rec-for-tag"><IC.ChevronRight /> {r.recomendado_para}</span>
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
        </div>
      </div>
    </div>
  )
}

// ── Card normal ───────────────────────────────────────────────────
function CompCard({ comp, idx, onDelete, onOpen }) {
  const analysis = comp.analysis || {}
  return (
    <div className="saved-comp-card">
      <div className="saved-comp-photos">
        {comp.places?.map((p, i) => (
          p.photo_ref
            ? <img key={i} src={`/api/places/photo/${p.photo_ref}?w=300`} alt={p.name} className="saved-comp-photo" />
            : <div key={i} className="saved-comp-photo-placeholder"><IC.Restaurant /></div>
        ))}
      </div>
      <div className="saved-comp-body">
        <div className="saved-comp-meta saved-comp-meta--type">
          <TypeBadge mode={comp.mode} />
        </div>
        <div className="saved-comp-names">
          {comp.places?.map((p, i) => (
            <span key={i} className="saved-comp-name-tag">
              {p.name}{p.rating && <span className="chip-rating"> ★{p.rating}</span>}
            </span>
          ))}
        </div>
        <div className="saved-comp-winner saved-comp-winner--card">
          {analysis.ganador && <><IC.Award /> <strong>{analysis.ganador}</strong></>}
        </div>
        <div className="saved-comp-actions">
          <button className="btn-comp-expand" onClick={() => onOpen(comp)}>Ver más</button>
          <button className="btn-fav-action danger" onClick={() => onDelete(idx)} title="Eliminar"><IC.Trash /></button>
        </div>
      </div>
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
  const [selectedComp, setSelectedComp] = useState(null)

  const filtered = filter === 'all'
    ? savedComparativas
    : savedComparativas.filter(c => (c.mode || 'reviews') === filter)

  const drawerOpen = !!selectedComp

  return (
    <section className={`content-section${active ? ' active' : ''}${drawerOpen ? ' comp-drawer-visible' : ''}`}>
      {drawerOpen && <CompDrawer comp={selectedComp} onClose={() => setSelectedComp(null)} />}

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
              <IC.Bar /><p>No hay comparativas de este tipo</p>
            </div>
          ) : (
            <div className="saved-comparativas-grid">
              {filtered.map((comp) => {
                const realIdx = savedComparativas.indexOf(comp)
                return (
                  <CompCard
                    key={realIdx}
                    comp={comp}
                    idx={realIdx}
                    onDelete={deleteComparativa}
                    onOpen={setSelectedComp}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}
