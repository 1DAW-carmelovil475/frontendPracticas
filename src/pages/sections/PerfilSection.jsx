import IC from '../../components/Icons.jsx'

export default function PerfilSection({
  active, user,
  editingNombre, setEditingNombre, newNombre, setNewNombre, saveNombre, savingNombre,
  prefs, setPrefs, savePrefs, savingPrefs,
}) {
  return (
    <section className={`content-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div><h1>Mi Perfil</h1><p>Gestiona tu información y preferencias</p></div>
      </div>
      <div className="profile-container">
        <div className="profile-card">
          <h3>Información Personal</h3>
          <div className="profile-info">
            <div className="info-row">
              <label>Nombre</label>
              {editingNombre ? (
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flex:1}}>
                  <input type="text" value={newNombre} onChange={e => setNewNombre(e.target.value)} className="inline-input" />
                  <button className="btn-primary" style={{padding:'0.4rem 0.75rem',fontSize:'0.85rem'}} onClick={saveNombre} disabled={savingNombre}>{savingNombre ? '...' : 'Guardar'}</button>
                  <button className="btn-secondary" style={{padding:'0.4rem 0.75rem',fontSize:'0.85rem'}} onClick={() => { setEditingNombre(false); setNewNombre(user?.nombre||'') }}>Cancelar</button>
                </div>
              ) : (
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flex:1}}>
                  <span>{user?.nombre || '-'}</span>
                  <button className="btn-link" onClick={() => setEditingNombre(true)}>Editar</button>
                </div>
              )}
            </div>
            <div className="info-row"><label>Email</label><span>{user?.email || '-'}</span></div>
            <div className="info-row"><label>Rol</label><span className={`badge ${user?.rol}`}>{user?.rol || '-'}</span></div>
          </div>
        </div>
        <div className="profile-card">
          <h3>Preferencias Alimentarias</h3>
          <div className="preferences-grid">
            {[['vegano','Vegano'],['vegetariano','Vegetariano'],['sinGluten','Sin Gluten'],['sinLactosa','Sin Lactosa']].map(([k, label]) => (
              <label key={k} className="checkbox-label">
                <input type="checkbox" checked={prefs[k]} onChange={e => setPrefs(p => ({ ...p, [k]: e.target.checked }))} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <button className="btn-primary" onClick={savePrefs} disabled={savingPrefs}>{savingPrefs ? 'Guardando...' : 'Guardar Preferencias'}</button>
        </div>
      </div>
    </section>
  )
}
