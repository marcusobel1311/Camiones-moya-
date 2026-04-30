import { useState } from 'react';
import { MOCK_TRUCKS } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { Truck as TruckIcon, Key, Route, ShieldCheck, Fuel, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DriverView() {
  const navigate = useNavigate();
  const { trucks, trips } = useAppContext();
  // Simulate logged in driver. In a real app this comes from Auth.
  const truck = trucks[0]; // Carlos Mendoza (AM-1042)
  const activeTrips = trips.filter(t => t.assignedTruckId === truck?.id);
  
  const [unlockCode, setUnlockCode] = useState<{ binary: string, hex: string } | null>(null);

  const generateCode = () => {
    // Generates 8-bit binary string
    const binStr = Array.from({length: 8}, () => Math.floor(Math.random() * 2)).join('');
    // Binary string to hexadecimal conversion
    const hexStr = parseInt(binStr, 2).toString(16).toUpperCase().padStart(2, '0');
    setUnlockCode({ binary: binStr, hex: hexStr });
  };

  if (!truck) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-6 text-center">
         <AlertTriangle size={48} className="text-gray-300 mb-4" />
         <h1 className="text-xl font-bold text-gray-700 mb-2">No hay camiones disponibles</h1>
         <p className="text-gray-500 max-w-sm mb-6">El sistema no pudo cargar camiones desde la base de datos o no hay registros.</p>
         <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-sm">
            Volver al inicio
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen truck-bg flex flex-col font-sans">
      {/* Header */}
      <div className="bg-amber-600/80 backdrop-blur-md text-white p-4 shadow-md flex items-center justify-between z-10 sticky top-0 border-b border-amber-500/30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="hover:bg-amber-700/50 p-2 rounded-full transition-colors">
             <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg leading-tight">Portal del Conductor</h1>
            <h2 className="font-light text-sm text-amber-200">Placa: {truck.plate}</h2>
          </div>
        </div>
        <div className="bg-amber-800/60 px-3 py-1 rounded-full text-xs font-bold shadow-inner backdrop-blur-sm">
          {truck.driver.name}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full space-y-6">
        
        {/* Welcome & Status */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-sm border border-white/30 p-6">
           <h2 className="text-xl font-bold text-gray-900 mb-1 drop-shadow-sm">¡Buen viaje, {truck.driver.name === 'Sin Asignar' ? 'Conductor' : truck.driver.name.split(' ')[0]}!</h2>
           <p className="text-gray-700 text-sm mb-4 font-medium">Actualmente te encuentras en {truck.location.address}</p>
           
           <div className="flex bg-amber-50/60 backdrop-blur-sm rounded-lg p-3 items-center gap-3 border border-amber-200">
              <TruckIcon className="text-amber-700" size={24} />
              <div>
                 <p className="text-xs font-bold uppercase text-amber-900">Estado del Vehículo</p>
                 <p className="text-sm text-amber-950 font-medium">{truck.vehicle.brand} {truck.vehicle.model} - Operativo</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Rutas Asignadas */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/30">
            <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 flex items-center gap-2">
              <Route size={18} /> Rutas Asignadas
            </h3>
            {(truck.routes.length > 0 || activeTrips.length > 0) ? (
               <div className="space-y-4">
                 {activeTrips.map(r => (
                   <div key={r.id} className="relative pl-6 border-l-2 border-blue-400 last:border-transparent pb-4 last:pb-0">
                      <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full ${r.status === 'in-progress' ? 'bg-blue-600 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]' : r.status === 'completed' ? 'bg-emerald-600' : 'bg-gray-400'}`}></div>
                      <p className="font-bold text-blue-950 text-sm">{r.name}</p>
                      <p className="text-xs text-gray-700 mt-1 uppercase font-bold">
                        {r.status === 'completed' ? 'Completada' : r.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
                      </p>
                      {r.status === 'in-progress' && (
                        <div className="mt-2 w-full bg-white/50 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '50%' }}></div>
                        </div>
                      )}
                   </div>
                 ))}
               </div>
            ) : (
               <p className="text-sm text-gray-700 font-medium">No hay rutas asignadas.</p>
            )}
          </div>

          {/* Vehículo & Combustible */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/30 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 flex items-center gap-2">
                <Fuel size={18} /> Nivel de Combustible
              </h3>
              <div className="flex justify-between items-end mb-2">
                 <span className="text-3xl font-black text-gray-900">{truck.fuel.amountLiters.toFixed(0)}<span className="text-lg text-gray-600 font-medium">L</span></span>
                 <span className="text-sm text-gray-700 font-bold">de {truck.fuel.capacityLiters}L</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-3 mb-2">
                <div className="bg-emerald-600 h-3 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${(truck.fuel.amountLiters / truck.fuel.capacityLiters) * 100}%` }}></div>
              </div>
              <p className="text-xs text-gray-700 font-bold text-right">{truck.fuel.type}</p>
            </div>
          </div>
        </div>

        {/* Flete code / Hex Generator */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden border border-white/10">
           <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <ShieldCheck size={180} />
           </div>
           <div className="relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                <Key size={20} className="text-amber-400" />
                Validación de Apertura
              </h3>
              <p className="text-sm text-slate-300 mb-6 max-w-sm">
                Genera tu código de verificación. El sistema convertirá un código binario aleatorio en hexadecimal para asegurar la apertura del flete.
              </p>

              <button 
                onClick={generateCode}
                className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-black py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-wider text-sm"
              >
                Generar Nuevo Código
              </button>

              {unlockCode && (
                <div className="mt-6 bg-black/40 backdrop-blur-sm rounded-xl p-5 border border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between">
                   <div className="flex-1 w-full text-center md:text-left">
                     <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Binario Base</p>
                     <p className="font-mono text-slate-300 tracking-widest">{unlockCode.binary}</p>
                   </div>
                   <div className="hidden md:block w-px h-12 bg-slate-700"></div>
                   <div className="flex-1 w-full text-center md:text-right">
                     <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Código de Apertura</p>
                     <p className="font-mono text-4xl text-amber-400 font-black tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                       {unlockCode.hex}
                     </p>
                   </div>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
