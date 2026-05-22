// Inizializza la mappa Leaflet
let map = null;
let markersLayer = null;

document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;

  // Mostra il contenitore
  mapContainer.style.display = 'block';

  // Coordinate di default (Roma centrale)
  map = L.map('map-container').setView([41.9028, 12.4964], 12);

  // CartoDB Dark Matter
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
});

// Ascolta l'evento custom per il caricamento delle missioni
document.addEventListener('missionsLoaded', (e) => {
  const missions = e.detail;
  if (!map || !markersLayer) return;

  markersLayer.clearLayers();

  const customIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: #2d6a4f; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px #2d6a4f;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  const bounds = L.latLngBounds();
  let hasValidCoords = false;

  missions.forEach(m => {
    if (m.lat && m.lng) {
      hasValidCoords = true;
      const marker = L.marker([m.lat, m.lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: var(--font-body); color: #333;">
          <strong style="font-family: var(--font-display); font-size: 1.1rem; color: #000;">${m.title}</strong><br>
          <span style="color: #666; font-size: 0.9rem;">${m.difficulty} | ${m.points} PT</span><br>
          <a href="/mission-detail.html?id=${m.id}" style="color: #00ff88; text-decoration: none; display: inline-block; margin-top: 5px; padding: 3px 8px; background: #222; border-radius: 3px;">Vai alla missione</a>
        </div>
      `);

      marker.addTo(markersLayer);
      bounds.extend([m.lat, m.lng]);
    }
  });

  // Adegua lo zoom della mappa
  if (hasValidCoords) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  } else {
    map.setView([41.9028, 12.4964], 12);
  }
});
