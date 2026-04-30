import Dashboard from './Dashboard';

export default function AdminView() {
  // En un sistema real aquí se verificarían permisos de administrador
  return <Dashboard role="admin" />;
}
