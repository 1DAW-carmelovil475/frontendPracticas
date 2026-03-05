import IC from '../../components/Icons.jsx'
import { StarRating, PriceLevel, CustomSelect } from '../../components/utils.jsx'

// ── Constantes de mapa (usadas también en Bienvenida.jsx) ───────────
export const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023747' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
]

export default function BuscarSection({
  active, mapRef, mapsLoaded,
  searchQuery, setSearchQuery, handleSearch, searching,
  filters, setFilters,
  searchResults, isFavorite, toggleFavorite, isInCompare, toggleCompare,
  handleResultClick, compareList, setShowCompareDrawer,
}) {
  return (
    <>
      {/* Sidebar de búsqueda */}
      {active && (
        <aside className="sidebar visible">
          <div className="search-panel">
            <div className="search-bar-container">
              <div className="search-input-wrapper">
                <IC.Search />
                <input
                  type="text"
                  placeholder="Buscar restaurantes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button className="btn-search" onClick={handleSearch} disabled={searching}>
                {searching
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin"><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10"/></svg>
                  : <IC.Search />}
              </button>
            </div>
            <div className="filters-section">
              <CustomSelect
                value={filters.categoria}
                onChange={v => setFilters(f => ({...f, categoria: f.categoria === v ? '' : v}))}
                placeholder="Categoría"
                options={[
                  {value:'italiana',label:'Italiana'},{value:'mexicana',label:'Mexicana'},
                  {value:'japonesa',label:'Japonesa'},{value:'china',label:'China'},
                  {value:'asiatica',label:'Asiática'},{value:'espanola',label:'Española'},
                  {value:'americana',label:'Americana'},{value:'saludable',label:'Saludable'},
                  {value:'vegetariana',label:'Vegetariana'}
                ]}
              />
              <CustomSelect
                value={filters.precio}
                onChange={v => setFilters(f => ({...f, precio: f.precio === v ? '' : v}))}
                placeholder="Precio"
                options={[
                  {value:'1',label:'€ Solo baratos'},{value:'2',label:'€€ Moderados'},
                  {value:'3',label:'€€€ Caros'},{value:'4',label:'€€€€ Muy caros'}
                ]}
              />
              <CustomSelect
                value={filters.distancia}
                onChange={v => setFilters(f => ({...f, distancia: v}))}
                placeholder="Distancia"
                options={[
                  {value:'500',label:'Menos de 500m'},{value:'1000',label:'Menos de 1km'},
                  {value:'2000',label:'Menos de 2km'},{value:'5000',label:'Menos de 5km'},
                  {value:'10000',label:'Menos de 10km'},{value:'20000',label:'Menos de 20km'},
                  {value:'50000',label:'Menos de 50km'}
                ]}
              />
            </div>
            <button className="btn-compare" onClick={() => setShowCompareDrawer(true)}>
              <IC.Bar />Comparar con IA {compareList.length > 0 && `(${compareList.length})`}
            </button>
          </div>
          <div className="results-list">
            <h3>{searchResults.length > 0 ? `${searchResults.length} resultados` : 'Resultados cercanos'}</h3>
            <div className="restaurant-list">
              {searching && <p className="no-results">Buscando...</p>}
              {!searching && searchResults.length === 0 && <p className="no-results">Realiza una búsqueda para ver restaurantes</p>}
              {!searching && searchResults.map((place, i) => (
                <div key={place.place_id || place.id || i}
                  className={`restaurant-item${isInCompare(place) ? ' in-compare' : ''}`}
                  onClick={() => handleResultClick(place, i)}>
                  {place.photo_ref
                    ? <img src={`/api/places/photo/${place.photo_ref}?w=80`} alt={place.name} style={{width:'46px',height:'46px',objectFit:'cover',borderRadius:'8px',flexShrink:0}} />
                    : <div className="restaurant-icon-svg"><IC.Restaurant /></div>}
                  <div className="restaurant-info">
                    <h4>{place.name}</h4>
                    <p>{place.address}</p>
                    {place.rating && <div className="result-meta"><StarRating rating={place.rating} /><PriceLevel level={place.price_level} /></div>}
                  </div>
                  <div className="result-actions">
                    <button className={`btn-fav${isFavorite(place) ? ' active' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleFavorite(place) }}>
                      <IC.Heart filled={isFavorite(place)} />
                    </button>
                    <button className={`btn-add-compare${isInCompare(place) ? ' active' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleCompare(place) }}>
                      {isInCompare(place) ? <IC.Check /> : '+'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Mapa */}
      <section className={`content-section map-view${active ? ' active' : ''}`}>
        <div className="map-container">
          <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}>
            {!mapsLoaded && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#1a1a1a', color:'#aaa', fontSize:'0.95rem' }}>
                Cargando Google Maps...
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
