'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const riderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LiveTrackingMapProps {
  riderLat?: number;
  riderLng?: number;
  customerLat?: number;
  customerLng?: number;
  zoom?: number;
}

// Helper component to auto-center the map when the rider moves
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

// We must use default export for next/dynamic to work easily
export default function LiveTrackingMap({ riderLat, riderLng, customerLat, customerLng, zoom = 14 }: LiveTrackingMapProps) {
  // Center is either rider or customer or default Dhaka
  const centerLat = riderLat || customerLat || 23.8103;
  const centerLng = riderLng || customerLng || 90.4125;

  return (
    <div className="w-full h-full rounded-md overflow-hidden border">
      <MapContainer center={[centerLat, centerLng]} zoom={zoom} scrollWheelZoom={false} className="w-full h-full min-h-[300px] z-0">
        {/* Use CartoDB Voyager for a modern, clean look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {riderLat !== undefined && riderLng !== undefined && (
          <>
            <Marker position={[riderLat, riderLng]} icon={riderIcon}>
              <Popup>
                Rider&apos;s Current Location
              </Popup>
            </Marker>
            <MapUpdater lat={riderLat} lng={riderLng} />
          </>
        )}

        {customerLat !== undefined && customerLng !== undefined && (
          <Marker position={[customerLat, customerLng]} icon={customIcon}>
            <Popup>
              Delivery Destination
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
