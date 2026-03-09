import { useState, useRef } from 'react'
import IC from './Icons.jsx'
import { StarRating, qualityPriceScore } from './utils.jsx'

export default function CompareDrawer({ compareList, onClose, onRemove, onClear, token, onSave, savedMenus }) {
  const [compareMode, setCompareMode] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [savedOk, setSavedOk] = useState(false)
  // { placeId: { dataUrl, mimeType } } — imágenes subidas inline
  const [localMenuImages, setLocalMenuImages] = useState({})
  const fileRefs = useRef({})
  const drawerRef = useRef(null)
  const bodyRef = useRef(null)

  // Busca el menú guardado (de savedMenus o subido inline)
  const getMenuImage = (place) => {
    const placeId = place.place_id || place.id
    const name = place.name?.toLowerCase()
    // 1. Imagen subida inline en este drawer
    if (localMenuImages[placeId]) return localMenuImages[placeId]
    // 2. Menú previamente guardado (tiene imageBase64 como data URL)
    if (savedMenus?.length) {
      const saved = savedMenus.find(m =>
        (placeId && m.restaurantPlaceId === placeId) ||
        (name && m.restaurantName?.toLowerCase() === name)
      )
      if (saved?.imageBase64) {
        const match = saved.imageBase64.match(/^data:([^;]+);base64,(.+)$/)
        if (match) return { dataUrl: saved.imageBase64, mimeType: match[1] }
      }
    }
    return null
  }

  const missingImages = (compareMode === 'menu' || compareMode === 'both')
    ? compareList.filter(p => !getMenuImage(p))
    : []

  const canCompare = compareMode === 'reviews' || missingImages.length === 0

  // Manejador de subida inline
  const handleInlineFile = (place, file) => {
    if (!file) return
    const placeId = place.place_id || place.id
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target.result
      const mimeType = file.type || 'image/jpeg'
      setLocalMenuImages(prev => ({ ...prev, [placeId]: { dataUrl, mimeType } }))
    }
    reader.readAsDataURL(file)
  }

  const generateAIAnalysis = async (mode) => {
    if (compareList.length < 2) return
    setLoadingAI(true); setAiError(null); setAiAnalysis(null)
    try {
      if (mode === 'menu' || mode === 'both') {
        // Comparación visual por imágenes
        const restaurantData = compareList.map(p => {
          const img = getMenuImage(p)
          const base64 = img?.dataUrl?.split(',')[1] || null
          const mimeType = img?.mimeType || 'image/jpeg'
          return {
            nombre: p.name,
            imageBase64: base64,
            mimeType,
            rating: p.rating,
            user_ratings_total: p.user_ratings_total,
            price_level: p.price_level,
            reseñas: mode === 'both' ? (p.reviews?.map(r => r.text).filter(Boolean).slice(0, 3) || []) : [],
          }
        })
        const res = await fetch('/api/ai/compare-menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ restaurantes: restaurantData, modo: mode })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error en el análisis')
        setAiAnalysis(data.analysis)
      } else {
        // Comparación por reseñas
        const restaurantData = compareList.map(p => ({
          nombre: p.name,
          rating: p.rating,
          user_ratings_total: p.user_ratings_total,
          price_level: p.price_level,
          address: p.address,
          open_now: p.open_now,
          reseñas: p.reviews?.map(r => r.text).filter(Boolean).slice(0, 3) || [],
        }))
        const res = await fetch('/api/ai/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ restaurantes: restaurantData, modo: mode })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error en el análisis')
        setAiAnalysis(data.analysis)
      }
    } catch (err) {
      setAiError('No se pudo generar el análisis. ' + (err.message || 'Revisa tu conexión.'))
    } finally {
      setLoadingAI(false)
    }
  }

  const handleSelectMode = (mode) => {
    setCompareMode(mode)
    setAiAnalysis(null)
    setAiError(null)
    if (mode === 'reviews') {
      generateAIAnalysis(mode)
    } else if (compareList.filter(p => !getMenuImage(p)).length === 0) {
      generateAIAnalysis(mode)
    }
  }

  const handleSave = () => {
    if (!aiAnalysis) return
    onSave({ places: compareList, analysis: aiAnalysis, date: new Date().toISOString(), mode: compareMode })
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 3000)
  }

  const handleChangeMode = () => {
    setCompareMode(null)
    setAiAnalysis(null)
    setAiError(null)
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

        {/* Chips restaurantes */}
        <div className="compare-drawer-places">
          {compareList.map((place, i) => (
            <div key={i} className="compare-drawer-place-chip">
              {place.photo_ref
                ? <img src={`/api/places/photo/${place.photo_ref}?w=60`} alt={place.name} className="chip-photo" />
                : <div className="chip-icon"><IC.Restaurant /></div>}
              <div className="chip-info">
                <span className="chip-name">{place.name}</span>
                {place.rating && <StarRating rating={place.rating} />}
                {getMenuImage(place) && (
                  <span className="chip-menu-badge"><IC.File /> Menú subido</span>
                )}
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
        ) : !compareMode ? (
          /* Selector de modo */
          <div className="compare-mode-selector">
            <div className="compare-mode-title">
              <IC.Sparkles />
              <span>¿Cómo quieres comparar?</span>
            </div>
            <button className="compare-mode-btn" onClick={() => handleSelectMode('reviews')}>
              <div className="compare-mode-btn-icon"><IC.Star filled={true} /></div>
              <div className="compare-mode-btn-text">
                <strong>Comparar por reseñas</strong>
                <span>Analiza las valoraciones y opiniones de clientes</span>
              </div>
            </button>
            <button className="compare-mode-btn" onClick={() => handleSelectMode('menu')}>
              <div className="compare-mode-btn-icon"><IC.File /></div>
              <div className="compare-mode-btn-text">
                <strong>Comparar por menú</strong>
                <span>Compara las fotos de los menús de cada restaurante</span>
              </div>
            </button>
            <button className="compare-mode-btn" onClick={() => handleSelectMode('both')}>
              <div className="compare-mode-btn-icon"><IC.Sparkles /></div>
              <div className="compare-mode-btn-text">
                <strong>Comparar por ambos</strong>
                <span>Análisis completo: menú y reseñas combinados</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="compare-drawer-body" ref={bodyRef}>
            {/* Indicador de modo activo */}
            <div className="compare-active-mode">
              <span className="compare-mode-label">
                {compareMode === 'reviews' && <><IC.Star filled={true} /> Por reseñas</>}
                {compareMode === 'menu' && <><IC.File /> Por menú</>}
                {compareMode === 'both' && <><IC.Sparkles /> Por menú y reseñas</>}
              </span>
              <button className="btn-change-mode" onClick={handleChangeMode}>Cambiar</button>
            </div>

            {/* Subida inline de menús faltantes */}
            {(compareMode === 'menu' || compareMode === 'both') && missingImages.length > 0 && (
              <div className="compare-menu-uploads">
                <div className="compare-menu-uploads-title">
                  <IC.Upload /> Sube los menús que faltan
                </div>
                {missingImages.map(place => {
                  const placeId = place.place_id || place.id
                  return (
                    <div key={placeId} className="compare-menu-upload-item">
                      <span className="compare-menu-upload-name">{place.name}</span>
                      <input
                        ref={el => fileRefs.current[placeId] = el}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => handleInlineFile(place, e.target.files[0])}
                      />
                      <button
                        className="compare-menu-upload-btn"
                        onClick={() => fileRefs.current[placeId]?.click()}
                      >
                        <IC.Upload /> Subir foto del menú
                      </button>
                    </div>
                  )
                })}
                {compareList.filter(p => getMenuImage(p)).map(place => (
                  <div key={place.place_id || place.id} className="compare-menu-upload-item ready">
                    <span className="compare-menu-upload-name">{place.name}</span>
                    <span className="compare-menu-upload-ok"><IC.Check /> Menú listo</span>
                  </div>
                ))}
                {missingImages.length === 0 && (
                  <button className="btn-primary btn-full" onClick={() => generateAIAnalysis(compareMode)}>
                    <IC.Sparkles /> Comparar ahora
                  </button>
                )}
              </div>
            )}

            {/* Botón de comparar cuando ya están todos los menús */}
            {(compareMode === 'menu' || compareMode === 'both') && missingImages.length === 0 && !aiAnalysis && !loadingAI && !aiError && (
              <button className="compare-run-btn" onClick={() => generateAIAnalysis(compareMode)}>
                <IC.Sparkles /> Comparar menús con IA
              </button>
            )}

            {/* Análisis IA */}
            {canCompare && (
              <div className="compare-ai-section">
                <div className="compare-ai-header">
                  <IC.Sparkles />
                  <h3>Análisis de la IA</h3>
                  {!loadingAI && aiAnalysis && <button className="btn-refresh-ai" onClick={() => generateAIAnalysis(compareMode)} title="Regenerar">↻</button>}
                </div>

                {loadingAI && (
                  <div className="compare-ai-loading">
                    <div className="ai-loading-dots"><span /><span /><span /></div>
                    <p>Analizando{compareMode === 'menu' ? ' los menús' : compareMode === 'both' ? ' menús y reseñas' : ' las reseñas'}...</p>
                  </div>
                )}

                {aiError && <div className="analysis-error"><IC.Info /> {aiError}</div>}

                {aiAnalysis && !loadingAI && (
                  <div className="compare-ai-results">
                    <div className="ai-summary-box">
                      <p>{aiAnalysis.resumen_general}</p>
                    </div>

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
                          const dist = [5, 4, 3, 2, 1].map(star => Math.max(0, 1 - Math.abs(star - rating) * 0.4))
                          const sum = dist.reduce((a, b) => a + b, 0)
                          const pcts = dist.map(d => Math.round((d / sum) * 100))
                          return total > 0 ? (
                            <div className="reviews-summary-box">
                              <div className="reviews-summary-title"><IC.Star filled={true} /> Resumen de reseñas</div>
                              <div className="reviews-rating-overview">
                                <div className="reviews-big-score">{rating.toFixed(1)}</div>
                                <div className="reviews-score-detail">
                                  <StarRating rating={rating} />
                                  <p>{total.toLocaleString()} reseñas en Google</p>
                                </div>
                                <div className="reviews-bars">
                                  {[5, 4, 3, 2, 1].map((star, si) => (
                                    <div key={star} className="review-bar-row">
                                      <span>{star}<IC.Star filled={true} /></span>
                                      <div className="review-bar-track"><div className="review-bar-fill" style={{ width: `${pcts[si]}%` }} /></div>
                                      <span className="review-bar-count">{pcts[si]}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {r.opinion_reseñas && <p className="reviews-summary-text">"{r.opinion_reseñas}"</p>}
                              {(r.puntos_fuertes?.length > 0 || r.puntos_debiles?.length > 0) && (
                                <div className="reviews-highlights" style={{ marginTop: '0.75rem' }}>
                                  <div className="reviews-highlights-title">Lo más mencionado</div>
                                  <div className="reviews-sentiment-row">
                                    {r.puntos_fuertes?.map((p, j) => <span key={j} className="sentiment-tag positive">✓ {p}</span>)}
                                    {r.puntos_debiles?.map((p, j) => <span key={j} className="sentiment-tag negative">✗ {p}</span>)}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ marginBottom: '0.5rem' }}>
                              {r.opinion_reseñas && <p className="ai-reviews-opinion">{r.opinion_reseñas}</p>}
                              <div className="ai-pros-cons">
                                {r.puntos_fuertes?.length > 0 && <div className="ai-pros">{r.puntos_fuertes.map((p, j) => <span key={j} className="pro-tag">✓ {p}</span>)}</div>}
                                {r.puntos_debiles?.length > 0 && <div className="ai-cons">{r.puntos_debiles.map((p, j) => <span key={j} className="con-tag">✗ {p}</span>)}</div>}
                              </div>
                            </div>
                          )
                        })()}
                        {r.recomendado_para && <p className="ai-rec-for"><IC.ChevronRight /> Ideal para: {r.recomendado_para}</p>}
                      </div>
                    ))}

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
            )}

            {/* Tabla rápida */}
            <div className="compare-quick-table">
              <h3>Datos rápidos</h3>
              <div className="quick-table-grid" style={{ gridTemplateColumns: `120px repeat(${compareList.length}, 1fr)` }}>
                <div className="qt-header-cell" />
                {compareList.map((p, i) => <div key={i} className="qt-header-cell">{p.name}</div>)}
                {[
                  ['Valoración', p => p.rating ? `${p.rating}` : '—'],
                  ['Precio', p => p.price_level != null ? ['€', '€€', '€€€', '€€€€'][p.price_level] : '—'],
                  ['Reseñas', p => p.user_ratings_total ? `${p.user_ratings_total}` : '—'],
                  ['Estado', p => p.open_now != null ? (p.open_now ? <span style={{ color: '#22c55e' }}>● Abierto</span> : <span style={{ color: '#e74c3c' }}>● Cerrado</span>) : '—'],
                  ['Cal/precio', p => { const s = qualityPriceScore(p.rating, p.price_level); return s ? `${s}` : '—' }],
                  ['Menú', p => getMenuImage(p) ? <span style={{ color: '#22c55e' }}>✓ Subido</span> : '—'],
                ].map(([label, fn]) => (
                  <>
                    <div className="qt-label-cell">{label}</div>
                    {compareList.map((p, i) => <div key={i} className="qt-value-cell">{fn(p)}</div>)}
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
              <button className={`btn-save-footer${savedOk ? ' saved' : ''}`} onClick={handleSave} disabled={savedOk}>
                {savedOk ? <><IC.Check /> ¡Guardada!</> : <><IC.Save /> Guardar comparativa</>}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
