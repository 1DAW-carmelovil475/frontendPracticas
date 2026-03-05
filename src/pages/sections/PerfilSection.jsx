import IC from '../../components/Icons.jsx'

export default function PerfilSection({
  active, user,
  editingNombre, setEditingNombre, newNombre, setNewNombre, saveNombre, savingNombre,
  prefs, setPrefs, savePrefs, savingPrefs,
  ajustes, setAjustes, saveAjustes,
  editingPassword, setEditingPassword, newPassword, setNewPassword, showPwd, setShowPwd, savePassword, savingPwd,
  clearHistorial, showSaved,
}) {
  return (
    <section className={`content-section ajustes-section${active ? ' active' : ''}`}>

      {/* ── Cabecera compacta ── */}
      <div className="ajustes-header">
        <div className="ajustes-header-info">
          <div className="ajustes-avatar">{(user?.nombre || 'U')[0].toUpperCase()}</div>
          <div>
            <h1>Ajustes</h1>
            <p>{user?.nombre} · {user?.email}</p>
          </div>
        </div>
      </div>

      {/* ── Grid principal 3 columnas ── */}
      <div className="ajustes-grid">

        {/* ── COLUMNA 1: Cuenta ── */}
        <div className="ajustes-col">
          <div className="ajustes-card">
            <div className="ajustes-card-title"><IC.User /> Cuenta</div>

            {/* Nombre */}
            <div className="ajustes-field">
              <span className="ajustes-field-label">Nombre</span>
              {editingNombre ? (
                <div className="ajustes-field-edit">
                  <input
                    type="text"
                    value={newNombre}
                    onChange={e => setNewNombre(e.target.value)}
                    className="ajustes-input"
                    autoFocus
                  />
                  <div className="ajustes-field-actions">
                    <button className="btn-primary btn-sm" onClick={saveNombre} disabled={savingNombre}>
                      {savingNombre ? '...' : 'Guardar'}
                    </button>
                    <button className="btn-secondary btn-sm" onClick={() => { setEditingNombre(false); setNewNombre(user?.nombre || '') }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ajustes-field-value">
                  <span>{user?.nombre || '-'}</span>
                  <button className="btn-link" onClick={() => setEditingNombre(true)}>Editar</button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="ajustes-field">
              <span className="ajustes-field-label">Email</span>
              <span className="ajustes-field-text">{user?.email || '-'}</span>
            </div>

            {/* Rol */}
            <div className="ajustes-field">
              <span className="ajustes-field-label">Rol</span>
              <span className={`badge ${user?.rol}`}>{user?.rol || '-'}</span>
            </div>

            {/* Contraseña */}
            <div className="ajustes-field ajustes-field--col">
              <span className="ajustes-field-label"><IC.Lock /> Contraseña</span>
              {editingPassword ? (
                <div className="ajustes-field-edit">
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="ajustes-input"
                      autoFocus
                    />
                    <button className="ajustes-eye-btn" onClick={() => setShowPwd(s => !s)}>
                      {showPwd ? <IC.EyeOff /> : <IC.Eye />}
                    </button>
                  </div>
                  <div className="ajustes-field-actions">
                    <button className="btn-primary btn-sm" onClick={savePassword} disabled={savingPwd}>
                      {savingPwd ? 'Guardando...' : 'Cambiar'}
                    </button>
                    <button className="btn-secondary btn-sm" onClick={() => { setEditingPassword(false); setNewPassword('') }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn-secondary btn-sm" onClick={() => setEditingPassword(true)}>
                  Cambiar contraseña
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── COLUMNA 2: Preferencias + Notificaciones + Privacidad ── */}
        <div className="ajustes-col">

          {/* Preferencias alimentarias */}
          <div className="ajustes-card">
            <div className="ajustes-card-title"><IC.Star filled={false} /> Preferencias</div>
            <div className="ajustes-checks-grid">
              {[
                ['vegano', 'Vegano'],
                ['vegetariano', 'Vegetariano'],
                ['sinGluten', 'Sin gluten'],
                ['sinLactosa', 'Sin lactosa'],
              ].map(([k, label]) => (
                <label key={k} className="ajustes-check">
                  <input
                    type="checkbox"
                    checked={prefs[k]}
                    onChange={e => setPrefs(p => ({ ...p, [k]: e.target.checked }))}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <button className="btn-primary btn-sm" onClick={savePrefs} disabled={savingPrefs}>
              {savingPrefs ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          {/* Notificaciones */}
          <div className="ajustes-card">
            <div className="ajustes-card-title"><IC.Bell /> Notificaciones</div>
            <div className="ajustes-checks-col">
              {[
                ['nuevosRestaurantes', 'Nuevos restaurantes cerca'],
                ['ofertas', 'Ofertas y promociones'],
                ['recordatorios', 'Recordatorios semanales'],
              ].map(([k, label]) => (
                <label key={k} className="ajustes-check">
                  <input
                    type="checkbox"
                    checked={ajustes?.notificaciones?.[k] ?? (k !== 'recordatorios')}
                    onChange={e => setAjustes(a => ({ ...a, notificaciones: { ...a.notificaciones, [k]: e.target.checked } }))}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <button className="btn-primary btn-sm" onClick={saveAjustes}>Guardar</button>
          </div>
        </div>

        {/* ── COLUMNA 3: Privacidad + Peligro ── */}
        <div className="ajustes-col">

          {/* Privacidad */}
          <div className="ajustes-card">
            <div className="ajustes-card-title"><IC.Lock /> Privacidad</div>
            <div className="ajustes-checks-col">
              {[
                ['geolocalizacion', 'Permitir geolocalización'],
                ['guardarHistorial', 'Guardar historial de búsquedas'],
              ].map(([k, label]) => (
                <label key={k} className="ajustes-check">
                  <input
                    type="checkbox"
                    checked={ajustes?.privacidad?.[k] ?? true}
                    onChange={e => setAjustes(a => ({ ...a, privacidad: { ...a.privacidad, [k]: e.target.checked } }))}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <button className="btn-primary btn-sm" onClick={saveAjustes}>Guardar</button>
          </div>

          {/* Zona de peligro */}
          <div className="ajustes-card ajustes-card--danger">
            <div className="ajustes-card-title ajustes-card-title--danger">⚠ Zona de peligro</div>
            <p className="ajustes-danger-desc">Estas acciones son permanentes y no se pueden deshacer.</p>
            <button
              className="btn-danger btn-sm"
              onClick={() => {
                if (confirm('¿Limpiar todo el historial de búsquedas?')) {
                  clearHistorial()
                  showSaved('Historial eliminado')
                }
              }}
            >
              Limpiar historial
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}