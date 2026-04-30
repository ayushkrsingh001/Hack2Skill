/**
 * Google Maps Service — Polling booth location integration.
 *
 * WHY Google Maps:
 * - Provides real geocoding for address-to-coordinate conversion
 * - Interactive map with markers for polling booth visualization
 * - Geolocation API integration for "Find Near Me" feature
 * - Directions service for route planning to polling booths
 *
 * SETUP: Replace API key in index.html with your Google Maps API key.
 * Restrict by HTTP referrer in Google Cloud Console.
 *
 * @module maps
 */

let mapInstance = null;
let markers = [];

/**
 * Initialize a Google Map inside a specified container element.
 * @param {string} elementId - The DOM element ID to render the map into.
 * @param {object} [options={}] - Google Maps options (center, zoom, etc.).
 * @returns {google.maps.Map|null} The map instance or null if Google Maps is unavailable.
 */
export function initMap(elementId, options = {}) {
  const el = document.getElementById(elementId);
  if (!el || typeof google === 'undefined' || !google.maps) {
    return null;
  }

  mapInstance = new google.maps.Map(el, {
    center: options.center || { lat: 20.5937, lng: 78.9629 },
    zoom: options.zoom || 5,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] }
    ],
    mapTypeControl: false,
    streetViewControl: false,
    ...options
  });

  return mapInstance;
}

/**
 * Add polling booth markers to the map with info windows.
 * Clears existing markers before adding new ones.
 * @param {Array<{lat: number, lng: number, name: string, area: string, constituency: string}>} booths - Array of booth objects.
 */
export function addBoothMarkers(booths) {
  if (!mapInstance) return;

  markers.forEach(m => m.setMap(null));
  markers = [];

  booths.forEach(booth => {
    const marker = new google.maps.Marker({
      position: { lat: booth.lat, lng: booth.lng },
      map: mapInstance,
      title: booth.name,
      animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="color:#333;font-family:Inter,sans-serif;padding:4px;">
        <strong>${booth.name}</strong><br>
        <span>${booth.area}</span><br>
        <em style="color:#666;">${booth.constituency}</em>
      </div>`
    });

    marker.addListener('click', () => {
      markers.forEach(m => m.infoWindow?.close());
      infoWindow.open(mapInstance, marker);
    });

    marker.infoWindow = infoWindow;
    markers.push(marker);
  });
}

/**
 * Get the user's current geographic location via the Geolocation API.
 * @returns {Promise<{lat: number, lng: number}>} Resolves with latitude/longitude coordinates.
 * @throws {Error} If geolocation is not supported or permission is denied.
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

/**
 * Center the map on a specific location with the given zoom level.
 * @param {number} lat - Latitude coordinate.
 * @param {number} lng - Longitude coordinate.
 * @param {number} [zoom=14] - Zoom level (1-20).
 */
export function centerMap(lat, lng, zoom = 14) {
  if (mapInstance) {
    mapInstance.setCenter({ lat, lng });
    mapInstance.setZoom(zoom);
  }
}
