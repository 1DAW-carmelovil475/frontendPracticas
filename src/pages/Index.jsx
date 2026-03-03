import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import '../styles/estilos_index.css'

function Index() {
  return (
    <>
      <header className="header">
        <nav className="nav">
          <div className="logo"><Logo /></div>
          <ul className="nav-links">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#servicios">Qué hacemos</a></li>
            <li><a href="#comparativas">Comparativas</a></li>
            <li><a href="#privacidad">Privacidad</a></li>
          </ul>
          <Link className="btn-login" to="/login">Iniciar sesión</Link>
        </nav>
      </header>

      <section id="inicio" className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Descubre qué estás a punto de comer.</h1>
          <p>Analizamos menús con IA, detectamos alérgenos, calculamos información nutricional y te decimos dónde se come mejor por tu dinero.</p>
          <div className="hero-buttons">
            <a href="#servicios" className="btn-primary">Ver cómo funciona</a>
            <a href="#comparativas" className="btn-secondary">Comparar restaurantes</a>
          </div>
        </div>
      </section>

      <section id="servicios" className="section fade-in">
        <div className="section-title">
          <h2>Qué hacemos (y por qué te va a encantar)</h2>
          <p>Una web útil, rápida y pensada para elegir bien sin perder tiempo.</p>
        </div>
        <div className="cards">
          <article className="card">
            <img src="/img/img_body1.jpg" alt="Análisis nutricional" />
            <div className="card-content">
              <h3>Nutrición real</h3>
              <p>Calorías, macros y valor nutricional estimado para que sepas lo que comes. Sin humo. Sin complicaciones.</p>
            </div>
          </article>
          <article className="card">
            <img src="/img/img_body2.jpg" alt="Alérgenos" />
            <div className="card-content">
              <h3>Alérgenos claros</h3>
              <p>Detectamos ingredientes y alérgenos probables para que puedas comer con tranquilidad. Ideal para intolerancias.</p>
            </div>
          </article>
          <article className="card">
            <img src="/img/img_body3.jpg" alt="Comparación calidad precio" />
            <div className="card-content">
              <h3>Calidad / precio</h3>
              <p>Comparamos restaurantes con puntuaciones inteligentes: precio, calidad estimada, variedad y equilibrio nutricional.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="comparativas" className="section section-dark">
        <div className="split">
          <div className="split-text">
            <h2>Recomendaciones inteligentes</h2>
            <p>No solo te decimos "este es barato". Te decimos cuál merece la pena según:</p>
            <ul className="list">
              <li>✔️ Relación calidad/precio</li>
              <li>✔️ Opciones saludables</li>
              <li>✔️ Menús equilibrados</li>
              <li>✔️ Preferencias personales</li>
              <li>✔️ Favoritos guardados</li>
            </ul>
            <Link to="/registro" className="btn-primary">Crear cuenta gratis</Link>
          </div>
          <div className="split-card">
            <div className="mini-card"><h3>📍 Cerca de ti</h3><p>Integra Google Maps para buscar restaurantes por zona.</p></div>
            <div className="mini-card"><h3>🤖 IA aplicada</h3><p>OpenAI analiza menús, detecta alérgenos y recomienda.</p></div>
            <div className="mini-card"><h3>🔒 Privacidad</h3><p>Perfiles seguros, control de datos y cumplimiento legal.</p></div>
          </div>
        </div>
      </section>

      <section id="privacidad" className="section">
        <div className="section-title">
          <h2>Privacidad y protección de datos</h2>
          <p>Tus favoritos y tu perfil son tuyos. No vendemos datos. Protegemos tu privacidad.</p>
        </div>
        <div className="privacy-box">
          <p>MenuSense está diseñado para cumplir con la normativa de protección de datos (RGPD), aplicando buenas prácticas de seguridad, autenticación y control de información.</p>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 MenuSense · Analiza menús, compara y decide mejor</p>
      </footer>
    </>
  )
}

export default Index
