import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, Popup, Polyline, useMapEvents, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPoint, MapRoute } from '../types';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom DayZ style marker
const tacticalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface TacticalMapProps {
  center: [number, number];
  zoom: number;
  markers: MapPoint[];
  routes: MapRoute[];
  isAdmin: boolean;
  onAddMarker?: (point: MapPoint) => void;
  onAddRoutePoint?: (point: { lat: number; lng: number }) => void;
  onFinishRoute?: () => void;
  isDrawingRoute?: boolean;
}

function MapEvents({ 
  isAdmin, 
  onAddMarker, 
  onAddRoutePoint, 
  isDrawingRoute 
}: { 
  isAdmin: boolean; 
  onAddMarker?: (p: MapPoint) => void;
  onAddRoutePoint?: (p: { lat: number; lng: number }) => void;
  isDrawingRoute?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!isAdmin) return;
      
      if (isDrawingRoute && onAddRoutePoint) {
        onAddRoutePoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      } else if (onAddMarker) {
        const label = window.prompt("Enter marker label (optional):");
        if (label !== null) {
          onAddMarker({ lat: e.latlng.lat, lng: e.latlng.lng, label: label || undefined });
        }
      }
    },
  });
  return null;
}

export default function TacticalMap({
  center,
  zoom,
  markers,
  routes,
  isAdmin,
  onAddMarker,
  onAddRoutePoint,
  onFinishRoute,
  isDrawingRoute
}: TacticalMapProps) {
  
  // We use L.CRS.Simple for a flat image map instead of geographical coordinates.
  // The bounds define the coordinate system for the image.
  const bounds: L.LatLngBoundsExpression = [[0, 0], [100, 100]];
  
  // TODO: Replace this URL with the actual high-res Chernarus map image URL
  const mapImageUrl = 'https://external-preview.redd.it/map-of-chernarous-v0-LypC5oU6NLh1-GUf6JST-JMWVg-hp17ySGTFXuP2PmA.jpg?width=1080&crop=smart&auto=webp&s=51704f83a90031deba5110e81172f171f42ded79';

  return (
    <div className="relative w-full h-[500px] border-2 border-zinc-800 rounded overflow-hidden">
      {isAdmin && (
        <div className="absolute top-4 right-4 z-[1000] bg-zinc-900/90 p-2 rounded border border-zinc-700 shadow-lg backdrop-blur text-xs font-mono">
          <div className="text-green-500 font-bold mb-2 uppercase tracking-wider border-b border-zinc-700 pb-1">Admin Controls</div>
          {isDrawingRoute ? (
            <div className="flex flex-col gap-2">
              <span className="text-zinc-300">Click map to add route points</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onFinishRoute?.(); }}
                className="bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
              >
                Finish Route
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-zinc-300">Click map to add marker</span>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  // This is handled in the parent component to toggle state
                  // We just show the instruction here. The parent passes isDrawingRoute.
                }}
                className="text-zinc-500 italic"
              >
                (Toggle route mode below map)
              </button>
            </div>
          )}
        </div>
      )}

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        className="z-0"
        crs={L.CRS.Simple}
        maxZoom={5}
        minZoom={1}
      >
        <ImageOverlay
          url={mapImageUrl}
          bounds={bounds}
        />
        
        <MapEvents 
          isAdmin={isAdmin} 
          onAddMarker={onAddMarker} 
          onAddRoutePoint={onAddRoutePoint} 
          isDrawingRoute={isDrawingRoute} 
        />

        {markers.map((marker, idx) => (
          <Marker key={`marker-${idx}`} position={[marker.lat, marker.lng]} icon={tacticalIcon}>
            {marker.label && (
              <Popup className="font-mono">
                <strong className="text-zinc-900 uppercase tracking-wider">{marker.label}</strong>
              </Popup>
            )}
          </Marker>
        ))}

        {routes.map((route) => (
          <Polyline 
            key={route.id} 
            positions={route.points} 
            pathOptions={{ color: route.color, weight: 4, dashArray: '10, 10', opacity: 0.8 }} 
          />
        ))}
      </MapContainer>
    </div>
  );
}
