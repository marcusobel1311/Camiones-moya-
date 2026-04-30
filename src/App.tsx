/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Database, AlertTriangle, Loader2 } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DriverView from './components/DriverView';
import AdminView from './components/AdminView';
import { AppProvider, useAppContext } from './context/AppContext';

const DBStatusBanner = () => {
  const { dbStatus } = useAppContext();

  if (dbStatus === 'connected') {
    return (
      <div className="w-full py-1.5 px-4 bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md z-50 relative">
         <Database size={14} /> Conectado a la base de datos (Supabase)
      </div>
    );
  }

  return (
    <div className={`w-full py-1.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md z-50 relative ${
      dbStatus === 'connecting' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
    }`}>
       {dbStatus === 'connecting' ? (
         <><Loader2 size={14} className="animate-spin" /> Conectando a la base de datos...</>
       ) : (
         <><AlertTriangle size={14} /> Faltan tablas o error de conexión con Supabase (La vista estará vacía)</>
       )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <DBStatusBanner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/gerente" element={<Dashboard role="gerente" />} />
          <Route path="/conductor" element={<DriverView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
