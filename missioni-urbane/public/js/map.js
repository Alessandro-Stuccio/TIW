async function loadMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;

  const map = L.map('map-container').setView([41.9028, 12.4964], 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map);

  try {
    // Aggiornato per rimuovere il prefisso globale /api dal fetch, usiamo la rotta specifica isolata
    const res = await fetch('/missions/api/map-data');
    if (!res.ok) throw new Error('Errore map data');
    const mapMissions = await res.json();
    
    if (mapMissions.length > 0) {
      mapContainer.style.display = 'block';
      setTimeout(() => map.invalidateSize(), 100);

      const bounds = L.latLngBounds();
      mapMissions.forEach(m => {
        if (m.lat && m.lng) {
          const customMarker = L.divIcon({
            className: 'custom-neon-marker',
            html: '<div class="neon-marker"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -15]
          });
          const marker = L.marker([m.lat, m.lng], { icon: customMarker }).addTo(map);
          marker.bindPopup(`<b>${m.title}</b><br>${m.points} pt<br><a href="/missions/${m.id}">Vedi</a>`);
          bounds.extend([m.lat, m.lng]);
        }
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  } catch (err) {
    console.error('Errore caricamento mappa', err);
  }
}

document.addEventListener('DOMContentLoaded', loadMap);
