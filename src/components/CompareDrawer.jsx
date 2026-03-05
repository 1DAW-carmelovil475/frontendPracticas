import { useState, useEffect, useRef } from 'react'
import IC from './Icons.jsx'
import { StarRating, qualityPriceScore } from './utils.jsx'

export default function CompareDrawer({ compareList, onClose, onRemove, onClear, token, onSave }) {
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [savedOk, setSavedOk] = useState(false)
  const drawerRef = useRef(null)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (compareList.length < 2) { setAiAnalysis(null); return }
    generateAIAnalysis()
  }, [compareList.map(p => p.place_id || p.id).join(',')])

  const generateAIAnalysis = async () => {
    if (compareList.length < 2) return
    setLoadingAI(true); setAiError(null); setAiAnalysis(null)
    try {
      const restaurantData = compareList.map(p => ({
        nombre: p.name,
        rating: p.rating,
        user_ratings_total: p.user_ratings_total,
        price_level: p.price_level,
        address: p.address,
        open_now: p.open_now,
        reseñas: p.reviews?.map(r => r.text).filter(Boolean).slice(0, 3) || []
      }))
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ restaurantes: restaurantData })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en el análisis')
      setAiAnalysis(data.analysis)
    } catch (err) {
      setAiError('No se pudo generar el análisis. ' + (err.message || 'Revisa tu conexión.'))
    } finally {
      setLoadingAI(false)
    }
  }

  const handleSave = () => {
    if (!aiAnalysis) return
    onSave({ places: compareList, analysis: aiAnalysis, date: new Date().toISOString() })
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 3000)
  }

  return (
    <>
      <div className="compare-drawer-overlay" onClick={onClose} />
      <div className="compare-drawer" ref={drawerRef}>
        {/* Header */}
        <div className="compare-drawer-header">
          <div>
            <h2>Comparativa IA</h2>
            <p>{compareList.length} restaurante{compareList.length !== 1 ? 's' : ''} seleccionado{compareList.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}><IC.X /></button>
        </div>

        {/* Restaurantes seleccionados */}
        <div className="compare-drawer-places">
          {compareList.map((place, i) => (
            <div key={i} className="compare-drawer-place-chip">
              {place.photo_ref
                ? <img src={`/api/places/photo/${place.photo_ref}?w=60`} alt={place.name} className="chip-photo" />
                : <div className="chip-icon"><IC.Restaurant /></div>}
              <div className="chip-info">
                <span className="chip-name">{place.name}</span>
                {place.rating && <StarRating rating={place.rating} />}
              </div>
              <button className="chip-remove" onClick={() => onRemove(place)}><IC.X /></button>
            </div>
          ))}
          {compareList.length < 3 && (
            <div className="compare-drawer-add-hint">
              <span>+</span> Añade más desde Restaurantes (máx. 3)
            </div>
          )}
        </div>

        {compareList.length < 2 ? (
          <div className="compare-drawer-empty">
            <IC.Bar />
            <p>Selecciona al menos 2 restaurantes para comparar</p>
          </div>
        ) : (
          <div className="compare-drawer-body" ref={bodyRef}>
            {/* Análisis IA */}
            <div className="compare-ai-section">
              <div className="compare-ai-header">
                <IC.Sparkles />
                <h3>Análisis de la IA</h3>
                {!loadingAI && <button className="btn-refresh-ai" onClick={generateAIAnalysis} title="Regenerar análisis">↻</button>}
              </div>

              {loadingAI && (
                <div className="compare-ai-loading">
                  <div className="ai-loading-dots"><span /><span /><span /></div>
                  <p>Analizando reseñas y datos...</p>
                </div>
              )}

              {aiError && <div className="analysis-error"><IC.Info /> {aiError}</div>}

              {aiAnalysis && !loadingAI && (
                <div className="compare-ai-results">
                  {/* Resumen general */}
                  <div className="ai-summary-box">
                    <p>{aiAnalysis.resumen_general}</p>
                  </div>

                  {/* Por restaurante */}
                  {aiAnalysis.restaurantes?.map((r, i) => (
                    <div key={i} className={`ai-restaurant-card${r.nombre === aiAnalysis.ganador ? ' winner' : ''}`}>
                      {r.nombre === aiAnalysis.ganador && (
                        <div className="winner-badge"><IC.Award /> Recomendado</div>
                      )}
                      <h4>{r.nombre}</h4>

                      {(() => {
                        const place = compareList.find(p => p.name === r.nombre)
                        const total = place?.user_ratings_total || 0
                        const rating = place?.rating || 0
                        const dist = [5,4,3,2,1].map(star => {
                          const diff = Math.abs(star - rating)
                          const raw = Math.max(0, 1 - diff * 0.4)
                          return raw
                        })
                        const sum = dist.reduce((a,b) => a+b, 0)
                        const pcts = dist.map(d => Math.round((d/sum)*100))
                        return total > 0 ? (
                          <div className="reviews-summary-box">
                            <div className="reviews-summary-title">
                              <IC.Star filled={true} /> Resumen de reseñas
                            </div>
                            <div className="reviews-rating-overview">
                              <div className="reviews-big-score">{rating.toFixed(1)}</div>
                              <div className="reviews-score-detail">
                                <StarRating rating={rating} />
                                <p>{total.toLocaleString()} reseñas en Google</p>
                              </div>
                              <div className="reviews-bars">
                                {[5,4,3,2,1].map((star, si) => (
                                  <div key={star} className="review-bar-row">
                                    <span>{star}<IC.Star filled={true} /></span>
                                    <div className="review-bar-track">
                                      <div className="review-bar-fill" style={{ width: `${pcts[si]}%` }} />
                                    </div>
                                    <span className="review-bar-count">{pcts[si]}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {r.opinion_reseñas && (
                              <p className="reviews-summary-text">"{r.opinion_reseñas}"</p>
                            )}
                            {(r.puntos_fuertes?.length > 0 || r.puntos_debiles?.length > 0) && (
                              <div className="reviews-highlights" style={{marginTop:'0.75rem'}}>
                                <div className="reviews-highlights-title">Lo más mencionado</div>
                                <div className="reviews-sentiment-row">
                                  {r.puntos_fuertes?.map((p, j) => (
                                    <span key={j} className="sentiment-tag positive">✓ {p}</span>
                                  ))}
                                  {r.puntos_debiles?.map((p, j) => (
                                    <span key={j} className="sentiment-tag negative">✗ {p}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{marginBottom:'0.5rem'}}>
                            {r.opinion_reseñas && <p className="ai-reviews-opinion">{r.opinion_reseñas}</p>}
                            <div className="ai-pros-cons">
                              {r.puntos_fuertes?.length > 0 && <div className="ai-pros">{r.puntos_fuertes.map((p,j) => <span key={j} className="pro-tag">✓ {p}</span>)}</div>}
                              {r.puntos_debiles?.length > 0 && <div className="ai-cons">{r.puntos_debiles.map((p,j) => <span key={j} className="con-tag">✗ {p}</span>)}</div>}
                            </div>
                          </div>
                        )
                      })()}

                      {r.recomendado_para && (
                        <p className="ai-rec-for"><IC.ChevronRight /> Ideal para: {r.recomendado_para}</p>
                      )}
                    </div>
                  ))}

                  {/* Conclusión */}
                  {aiAnalysis.conclusion && (
                    <div className="ai-conclusion-box">
                      <div className="ai-conclusion-label"><IC.Sparkles /> Conclusión</div>
                      <p>{aiAnalysis.conclusion}</p>
                      {aiAnalysis.motivo_ganador && (
                        <p className="ai-winner-reason"><IC.Award /> <strong>{aiAnalysis.ganador}</strong>: {aiAnalysis.motivo_ganador}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabla rápida */}
            <div className="compare-quick-table">
              <h3>Datos rápidos</h3>
              <div className="quick-table-grid" style={{ gridTemplateColumns: `120px repeat(${compareList.length}, 1fr)` }}>
                <div className="qt-header-cell" />
                {compareList.map((p, i) => (
                  <div key={i} className="qt-header-cell">{p.name}</div>
                ))}
                {[
                  ['Valoración', p => p.rating ? `${p.rating}` : '—'],
                  ['Precio', p => p.price_level != null ? ['€','€€','€€€','€€€€'][p.price_level] : '—'],
                  ['Reseñas', p => p.user_ratings_total ? `${p.user_ratings_total}` : '—'],
                  ['Estado', p => p.open_now != null ? (p.open_now ? <span style={{color:'#22c55e'}}>● Abierto</span> : <span style={{color:'#e74c3c'}}>● Cerrado</span>) : '—'],
                  ['Cal/precio', p => { const s = qualityPriceScore(p.rating, p.price_level); return s ? `${s}` : '—' }],
                ].map(([label, fn]) => (
                  <>
                    <div className="qt-label-cell">{label}</div>
                    {compareList.map((p, i) => (
                      <div key={i} className="qt-value-cell">{fn(p)}</div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        )}

        {compareList.length > 0 && (
          <div className="compare-drawer-footer">
            <button className="btn-secondary" onClick={onClear}>Limpiar selección</button>
            {aiAnalysis && (
              <button
                className={`btn-save-footer${savedOk ? ' saved' : ''}`}
                onClick={handleSave}
                disabled={savedOk}
              >
                {savedOk ? <><IC.Check /> ¡Guardada!</> : <><IC.Save /> Guardar comparativa</>}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
