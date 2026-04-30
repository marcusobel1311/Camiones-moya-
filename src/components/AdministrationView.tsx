import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Truck, UserPlus, Trash2, PlusCircle } from 'lucide-react';

export default function AdministrationView() {
  const { drivers, addDriver, removeDriver, trucks, addTruck, removeTruck } = useAppContext();

  const handleAddDriver = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addDriver({
      name: fd.get('name') as string,
      age: parseInt(fd.get('age') as string, 10),
      license: fd.get('license') as string
    });
    e.currentTarget.reset();
  };

  const handleAddTruck = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addTruck({
      plate: fd.get('plate') as string,
      brand: fd.get('brand') as string,
      model: fd.get('model') as string,
      year: parseInt(fd.get('year') as string, 10),
      color: fd.get('color') as string,
      fuelType: fd.get('fuelType') as string,
      fuelCapacity: parseFloat(fd.get('fuelCapacity') as string),
      details: fd.get('details') as string,
      driverId: fd.get('driverId') as string
    });
    e.currentTarget.reset();
  };

  return (
    <div className="p-8 h-full overflow-y-auto w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Administrar Flota</h2>
        <p className="text-gray-500">Agregue o elimine conductores y camiones del sistema.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Panel Conductores */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-amber-50/30">
             <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2">
               <UserPlus className="text-amber-500" size={24} /> 
               Conductores
             </h3>
             <p className="text-sm text-gray-500 mt-1">Gestión del personal de conducción.</p>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="flex-1 overflow-y-auto max-h-64 pr-2">
              <ul className="space-y-3">
                 {drivers.map(d => (
                   <li key={d.id} className="text-sm border border-gray-100 rounded-lg p-3 flex justify-between items-center shadow-sm">
                     <div>
                       <strong className="text-gray-800 block text-base">{d.name}</strong> 
                       <span className="text-xs text-gray-500">Licencia: <span className="font-mono">{d.license}</span> | Edad: {d.age}</span>
                     </div>
                     <button 
                       onClick={() => removeDriver(d.id)}
                       className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                       title="Eliminar Conductor"
                     >
                       <Trash2 size={18} />
                     </button>
                   </li>
                 ))}
                 {drivers.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No hay conductores registrados.</p>}
              </ul>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <PlusCircle size={16} className="text-amber-500"/>
                Agregar Nuevo Conductor
              </h4>
              <form onSubmit={handleAddDriver} className="space-y-3">
                 <input name="name" type="text" placeholder="Nombre completo" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500" />
                 <div className="flex gap-3">
                   <input name="age" type="number" placeholder="Edad" required className="w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500" />
                   <input name="license" type="text" placeholder="Licencia / Identificación" required className="w-2/3 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500" />
                 </div>
                 <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold py-3 rounded-xl transition-colors shadow-sm text-sm">
                   Registrar Conductor
                 </button>
              </form>
            </div>
          </div>
        </div>

        {/* Panel Camiones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-blue-50/30">
             <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
               <Truck className="text-blue-500" size={24} /> 
               Camiones
             </h3>
             <p className="text-sm text-gray-500 mt-1">Gestión de la flota vehicular.</p>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="flex-1 overflow-y-auto max-h-64 pr-2">
              <ul className="space-y-3">
                 {trucks.map(t => (
                   <li key={t.id} className="text-sm border border-gray-100 rounded-lg p-3 flex justify-between items-center shadow-sm">
                     <div>
                       <strong className="text-gray-800 block text-base">{t.plate}</strong> 
                       <span className="text-xs text-gray-500">{t.vehicle.brand} {t.vehicle.model} ({t.vehicle.year})</span>
                     </div>
                     <button 
                       onClick={() => removeTruck(t.id)}
                       className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                       title="Eliminar Camión"
                     >
                       <Trash2 size={18} />
                     </button>
                   </li>
                 ))}
                 {trucks.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No hay camiones registrados.</p>}
              </ul>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <PlusCircle size={16} className="text-blue-500"/>
                Agregar Nuevo Camión
              </h4>
              <form onSubmit={handleAddTruck} className="space-y-3">
                 <div className="grid grid-cols-2 gap-3">
                   <input name="plate" type="text" placeholder="Placa (Ej. AAA-123)" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 uppercase" />
                   <input name="color" type="text" placeholder="Color" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                   <input name="brand" type="text" placeholder="Marca" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" />
                   <input name="model" type="text" placeholder="Modelo" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" />
                   <input name="year" type="number" placeholder="Año" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <input name="fuelCapacity" type="number" step="any" placeholder="Cap. Combustible (L)" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" />
                   <select name="fuelType" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500">
                     <option value="Diesel Corriente">Diesel Corriente</option>
                     <option value="Diesel Extra">Diesel Extra</option>
                     <option value="Gasolina">Gasolina</option>
                   </select>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <select name="driverId" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500">
                     <option value="">Sin Conductor (Opcional)</option>
                     {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                     ))}
                   </select>
                   <input name="details" type="text" placeholder="Detalles (Ej. Furgón...)" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm">
                   Registrar Camión
                 </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
