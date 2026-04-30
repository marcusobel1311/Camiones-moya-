import { useState, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, UserPlus, Truck, MapPin, Search } from 'lucide-react';

export default function ManagementView({ role }: { role: string }) {
  const { trips, addTrip, drivers, addDriver, trucks, assignAndStartTrip, updateTripTruckType } = useAppContext();

  // Obtener conductores disponibles (que no están en camiones activos)
  const busyDriverIds = trucks.filter(t => t.status === 'active' && t.driver?.id).map(t => t.driver.id);
  const availableDrivers = drivers.filter(d => !busyDriverIds.includes(d.id));

  // Create Trip State
  const [newTripName, setNewTripName] = useState('');
  const [newTripStartCoordLat, setNewTripStartCoordLat] = useState('10.4806');
  const [newTripStartCoordLng, setNewTripStartCoordLng] = useState('-66.9036');
  const [newTripEndCoordLat, setNewTripEndCoordLat] = useState('10.1620');
  const [newTripEndCoordLng, setNewTripEndCoordLng] = useState('-68.0077');
  
  // Assign Truck/Driver State
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // Address Search State
  const [searchStartAddress, setSearchStartAddress] = useState('');
  const [searchEndAddress, setSearchEndAddress] = useState('');
  const [isSearchingStart, setIsSearchingStart] = useState(false);
  const [isSearchingEnd, setIsSearchingEnd] = useState(false);

  const searchLocation = async (address: string, isStart: boolean) => {
    if (!address.trim()) return;
    if (isStart) setIsSearchingStart(true); else setIsSearchingEnd(true);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ve`);
      const data = await res.json();
      if (data && data.length > 0) {
        if (isStart) {
          setNewTripStartCoordLat(data[0].lat);
          setNewTripStartCoordLng(data[0].lon);
        } else {
          setNewTripEndCoordLat(data[0].lat);
          setNewTripEndCoordLng(data[0].lon);
          const displayName = data[0].display_name.split(',')[0];
          if(!newTripName) setNewTripName(`Ruta a ${displayName}`);
        }
      } else {
        alert("No se encontró la ubicación.");
      }
    } catch (err) {
      alert("Error al buscar la ubicación.");
    } finally {
      if (isStart) setIsSearchingStart(false); else setIsSearchingEnd(false);
    }
  };

  const handleAddTrip = (e: FormEvent) => {
    e.preventDefault();
    if(!newTripName) return;

    addTrip({
      name: newTripName,
      startName: searchStartAddress || 'Origen',
      endName: searchEndAddress || 'Destino',
      startCoords: [parseFloat(newTripStartCoordLat), parseFloat(newTripStartCoordLng)],
      endCoords: [parseFloat(newTripEndCoordLat), parseFloat(newTripEndCoordLng)],
      requiredTruckType: 'Cualquiera',
      status: 'pending'
    });
    setNewTripName('');
    setSearchStartAddress('');
    setSearchEndAddress('');
  };

  const handleAssign = (tripId: string) => {
    if(!selectedTruckId) {
      alert("Seleccione un camión");
      return;
    }
    assignAndStartTrip(tripId, selectedTruckId, selectedDriverId || undefined);
  };

  return (
    <div className="p-8 h-full overflow-y-auto w-full space-y-8 bg-white/30 backdrop-blur-sm">
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">Gestión de Flota</h2>
        <p className="text-sm text-gray-500 font-medium">Crea rutas y asigna conductores con temática personalizada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-blue-500" size={24} /> 
            Rutas y Asignaciones
          </h3>

          <div className="space-y-4">
            {trips.filter(t => t.status !== 'pending' || !t.id.startsWith('LOCAL-RTN-')).map(trip => (
              <div key={trip.id} className="border border-gray-100 p-4 rounded-xl shadow-sm hover:border-blue-100 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900">{trip.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold
                          ${trip.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                            trip.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 
                            'bg-gray-100 text-gray-600'}`}>
                    {trip.status === 'completed' ? 'Completado' : trip.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">Requisito: {trip.requiredTruckType}</p>

                {trip.status === 'pending' && (
                  <div className="pt-3 border-t border-gray-100 flex gap-2 items-center text-sm">
                    <select 
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => updateTripTruckType(trip.id, e.target.value)}
                      value={trip.requiredTruckType}
                    >
                      <option value="Cualquiera">Camión: Cualquiera</option>
                      <option value="Refrigerado">Camión: Refrigerado</option>
                      <option value="Cisterna">Camión: Cisterna</option>
                      <option value="Estacas">Camión: Estacas</option>
                    </select>
                  </div>
                )}

                {trip.status === 'pending' && (
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <select 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSelectedTruckId(e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Seleccione un camión...</option>
                        {trucks.filter(t => t.status === 'stopped').map(t => (
                          <option key={t.id} value={t.id}>{t.plate} - {t.vehicle.details}</option>
                        ))}
                      </select>

                      <select 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Seleccione un conductor libre...</option>
                        {availableDrivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={() => handleAssign(trip.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                    >
                      Asignar Camión y Conductor
                    </button>
                  </div>
                )}

                {trip.status === 'in-progress' && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                     <p className="font-semibold text-blue-800">Camión Asignado: {trucks.find(t=>t.id === trip.assignedTruckId)?.plate}</p>
                     
                     {/* Timer computation */}
                     {(() => {
                       if(!trip.startTimeMs || !trip.durationMs) return null;
                       const elapsed = Date.now() - trip.startTimeMs;
                       const remaining = trip.durationMs - elapsed;
                       const progress = Math.min(100, Math.max(0, (elapsed / trip.durationMs) * 100));
                       
                       const formatTime = (ms: number) => {
                         const totalSeconds = Math.max(0, Math.floor(ms / 1000));
                         const hours = Math.floor(totalSeconds / 3600);
                         const mins = Math.floor((totalSeconds % 3600) / 60);
                         const secs = totalSeconds % 60;
                         if(hours > 0) return `${hours}h ${mins}m`;
                         return `${mins}m ${secs}s`;
                       };

                       return (
                         <div className="mt-4">
                           <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                             <span>Inicio: Hace {formatTime(elapsed)}</span>
                             <span>Faltan: {formatTime(remaining)}</span>
                           </div>
                           <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                             <div 
                               className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
                               style={{width: `${progress}%`}}
                             ></div>
                           </div>
                         </div>
                       );
                     })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Creadores - Forma */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-emerald-500" size={24} /> 
              Crear Nueva Ruta
            </h3>
            <form onSubmit={handleAddTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Evocativo (Ej. Caracas-Maracay)</label>
                <input 
                  type="text" 
                  value={newTripName}
                  onChange={e => setNewTripName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 mb-4" 
                  required 
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">1. Punto de Inicio</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ej. Caracas o Base Central"
                      value={searchStartAddress}
                      onChange={e => setSearchStartAddress(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchLocation(searchStartAddress, true))}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                    <button 
                      type="button"
                      onClick={() => searchLocation(searchStartAddress, true)}
                      disabled={isSearchingStart}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      {isSearchingStart ? '...' : <Search size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">Coord: {newTripStartCoordLat}, {newTripStartCoordLng}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">2. Punto de Destino</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ej. Valencia, Carabobo"
                      value={searchEndAddress}
                      onChange={e => setSearchEndAddress(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchLocation(searchEndAddress, false))}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                    <button 
                      type="button"
                      onClick={() => searchLocation(searchEndAddress, false)}
                      disabled={isSearchingEnd}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      {isSearchingEnd ? '...' : <Search size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">Coord: {newTripEndCoordLat}, {newTripEndCoordLng}</p>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
              >
                Registrar Ruta
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserPlus className="text-amber-500" size={24} /> 
              Conductores Activos
             </h3>
             <ul className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-2">
               {drivers.map(d => (
                 <li key={d.id} className="text-sm border-b border-gray-50 pb-2 flex justify-between items-center">
                   <strong className="text-gray-800">{d.name}</strong> 
                   <span className="text-xs font-mono text-gray-400">{d.license}</span>
                 </li>
               ))}
               {drivers.length === 0 && <p className="text-sm text-gray-400 italic">No hay conductores.</p>}
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
