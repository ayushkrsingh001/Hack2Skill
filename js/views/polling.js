/**
 * Polling View — Google Maps-based polling booth locator
 */
import { t } from '../i18n.js';
import { showToast } from '../components.js';

let map = null;
let markersLayer = null;

// Sample polling booth data (in production, this comes from ECI API)
const sampleBooths = [
  { lat: 28.6139, lng: 77.2090, name: 'Govt. Boys Sr. Sec. School', area: 'Connaught Place, New Delhi', constituency: 'New Delhi' },
  { lat: 19.0760, lng: 72.8777, name: 'BMC School No. 4', area: 'Dadar, Mumbai', constituency: 'Mumbai South' },
  { lat: 12.9716, lng: 77.5946, name: 'Govt. High School', area: 'MG Road, Bangalore', constituency: 'Bangalore Central' },
  { lat: 22.5726, lng: 88.3639, name: 'Kolkata Municipal School', area: 'Park Street, Kolkata', constituency: 'Kolkata Dakshin' },
  { lat: 13.0827, lng: 80.2707, name: 'Corporation School', area: 'T. Nagar, Chennai', constituency: 'Chennai South' },
  { lat: 26.9124, lng: 75.7873, name: 'Rajkiya Vidyalaya', area: 'MI Road, Jaipur', constituency: 'Jaipur' },
  { lat: 23.0225, lng: 72.5714, name: 'Nagar Prathmik Shala', area: 'CG Road, Ahmedabad', constituency: 'Ahmedabad East' },
  { lat: 17.3850, lng: 78.4867, name: 'Govt. Primary School', area: 'Banjara Hills, Hyderabad', constituency: 'Hyderabad' },
];

export function render() {
  return `
  <section class="view-polling" aria-label="Find Polling Booth">
    <h1 class="view-title">${t('polling.title')}</h1>
    <p class="view-subtitle">Locate your nearest polling station using the map below.</p>
    <div class="polling-controls">
      <div class="search-box">
        <input type="text" id="polling-search" placeholder="${t('polling.search')}" 
               data-i18n-placeholder="polling.search" aria-label="Search polling booth">
        <button class="btn btn-primary" id="polling-search-btn">🔍 Search</button>
      </div>
      <button class="btn btn-outline" id="polling-near-me">
        📍 ${t('polling.nearMe')}
      </button>
    </div>
    <div class="map-container" id="map-container">
      <div id="google-map" class="google-map" aria-label="Polling booth map"></div>
      <div class="map-fallback" id="map-fallback" style="display:none;">
        <div class="map-fallback-icon">🗺️</div>
        <h3>Map Unavailable</h3>
        <p>Google Maps could not be loaded. You can find your polling booth at 
        <a href="https://voters.eci.gov.in" target="_blank" rel="noopener">voters.eci.gov.in</a></p>
      </div>
    </div>
    <div class="booth-list" id="booth-list" role="list" aria-label="Polling booth results"></div>
    <div class="info-box info-tip" style="margin-top:1rem;">
      💡 <strong>Tip:</strong> You can also find your polling booth via the 
      <a href="https://voters.eci.gov.in" target="_blank" rel="noopener">NVSP Portal</a> or the Voter Helpline App.
    </div>
  </section>`;
}

function renderBoothCards(booths) {
  const list = document.getElementById('booth-list');
  if (!list) return;
  list.innerHTML = booths.map(b => `
    <div class="booth-card" role="listitem" tabindex="0">
      <div class="booth-icon">🏫</div>
      <div class="booth-info">
        <strong>${b.name}</strong>
        <span>${b.area}</span>
        <span class="booth-constituency">📍 ${b.constituency}</span>
      </div>
    </div>
  `).join('');
}

function initLeafletMap() {
  const mapEl = document.getElementById('google-map');
  const fallback = document.getElementById('map-fallback');
  if (!mapEl) return;

  if (typeof L === 'undefined') {
    mapEl.style.display = 'none';
    if (fallback) fallback.style.display = 'flex';
    renderBoothCards(sampleBooths);
    return;
  }

  try {
    map = L.map(mapEl).setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    updateMapMarkers(sampleBooths);
    renderBoothCards(sampleBooths);
  } catch (e) {
    console.warn('Map init failed:', e);
    mapEl.style.display = 'none';
    if (fallback) fallback.style.display = 'flex';
    renderBoothCards(sampleBooths);
  }
}

function updateMapMarkers(booths) {
  if (!markersLayer) return;
  markersLayer.clearLayers();
  booths.forEach(booth => {
    const marker = L.marker([booth.lat, booth.lng]).addTo(markersLayer);
    marker.bindPopup(`<div style="color:#333;"><strong>${booth.name}</strong><br>${booth.area}<br><em>${booth.constituency}</em></div>`);
  });
}

export function mount() {
  setTimeout(initLeafletMap, 100);

  document.getElementById('polling-near-me')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        if (map) {
          map.setView([pos.coords.latitude, pos.coords.longitude], 14);
          L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map).bindPopup('Your Location').openPopup();
        }
      },
      () => showToast('Unable to get your location. Please search manually.'),
      { enableHighAccuracy: true }
    );
  });

  const performSearch = () => {
    const query = document.getElementById('polling-search')?.value?.toLowerCase().trim() || '';

    if (!query) {
      renderBoothCards(sampleBooths);
      updateMapMarkers(sampleBooths);
      if (map) map.setView([20.5937, 78.9629], 5);
      return;
    }

    const results = sampleBooths.filter(b =>
      b.name.toLowerCase().includes(query) || b.area.toLowerCase().includes(query) ||
      b.constituency.toLowerCase().includes(query)
    );

    if (results.length === 0) {
      const list = document.getElementById('booth-list');
      if (list) list.innerHTML = '<div class="info-box info-warning" style="text-align:center; padding: 1rem;">No booths found matching your search. Please try a different location.</div>';
      updateMapMarkers([]);
      return;
    }

    renderBoothCards(results);
    updateMapMarkers(results);

    if (map && results.length > 0) {
      if (results.length === 1) {
        map.setView([results[0].lat, results[0].lng], 14);
      } else {
        const bounds = L.latLngBounds(results.map(r => [r.lat, r.lng]));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  };

  document.getElementById('polling-search-btn')?.addEventListener('click', performSearch);
  document.getElementById('polling-search')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}

export function unmount() { map = null; markersLayer = null; }
