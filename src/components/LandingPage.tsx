import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck as TruckIcon, Briefcase, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'gerente' | 'conductor' | null>(null);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        // Sign IN strategy
        const { data, error } = await supabase.rpc('verificar_login', {
          p_email: email,
          p_password: password,
          p_role: selectedRole
        });

        if (error) {
          console.error("Supabase RPC Error:", error.message);
          alert("Aviso: No se pudo verificar con Supabase (Asegúrate de ejecutar el esquema SQL). Continuando en modo prueba.");
          navigate(`/${selectedRole}`);
        } else if (data && data.length > 0) {
          navigate(`/${selectedRole}`);
        } else {
          setErrorMsg("Credenciales inválidas para este rol.");
        }
      } else {
        // Sign UP strategy
        alert('En esta demo, el registro está deshabilitado por seguridad (simulación). Continuando en modo prueba...');
        navigate(`/${selectedRole}`);
      }
    } catch (err) {
      console.error(err);
      alert("Fallo de conexión. Continuando en modo local.");
      navigate(`/${selectedRole}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen truck-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl w-full">
        <div className="mb-12 bg-white/20 backdrop-blur-sm p-8 rounded-3xl border border-white/30">
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">Empresa Alexander Moya</h1>
          <p className="text-blue-100 mt-3 text-xl font-medium drop-shadow-md">Sistema de Ubicación de Flota de Camiones en Tiempo Real</p>
          <p className="text-blue-200 text-sm mt-2 font-bold uppercase tracking-widest">Caracas, Venezuela</p>
        </div>

        {/* Roles Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Admin Card */}
          <button 
            onClick={() => { setSelectedRole('admin'); setErrorMsg(''); }}
            className={`group bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-sm border transition-all flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-100 ${
              selectedRole === 'admin' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100 space-y-0 hover:shadow-xl hover:border-blue-300'
            }`}
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Administrador</h2>
            <p className="text-sm text-gray-500 line-clamp-3">Control total del sistema. Gestión de flota, usuarios y configuración global.</p>
          </button>

          {/* Gerente de Transporte */}
          <button 
            onClick={() => { setSelectedRole('gerente'); setErrorMsg(''); }}
            className={`group bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-sm border transition-all flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
              selectedRole === 'gerente' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-100 hover:shadow-xl hover:border-emerald-300'
            }`}
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Briefcase size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Gerente de Transporte</h2>
            <p className="text-sm text-gray-500 line-clamp-3">Monitoreo en tiempo real, alertas de detención, rutas y analíticas.</p>
          </button>

          {/* Conductor */}
          <button 
            onClick={() => { setSelectedRole('conductor'); setErrorMsg(''); }}
            className={`group bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-sm border transition-all flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-amber-100 ${
              selectedRole === 'conductor' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-100 hover:shadow-xl hover:border-amber-300'
            }`}
          >
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TruckIcon size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Conductor</h2>
            <p className="text-sm text-gray-500 line-clamp-3">Asignación de rutas, estado del vehículo y códigos de apertura de flete.</p>
          </button>
        </div>

        {/* Auth Form (Appears when a role is selected) */}
        {selectedRole && (
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/40 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Iniciar Sesión' : 'Registro'} como <span className="capitalize">{selectedRole}</span>
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Ingresa tus credenciales para acceder al portal.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-left mb-6 text-xs text-blue-800">
              <strong className="block mb-1">Credenciales de Demo:</strong>
              <ul className="list-disc pl-4 space-y-1">
                <li>Admin: admin@alexandermoya.com / admin123</li>
                <li>Gerente: gerente@alexandermoya.com / gerente123</li>
                <li>Conductor: conductor@alexandermoya.com / conductor123</li>
              </ul>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder={`ej. ${selectedRole}@alexandermoya.com`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Ingresar al Portal' : 'Completar Registro')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'} {' '}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
              >
                {isLogin ? 'Regístrate' : 'Inicia Sesión'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 right-6 text-sm font-medium text-gray-400">
        Creado por Miguel Peñaranda - Ingeniería de Software
      </div>
    </div>
  );
}
