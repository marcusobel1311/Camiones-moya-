import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Truck } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { Target } from 'lucide-react';

// Custom icons based on status
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9h-4V5h-4v12h3"/><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/></svg>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const icons = {
  active: createIcon('#10b981'), // Emerald 500
  stopped: createIcon('#f59e0b'), // Amber 500
  maintenance: createIcon('#ef4444'), // Red 500
};

function RecenterControl({ selectedTruck }: { selectedTruck: Truck | null }) {
  const map = useMap();
  const prevTruckId = useRef<string | null>(null);

  useEffect(() => {
    // Only auto-center if it's a DIFFERENT truck being selected
    if (selectedTruck && selectedTruck.id !== prevTruckId.current) {
      map.setView([selectedTruck.location.lat, selectedTruck.location.lng], 13, {
        animate: true,
        duration: 0.5
      });
      prevTruckId.current = selectedTruck.id;
    } else if (!selectedTruck) {
      prevTruckId.current = null;
    }
  }, [selectedTruck, map]);

  if (!selectedTruck) return null;

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar" style={{ marginBottom: '20px', marginRight: '10px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            map.setView([selectedTruck.location.lat, selectedTruck.location.lng], map.getZoom(), { animate: true });
          }}
          className="bg-white hover:bg-gray-50 flex items-center justify-center w-[34px] h-[34px] rounded text-blue-600 transition-colors"
          title="Centrar en el camión"
        >
          <Target size={20} />
        </button>
      </div>
    </div>
  );
}

interface MapViewProps {
  selectedTruck: Truck | null;
}

export default function MapView({ selectedTruck }: MapViewProps) {
  const { trucks, trips } = useAppContext();
  const center: [number, number] = [10.4806, -66.9036]; // Caracas

  return (
    <MapContainer 
      center={selectedTruck ? [selectedTruck.location.lat, selectedTruck.location.lng] : center} 
      zoom={10} 
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {/* Rutas Activas */}
      {trips.filter(t => t.status === 'in-progress' && t.routePath).map(trip => (
        <Polyline 
          key={`route-${trip.id}`} 
          positions={trip.routePath!} 
          color="#3b82f6" 
          weight={5} 
          opacity={0.6} 
          dashArray="10, 10"
        />
      ))}
      
      {trucks.map(truck => (
        <Marker 
          key={truck.id}
          position={[truck.location.lat, truck.location.lng]}
          icon={icons[truck.status]}
          zIndexOffset={selectedTruck?.id === truck.id ? 1000 : 0}
        >
          <Popup>
            <div className="text-sm font-sans min-w-[200px]">
              <strong className="block text-base mb-1">{truck.plate}</strong>
              <div className="text-gray-600 mb-2">{truck.location.address}</div>
              <div className="font-semibold text-blue-600 mb-2">Chofer: {truck.driver.name}</div>
              
              {(() => {
                const activeTrip = trips.find(t => t.assignedTruckId === truck.id && t.status === 'in-progress');
                if(!activeTrip || !activeTrip.startTimeMs || !activeTrip.durationMs) return null;
                const elapsed = Date.now() - activeTrip.startTimeMs;
                const remaining = activeTrip.durationMs - elapsed;
                const progress = Math.min(100, Math.max(0, (elapsed / activeTrip.durationMs) * 100));
                
                const formatTime = (ms: number) => {
                   const totalSeconds = Math.max(0, Math.floor(ms / 1000));
                   const hours = Math.floor(totalSeconds / 3600);
                   const mins = Math.floor((totalSeconds % 3600) / 60);
                   if(hours > 0) return `${hours}h ${mins}m`;
                   return `${mins}m`;
                };

                return (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-bold uppercase text-blue-800 mb-1">Ruta: {activeTrip.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
                       <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${progress}%`}}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                       <span>Faltan: {formatTime(remaining)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </Popup>
        </Marker>
      ))}
      <RecenterControl selectedTruck={selectedTruck} />
    </MapContainer>
  );
}
