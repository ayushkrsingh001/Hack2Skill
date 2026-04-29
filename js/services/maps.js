/**
 * Google Maps Service — Polling booth location integration
 * 
 * WHY Google Maps:
 * - Provides real geocoding for address-to-coordinate conversion
 * - Interactive map with markers for polling booth visualization
 * - Geolocation API integration for "Find Near Me" feature
 * - Directions service for route planning to polling booths
 * 
 * SETUP: Replace API key in index.html with your Google Maps API key.
 * Restrict by HTTP referrer in Google Cloud Console.
 */

let mapInstance = null;
let markers = [];

/** Initialize Google Map in a container element */
export function initMap(elementId, options = {}) {
  const el = document.getElementById(elementId);
  if (!el || typeof google === 'undefined' || !google.maps) {
    console.warn('Google Maps not available');
    return null;
  }

  mapInstance = new google.maps.Map(el, {
    center: options.center || { lat: 20.5937, lng: 78.9629 }, // India center
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

/** Add polling booth markers to the map */
export function addBoothMarkers(booths) {
  if (!mapInstance) return;
  
  // Clear existing markers
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

/** Get user's current location */
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

/** Center map on a location */
export function centerMap(lat, lng, zoom = 14) {
  if (mapInstance) {
    mapInstance.setCenter({ lat, lng });
    mapInstance.setZoom(zoom);
  }
}
