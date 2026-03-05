import IC from '../../components/Icons.jsx'

export default function ConfiguracionSection({
  active,
  ajustes, setAjustes, saveAjustes,
  editingPassword, setEditingPassword, newPassword, setNewPassword, showPwd, setShowPwd, savePassword, savingPwd,
  clearHistorial, showSaved,
}) {
  return (
    <section className={`content-section${active ? ' active' : ''}`}>
      <div className="section-header">
        <div><h1>Ajustes</h1><p>Personaliza tu experiencia</p></div>
      </div>
      <div className="profile-container">
        <div className="profile-card">
          <h3><IC.Bell /> Notificaciones</h3>
          <div className="preferences-grid">
            <label className="checkbox-label">
              <input type="checkbox" checked={ajustes.notificaciones?.nuevosRestaurantes ?? true} onChange={e => setAjustes(a => ({...a,notificaciones:{...a.notificaciones,nuevosRestaurantes:e.target.checked}}))} />
              <span>Nuevos restaurantes cerca</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={ajustes.notificaciones?.ofertas ?? true} onChange={e => setAjustes(a => ({...a,notificaciones:{...a.notificaciones,ofertas:e.target.checked}}))} />
              <span>Ofertas y promociones</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={ajustes.notificaciones?.recordatorios ?? false} onChange={e => setAjustes(a => ({...a,notificaciones:{...a.notificaciones,recordatorios:e.target.checked}}))} />
              <span>Recordatorios semanales</span>
            </label>
          </div>
          <button className="btn-primary" onClick={saveAjustes}>Guardar</button>
        </div>

        <div className="profile-card">
          <h3><IC.Lock /> Privacidad</h3>
          <div className="preferences-grid">
            <label className="checkbox-label">
              <input type="checkbox" checked={ajustes.privacidad?.geolocalizacion ?? true} onChange={e => setAjustes(a => ({...a,privacidad:{...a.privacidad,geolocalizacion:e.target.checked}}))} />
              <span>Permitir geolocalización</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={ajustes.privacidad?.guardarHistorial ?? true} onChange={e => setAjustes(a => ({...a,privacidad:{...a.privacidad,guardarHistorial:e.target.checked}}))} />
              <span>Guardar historial de búsquedas</span>
            </label>
          </div>
          <button className="btn-primary" onClick={saveAjustes}>Guardar</button>
        </div>

        <div className="profile-card">
          <h3><IC.Lock /> Cambiar Contraseña</h3>
          {editingPassword ? (
            <div className="form-group" style={{marginTop:'0.5rem'}}>
              <div style={{position:'relative'}}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  style={{width:'100%',paddingRight:'2.5rem'}}
                />
                <button style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--muted)',cursor:'pointer'}} onClick={() => setShowPwd(s => !s)}>
                  {showPwd ? <IC.EyeOff /> : <IC.Eye />}
                </button>
              </div>
              <div style={{display:'flex',gap:'0.5rem',marginTop:'0.75rem'}}>
                <button className="btn-primary" onClick={savePassword} disabled={savingPwd}>{savingPwd ? 'Guardando...' : 'Cambiar contraseña'}</button>
                <button className="btn-secondary" onClick={() => { setEditingPassword(false); setNewPassword('') }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{marginTop:'0.5rem'}}>
              <p style={{color:'var(--muted)',fontSize:'0.9rem',marginBottom:'1rem'}}>Tu contraseña está protegida.</p>
              <button className="btn-secondary" onClick={() => setEditingPassword(true)}>Cambiar contraseña</button>
            </div>
          )}
        </div>

        <div className="profile-card danger-zone">
          <h3>Zona de peligro</h3>
          <p style={{color:'var(--muted)',fontSize:'0.875rem',marginBottom:'1rem'}}>Estas acciones son permanentes.</p>
          <button className="btn-danger" onClick={() => { if (confirm('¿Limpiar todo el historial?')) { clearHistorial(); showSaved('Historial eliminado') } }}>
            Limpiar historial de búsquedas
          </button>
        </div>
      </div>
    </section>
  )
}
