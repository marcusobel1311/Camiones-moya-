import { useState } from 'react';
import { Truck } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { AlertTriangle, User, Users, Fuel, Truck as TruckIcon, Calendar, Activity, Wrench, Route, ShieldCheck, Key } from 'lucide-react';

export default function TruckDetails({ truck }: { truck: Truck }) {
  const { trips } = useAppContext();
  const [unlockCode, setUnlockCode] = useState<{ binary: string, hex: string } | null>(null);

  const generateCode = () => {
    // Generate an 8-bit binary string
    const binStr = Array.from({length: 8}, () => Math.floor(Math.random() * 2)).join('');
    // Convert to Hexadecimal (parsed as Base-2 to Base-16)
    const hexStr = parseInt(binStr, 2).toString(16).toUpperCase().padStart(2, '0');
    setUnlockCode({ binary: binStr, hex: hexStr });
  };

  const isStoppedProlonged = truck.status === 'stopped' && truck.stopDurationMinutes > 30;
  
  // Combine static mock routes with active context trips for display
  const activeTrips = trips.filter(t => t.assignedTruckId === truck.id && t.status !== 'completed');

  return (
    <div className="flex-1 overflow-y-auto bg-transparent">
      {/* Header Info */}
      <div className="bg-white/40 backdrop-blur-md p-6 pb-4 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{truck.plate}</h2>
        <p className="text-gray-500 font-medium text-sm flex items-center gap-1 mt-1">
          {truck.vehicle.brand} {truck.vehicle.model} ({truck.vehicle.year})
        </p>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Alerts Section */}
        {isStoppedProlonged && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3 shadow-sm animate-pulse">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div>
              <h3 className="text-red-800 font-bold text-sm">Alerta de Detención</h3>
              <p className="text-red-700 text-xs mt-1">El camión lleva detenido {truck.stopDurationMinutes} minutos. Operación fuera de tiempo estimado.</p>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Driver Info */}
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-xs font-bold uppercase text-blue-800 mb-3 flex items-center gap-2">
              <User size={14} /> Tripulación
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Conductor Principal</p>
                <div className="flex justify-between items-end">
                  <p className="font-semibold text-gray-800">{truck.driver.name}</p>
                  {truck.driver.name !== 'Sin Asignar' && <p className="text-xs text-gray-500">Edad: {truck.driver.age}</p>}
                </div>
                {truck.driver.name !== 'Sin Asignar' && <p className="text-xs font-mono text-gray-500 mt-0.5">Licencia: {truck.driver.license}</p>}
              </div>
              <div className="pt-2 border-t border-blue-200/50">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Acompañante</p>
                {truck.companion ? (
                  <div className="flex justify-between items-end mt-1">
                    <p className="font-medium text-gray-700 text-sm">{truck.companion.name}</p>
                    <p className="text-xs text-gray-500">Edad: {truck.companion.age}</p>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-gray-500 italic mt-1">Viaja sin acompañante</p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Detalles */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
             <h3 className="text-xs font-bold uppercase text-gray-600 mb-3 flex items-center gap-2">
              <TruckIcon size={14} /> Detalles del Vehículo
            </h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Color</p>
                <p className="font-medium">{truck.vehicle.color}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Detalles</p>
                <p className="text-xs leading-tight mt-0.5 text-gray-700">{truck.vehicle.details}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <Fuel size={12}/> Combustible
                </span>
                <span className="text-xs font-bold">{truck.fuel.amountLiters.toFixed(0)} / {truck.fuel.capacityLiters} L</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(truck.fuel.amountLiters / truck.fuel.capacityLiters) * 100}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-500 text-right">{truck.fuel.type}</p>
            </div>
          </div>

          {/* History / Carreras */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-xs font-bold uppercase text-gray-600 mb-3 flex items-center gap-2">
              <Activity size={14} /> Historial de Carreras
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                <p className="text-[10px] text-gray-500 uppercase">Semana</p>
                <p className="font-bold text-lg text-blue-600">{truck.history.weekly}</p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                <p className="text-[10px] text-gray-500 uppercase">Quincena</p>
                <p className="font-bold text-lg text-blue-600">{truck.history.biweekly}</p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                <p className="text-[10px] text-gray-500 uppercase">Mes</p>
                <p className="font-bold text-lg text-blue-600">{truck.history.monthly}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 shadow-sm text-white">
                <p className="text-[10px] text-gray-400 uppercase">Total</p>
                <p className="font-bold text-lg">{truck.history.total}</p>
              </div>
            </div>
          </div>

          {/* Routes and Maintenance */}
          <div className="space-y-3">
             <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold uppercase text-gray-600 mb-2 flex items-center gap-2">
                  <Route size={14} /> Rutas Asignadas
                </h3>
                {(truck.routes.length > 0 || activeTrips.length > 0) ? (
                  <ul className="space-y-2">
                    {/* Render active contextual trips */}
                    {activeTrips.map(r => (
                      <li key={r.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-900 font-bold">{r.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold
                          ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                            r.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 
                            'bg-gray-100 text-gray-600'}`}>
                          {r.status === 'completed' ? 'Listo' : r.status === 'in-progress' ? 'En ruta' : 'Pendiente'}
                        </span>
                      </li>
                    ))}
                    {/* Render mock trips */}
                    {truck.routes.map(r => (
                      <li key={r.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-medium">{r.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold
                          ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                            r.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 
                            'bg-gray-100 text-gray-600'}`}>
                          {r.status === 'completed' ? 'Listo' : r.status === 'in-progress' ? 'En ruta' : 'Pendiente'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <p className="text-xs text-gray-400 italic">No hay rutas activas.</p>
                )}
             </div>

             <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold uppercase text-gray-600 mb-2 flex items-center gap-2">
                  <Wrench size={14} /> Mantenimientos
                </h3>
                {truck.maintenance.length > 0 ? (
                  <ul className="space-y-2">
                    {truck.maintenance.map((m, i) => (
                      <li key={i} className="text-sm">
                        <div className="flex items-center gap-2">
                           <Calendar size={12} className="text-gray-400"/>
                           <span className="text-xs text-gray-500">{m.date}</span>
                        </div>
                        <p className="text-gray-700 mt-0.5">{m.service}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic">No hay registros recientes.</p>
                )}
             </div>
          </div>

          {/* Validation Code */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white shadow-lg mt-2">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-emerald-400" />
              Validación de Fletes
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Genera el código hexadecimal para la apertura del camión.
            </p>
            
            <button 
              onClick={generateCode}
              className="w-full bg-white text-gray-900 font-bold text-sm py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Key size={16} /> Generar Código
            </button>

            {unlockCode && (
              <div className="mt-4 bg-gray-950 rounded-lg p-3 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] uppercase text-gray-500 font-bold">Binario Base</span>
                   <span className="font-mono text-xs text-gray-300">{unlockCode.binary}</span>
                </div>
                <div className="flex flex-col items-center pt-2 border-t border-gray-800">
                  <span className="text-[10px] uppercase text-gray-500 font-bold mb-1">Código Hexadecimal Apertura</span>
                  <span className="font-mono text-2xl text-emerald-400 font-black tracking-widest">
                    {unlockCode.hex}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
