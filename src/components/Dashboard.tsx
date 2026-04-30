import { useState, useEffect } from 'react';
import { Truck as TruckIcon, Search, AlertTriangle, Info, Map, BarChart3, Clock, CheckCircle, ArrowLeft, Settings, Users, Bot } from 'lucide-react';
import { Truck, MOCK_TRUCKS } from '../data/mockData';
import MapView from './MapView';
import TruckDetails from './TruckDetails';
import ChartsView from './ChartsView';
import AdministrationView from './AdministrationView';
import ManagementView from './ManagementView';
import ConsultasView from './ConsultasView';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Dashboard({ role = "admin" }: { role?: "admin" | "gerente" }) {
  const navigate = useNavigate();
  const { trucks } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTruckId, setSelectedTruckId] = useState<string | undefined>(trucks[0]?.id);
  const [activeTab, setActiveTab] = useState<'map' | 'charts' | 'gestion' | 'administrar' | 'consultas'>('map');

  // Auto-select first truck when loaded if none selected
  useEffect(() => {
    if (!selectedTruckId && trucks.length > 0) {
      setSelectedTruckId(trucks[0].id);
    }
  }, [trucks, selectedTruckId]);

  const selectedTruck = trucks.find(t => t.id === selectedTruckId) || null;

  const filteredTrucks = trucks.filter(t => 
    t.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen truck-bg font-sans text-gray-900 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-80 bg-white/60 backdrop-blur-lg border-r border-gray-200 flex flex-col z-20 shadow-md">
        <div className="p-4 bg-blue-900 text-white flex items-center gap-3">
          <button onClick={() => navigate('/')} className="hover:bg-blue-800 p-1.5 rounded-full transition-colors mr-1">
            <ArrowLeft size={18} />
          </button>
          <TruckIcon size={24} className="text-blue-400" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Empresa</h1>
            <h2 className="font-light text-sm text-blue-200">Alexander Moya - {role === 'admin' ? 'Admin' : 'Gerente'}</h2>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por placa..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTrucks.map(truck => (
            <button
              key={truck.id}
              onClick={() => setSelectedTruckId(truck.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedTruck?.id === truck.id 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-800">{truck.plate}</span>
                {truck.status === 'active' && <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle size={12}/> Activo</span>}
                {truck.status === 'stopped' && <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full"><Clock size={12}/> Detenido</span>}
                {truck.status === 'maintenance' && <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full"><AlertTriangle size={12}/> Taller</span>}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Map size={12} /> {truck.status === 'active' 
                  ? `${truck.location.lat.toFixed(4)}, ${truck.location.lng.toFixed(4)} (En ruta)` 
                  : truck.location.address}
              </div>
            </button>
          ))}
          {filteredTrucks.length === 0 && (
            <div className="text-center p-4 text-gray-500 text-sm">
              No se encontraron camiones.
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <div className="h-14 bg-white/60 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-10">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 text-sm font-medium pb-4 pt-5 px-2 border-b-2 transition-colors ${activeTab === 'map' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Map size={18} /> Vista General (Mapa)
            </button>
            <button 
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-2 text-sm font-medium pb-4 pt-5 px-2 border-b-2 transition-colors ${activeTab === 'charts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <BarChart3 size={18} /> Gráficas en Tiempo Real
            </button>
            <button 
              onClick={() => setActiveTab('gestion')}
              className={`flex items-center gap-2 text-sm font-medium pb-4 pt-5 px-2 border-b-2 transition-colors ${activeTab === 'gestion' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Settings size={18} /> Gestión
            </button>
            <button 
              onClick={() => setActiveTab('administrar')}
              className={`flex items-center gap-2 text-sm font-medium pb-4 pt-5 px-2 border-b-2 transition-colors ${activeTab === 'administrar' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Users size={18} /> Administrar
            </button>
            <button 
              onClick={() => setActiveTab('consultas')}
              className={`flex items-center gap-2 text-sm font-medium pb-4 pt-5 px-2 border-b-2 transition-colors ${activeTab === 'consultas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Bot size={18} /> Consultas IA
            </button>
          </div>
          {role === 'admin' && (
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Panel de Administración
            </div>
          )}
        </div>

        {/* Dynamic Area */}
        <div className="flex-1 flex overflow-hidden truck-bg">
          {/* Map or Charts */}
          <div className="flex-1 relative z-0 bg-white/20">
            {activeTab === 'map' ? (
              <MapView selectedTruck={selectedTruck} />
            ) : activeTab === 'charts' ? (
              <ChartsView />
            ) : activeTab === 'gestion' ? (
              <ManagementView role={role} />
            ) : activeTab === 'consultas' ? (
              <ConsultasView />
            ) : (
              <AdministrationView />
            )}
          </div>
          
          {/* Truck Right Details Panel */}
          {selectedTruck && (
            <div className="w-[400px] border-l border-gray-200 bg-white/60 backdrop-blur-lg overflow-y-auto shadow-xl z-10 flex flex-col">
              <TruckDetails truck={selectedTruck} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
