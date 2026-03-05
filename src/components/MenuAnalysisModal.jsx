import { useState, useEffect, useRef } from 'react'
import IC from './Icons.jsx'

// ── Animación del escáner ───────────────────────────────────────────
function MenuScannerAnimation({ fileName, imageUrl }) {
  const [phase, setPhase] = useState(0)
  const phases = [
    { label: 'Detectando platos...', progress: 15 },
    { label: 'Leyendo ingredientes...', progress: 35 },
    { label: 'Identificando alérgenos...', progress: 55 },
    { label: 'Calculando calorías...', progress: 72 },
    { label: 'Generando recomendaciones...', progress: 88 },
    { label: 'Finalizando análisis...', progress: 97 },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % phases.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  const current = phases[phase]

  return (
    <div className="scanner-container">
      <div className="scanner-frame">
        <div className="scanner-corners">
          <span className="corner tl" />
          <span className="corner tr" />
          <span className="corner bl" />
          <span className="corner br" />
        </div>
        <div className="scanner-line" />
        <div className="scanner-dots">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="scan-dot" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        {imageUrl
          ? <img src={imageUrl} alt="Menú" className="scanner-preview-img" />
          : <div className="scanner-icon-center"><IC.File /></div>
        }
      </div>

      <div className="scanner-info">
        <div className="scanner-phase-label">
          <IC.Sparkles />
          <span>{current.label}</span>
        </div>
        {fileName && <p className="scanner-filename">{fileName}</p>}
        <div className="scanner-progress-track">
          <div
            className="scanner-progress-fill"
            style={{ width: `${current.progress}%` }}
          />
          <span className="scanner-progress-pct">{current.progress}%</span>
        </div>
        <div className="scanner-particles">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="particle" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Modal de análisis de menú ───────────────────────────────────────
export default function MenuAnalysisModal({ onClose, token, userPrefs, onSaveMenu }) {
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [mimeType, setMimeType] = useState('image/jpeg')
  const [fileName, setFileName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [savedOk, setSavedOk] = useState(false)
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    setMimeType(file.type || 'image/jpeg')
    setFileName(file.name || 'menú.jpg')
    setImage(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = (e) => setImageBase64(e.target.result.split(',')[1])
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!imageBase64) return
    setAnalyzing(true); setError(null)
    try {
      const res = await fetch('/api/ai/analyze-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ imageBase64, mimeType, userPrefs })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en el análisis')
      setAnalysis(data.analysis)
    } catch (err) { setError(err.message) }
    finally { setAnalyzing(false) }
  }

  const handleSave = () => {
    if (!analysis) return
    onSaveMenu({ image, imageBase64: `data:${mimeType};base64,${imageBase64}`, fileName, analysis, date: new Date().toISOString() })
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 3000)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="analysis-modal">
        <div className="modal-header-bar">
          <h2>Análisis de Menú con IA</h2>
          <button className="modal-close-btn" onClick={onClose}><IC.X /></button>
        </div>
        {!analysis ? (
          <div className="analysis-upload">
            {analyzing ? (
              <MenuScannerAnimation fileName={fileName} imageUrl={image} />
            ) : (
              <div className={`upload-zone${image ? ' has-image' : ''}`} onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}>
                {image ? <img src={image} alt="Menú" className="preview-img" /> : <><IC.Upload /><p>Arrastra la foto del menú aquí o haz clic para seleccionar</p></>}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {error && <div className="analysis-error"><IC.Info /> {error}</div>}
            {!analyzing && (
              <button className="btn-primary btn-full" onClick={handleAnalyze} disabled={!imageBase64 || analyzing}>
                <IC.Scan />Analizar menú
              </button>
            )}
          </div>
        ) : (
          <div className="analysis-results">
            {analysis.recomendacion_general && <div className="analysis-summary"><h4>Recomendación personalizada</h4><p>{analysis.recomendacion_general}</p></div>}
            {analysis.alerta_alergenos && <div className="analysis-alert"><IC.Info /> <strong>Alérgenos:</strong> {analysis.alerta_alergenos}</div>}
            <h4>Platos detectados</h4>
            <div className="dishes-grid">
              {(analysis.platos || []).map((p, i) => (
                <div key={i} className={`dish-card${p.recomendado ? ' recommended' : ''}`}>
                  <div className="dish-header">
                    <span className="dish-name">{p.nombre}</span>
                    {p.precio && <span className="dish-price">{p.precio}</span>}
                    {p.recomendado && <span className="dish-badge"><IC.Check /> Recomendado</span>}
                  </div>
                  {p.descripcion && <p className="dish-desc">{p.descripcion}</p>}
                  {p.alergenos?.length > 0 && <div className="dish-tags">{p.alergenos.map(a => <span key={a} className="tag alergeno">{a}</span>)}</div>}
                  {p.apto_para?.length > 0 && <div className="dish-tags">{p.apto_para.map(a => <span key={a} className="tag apto">{a}</span>)}</div>}
                  {p.calorias_estimadas && <p className="dish-cal">~{p.calorias_estimadas} kcal</p>}
                  {p.motivo_recomendacion && <p className="dish-motivo">{p.motivo_recomendacion}</p>}
                </div>
              ))}
            </div>
            {analysis.resumen_nutricional && <div className="analysis-summary"><h4>Resumen nutricional</h4><p>{analysis.resumen_nutricional}</p></div>}
            <div className="analysis-actions-row">
              <button className="btn-secondary" onClick={() => { setAnalysis(null); setImage(null); setImageBase64(null); setSavedOk(false) }}>
                Analizar otro menú
              </button>
              <button className={`btn-save-footer${savedOk ? ' saved' : ''}`} onClick={handleSave} disabled={savedOk}>
                {savedOk ? <><IC.Check /> ¡Guardado!</> : <><IC.Save /> Guardar menú</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
