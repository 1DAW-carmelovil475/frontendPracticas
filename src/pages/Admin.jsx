import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_admin.css'

function Admin() {
  const [section, setSection] = useState('dashboard')
  const [adminUser, setAdminUser] = useState(null)
  const [stats, setStats] = useState({ totalUsuarios: 0, totalRestaurantes: 0, usuariosActivos: 0, totalBusquedas: 0 })
  const [usuarios, setUsuarios] = useState([])
  const [restaurantes, setRestaurantes] = useState([])
  const [actividad, setActividad] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [modalUser, setModalUser] = useState(false)
  const [modalRest, setModalRest] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [editRest, setEditRest] = useState(null)
  const [userForm, setUserForm] = useState({ nombre: '', email: '', rol: 'usuario', password: '' })
  const [restForm, setRestForm] = useState({ nombre: '', categoria: '', ubicacion: '', rating: '' })
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u || u.rol !== 'admin') { navigate('/bienvenida'); return }
    setAdminUser(u)
    loadAll()
  }, [navigate])

  const loadAll = () => { loadUsuarios(); loadRestaurantes(); loadActividad() }

  const loadUsuarios = async () => {
    try {
      const res = await fetch('/admin/users', { headers })
      if (res.ok) { const d = await res.json(); setUsuarios(d); setRecentUsers(d.slice(0, 5)); setStats(s => ({ ...s, totalUsuarios: d.length })) }
    } catch {}
  }

  const loadRestaurantes = async () => {
    try {
      const res = await fetch('/admin/restaurants', { headers })
      if (res.ok) { const d = await res.json(); setRestaurantes(d); setStats(s => ({ ...s, totalRestaurantes: d.length })) }
    } catch {}
  }

  const loadActividad = async () => {
    try {
      const res = await fetch('/admin/activity', { headers })
      if (res.ok) { const d = await res.json(); setActividad(d) }
    } catch {}
  }

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login') }

  const handleSaveUser = async (e) => {
    e.preventDefault()
    const url = editUser ? `/admin/users/${editUser.id}` : '/admin/users'
    try { const res = await fetch(url, { method: editUser ? 'PUT' : 'POST', headers, body: JSON.stringify(userForm) }); if (res.ok) { setModalUser(false); loadUsuarios() } } catch {}
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return
    try { await fetch(`/admin/users/${id}`, { method: 'DELETE', headers }); loadUsuarios() } catch {}
  }

  const handleSaveRest = async (e) => {
    e.preventDefault()
    const url = editRest ? `/admin/restaurants/${editRest.id}` : '/admin/restaurants'
    try { const res = await fetch(url, { method: editRest ? 'PUT' : 'POST', headers, body: JSON.stringify(restForm) }); if (res.ok) { setModalRest(false); loadRestaurantes() } } catch {}
  }

  const handleDeleteRest = async (id) => {
    if (!confirm('¿Eliminar restaurante?')) return
    try { await fetch(`/admin/restaurants/${id}`, { method: 'DELETE', headers }); loadRestaurantes() } catch {}
  }

  const openNewUser = () => { setEditUser(null); setUserForm({ nombre: '', email: '', rol: 'usuario', password: '' }); setModalUser(true) }
  const openEditUser = (u) => { setEditUser(u); setUserForm({ nombre: u.nombre || '', email: u.email || '', rol: u.rol || 'usuario', password: '' }); setModalUser(true) }
  const openNewRest = () => { setEditRest(null); setRestForm({ nombre: '', categoria: '', ubicacion: '', rating: '' }); setModalRest(true) }
  const openEditRest = (r) => { setEditRest(r); setRestForm({ nombre: r.nombre || '', categoria: r.categoria || '', ubicacion: r.ubicacion || '', rating: r.rating || '' }); setModalRest(true) }

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { id: 'usuarios', label: 'Usuarios', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'restaurantes', label: 'Restaurantes', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/></svg> },
    { id: 'actividad', label: 'Actividad', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { id: 'configuracion', label: 'Configuración', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/><path d="M1 12h6m6 0h6"/></svg> },
  ]

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-left">
          <Link to="/" className="logo"><Logo /></Link>
          <Link to="/bienvenida" className="admin-badge">SER USUARIO</Link>
        </div>
        <div className="header-right">
          <span className="admin-name">{adminUser?.nombre || 'Administrador'}</span>
          <button className="btn-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Salir
          </button>
        </div>
      </header>

      <aside className="admin-sidebar">
        <nav className="sidebar-nav">
          {sidebarLinks.map(l => (
            <a key={l.id} href="#" className={`sidebar-link${section === l.id ? ' active' : ''}`}
              onClick={e => { e.preventDefault(); setSection(l.id) }}>
              {l.icon}<span>{l.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        {/* DASHBOARD */}
        <section className={`admin-section${section === 'dashboard' ? ' active' : ''}`}>
          <div className="section-header"><h1>Dashboard</h1><p>Vista general del sistema</p></div>
          <div className="stats-grid">
            {[
              { cls: 'users', val: stats.totalUsuarios, label: 'Usuarios Totales', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { cls: 'restaurants', val: stats.totalRestaurantes, label: 'Restaurantes', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/></svg> },
              { cls: 'active', val: stats.usuariosActivos, label: 'Usuarios Activos', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
              { cls: 'searches', val: stats.totalBusquedas, label: 'Búsquedas Hoy', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
            ].map(s => (
              <div key={s.cls} className="stat-card">
                <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                <div className="stat-info"><h3>{s.val}</h3><p>{s.label}</p></div>
              </div>
            ))}
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Usuarios Recientes</h3>
              <div className="recent-list">
                {recentUsers.length === 0 ? <p className="loading">Cargando...</p> :
                  recentUsers.map((u, i) => <div key={i} className="recent-item"><div className="recent-avatar">{(u.nombre||'U')[0].toUpperCase()}</div><div className="recent-info"><h4>{u.nombre}</h4><p>{u.email}</p></div></div>)}
              </div>
            </div>
            <div className="dashboard-card">
              <h3>Actividad del Sistema</h3>
              <div className="activity-list">
                {actividad.length === 0 ? <p className="loading">Cargando...</p> :
                  actividad.slice(0,5).map((a,i) => <div key={i} className="activity-item"><div>{a.accion||a.action}</div><div className="activity-time">{a.fecha||a.timestamp}</div></div>)}
              </div>
            </div>
          </div>
        </section>

        {/* USUARIOS */}
        <section className={`admin-section${section === 'usuarios' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Gestión de Usuarios</h1><p>Administra los usuarios del sistema</p></div>
            <button className="btn-primary" onClick={openNewUser}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuevo Usuario
            </button>
          </div>
          <div className="table-container">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Fecha Registro</th><th>Acciones</th></tr></thead>
              <tbody>
                {usuarios.length === 0 ? <tr><td colSpan="6" className="loading-row">Cargando usuarios...</td></tr> :
                  usuarios.map(u => <tr key={u.id}><td>{u.id}</td><td>{u.nombre}</td><td>{u.email}</td><td><span className={`badge ${u.rol}`}>{u.rol}</span></td><td>{u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '-'}</td><td><button className="btn-action edit" onClick={() => openEditUser(u)}>✏️</button><button className="btn-action delete" onClick={() => handleDeleteUser(u.id)}>🗑️</button></td></tr>)}
              </tbody>
            </table>
          </div>
        </section>

        {/* RESTAURANTES */}
        <section className={`admin-section${section === 'restaurantes' ? ' active' : ''}`}>
          <div className="section-header">
            <div><h1>Gestión de Restaurantes</h1><p>Administra los restaurantes del sistema</p></div>
            <button className="btn-primary" onClick={openNewRest}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuevo Restaurante
            </button>
          </div>
          <div className="table-container">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Ubicación</th><th>Rating</th><th>Acciones</th></tr></thead>
              <tbody>
                {restaurantes.length === 0 ? <tr><td colSpan="6" className="loading-row">Cargando restaurantes...</td></tr> :
                  restaurantes.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.nombre}</td><td>{r.categoria}</td><td>{r.ubicacion}</td><td>{r.rating}</td><td><button className="btn-action edit" onClick={() => openEditRest(r)}>✏️</button><button className="btn-action delete" onClick={() => handleDeleteRest(r.id)}>🗑️</button></td></tr>)}
              </tbody>
            </table>
          </div>
        </section>

        {/* ACTIVIDAD */}
        <section className={`admin-section${section === 'actividad' ? ' active' : ''}`}>
          <div className="section-header"><h1>Registro de Actividad</h1><p>Monitorea las acciones del sistema</p></div>
          <div className="activity-filters">
            <select className="filter-select"><option value="">Todas las acciones</option><option value="login">Inicios de sesión</option><option value="registro">Registros</option><option value="busqueda">Búsquedas</option></select>
            <input type="date" className="filter-input" />
            <button className="btn-secondary" onClick={loadActividad}>Filtrar</button>
          </div>
          <div className="table-container">
            <table className="admin-table">
              <thead><tr><th>Fecha/Hora</th><th>Usuario</th><th>Acción</th><th>Detalles</th></tr></thead>
              <tbody>
                {actividad.length === 0 ? <tr><td colSpan="4" className="loading-row">Cargando actividad...</td></tr> :
                  actividad.map((a,i) => <tr key={i}><td>{a.fecha||a.timestamp}</td><td>{a.usuario||a.user}</td><td>{a.accion||a.action}</td><td>{a.detalles||a.details||'-'}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>

        {/* CONFIGURACIÓN */}
        <section className={`admin-section${section === 'configuracion' ? ' active' : ''}`}>
          <div className="section-header"><h1>Configuración del Sistema</h1><p>Ajustes generales de la plataforma</p></div>
          <div className="config-grid">
            <div className="config-card">
              <h3>Configuración General</h3>
              <div className="form-group"><label>Nombre del Sistema</label><input type="text" defaultValue="MenuSense" /></div>
              <div className="form-group"><label>Email de Contacto</label><input type="email" defaultValue="desarrollo2@holainformatica.com" /></div>
              <div className="form-group"><label>Modo de Mantenimiento</label><label className="switch"><input type="checkbox" /><span className="slider"></span></label></div>
              <button className="btn-primary">Guardar Cambios</button>
            </div>
            <div className="config-card">
              <h3>Seguridad</h3>
              <div className="form-group"><label>Requerir verificación de email</label><label className="switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label></div>
              <div className="form-group"><label>Tiempo de sesión (minutos)</label><input type="number" defaultValue="60" min="15" max="1440" /></div>
              <div className="form-group"><label>Intentos máximos de login</label><input type="number" defaultValue="5" min="3" max="10" /></div>
              <button className="btn-primary">Guardar Cambios</button>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL USUARIO */}
      {modalUser && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header"><h2>{editUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2><button className="modal-close" onClick={() => setModalUser(false)}>&times;</button></div>
            <form onSubmit={handleSaveUser} style={{ padding: '1.5rem' }}>
              <div className="form-group"><label>Nombre</label><input type="text" value={userForm.nombre} onChange={e => setUserForm(f => ({...f, nombre: e.target.value}))} required /></div>
              <div className="form-group"><label>Email</label><input type="email" value={userForm.email} onChange={e => setUserForm(f => ({...f, email: e.target.value}))} required /></div>
              <div className="form-group"><label>Rol</label><select value={userForm.rol} onChange={e => setUserForm(f => ({...f, rol: e.target.value}))}><option value="usuario">Usuario</option><option value="admin">Administrador</option></select></div>
              <div className="form-group"><label>Contraseña</label><input type="password" value={userForm.password} onChange={e => setUserForm(f => ({...f, password: e.target.value}))} minLength="6" /><small>Dejar en blanco para mantener la actual (solo edición)</small></div>
              <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setModalUser(false)}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESTAURANTE */}
      {modalRest && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header"><h2>{editRest ? 'Editar Restaurante' : 'Nuevo Restaurante'}</h2><button className="modal-close" onClick={() => setModalRest(false)}>&times;</button></div>
            <form onSubmit={handleSaveRest} style={{ padding: '1.5rem' }}>
              <div className="form-group"><label>Nombre</label><input type="text" value={restForm.nombre} onChange={e => setRestForm(f => ({...f, nombre: e.target.value}))} required /></div>
              <div className="form-group"><label>Categoría</label><input type="text" value={restForm.categoria} onChange={e => setRestForm(f => ({...f, categoria: e.target.value}))} required /></div>
              <div className="form-group"><label>Ubicación</label><input type="text" value={restForm.ubicacion} onChange={e => setRestForm(f => ({...f, ubicacion: e.target.value}))} required /></div>
              <div className="form-group"><label>Rating (1-5)</label><input type="number" value={restForm.rating} onChange={e => setRestForm(f => ({...f, rating: e.target.value}))} min="1" max="5" step="0.1" required /></div>
              <div className="modal-actions"><button type="button" className="btn-secondary" onClick={() => setModalRest(false)}>Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
