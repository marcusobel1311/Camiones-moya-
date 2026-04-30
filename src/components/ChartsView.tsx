import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';

export default function ChartsView() {
  const { trucks } = useAppContext();
  // Data for Status Pie Chart
  const statusData = [
    { name: 'Activos', value: trucks.filter(t => t.status === 'active').length, color: '#10b981' },
    { name: 'Detenidos', value: trucks.filter(t => t.status === 'stopped').length, color: '#f59e0b' },
    { name: 'En Taller', value: trucks.filter(t => t.status === 'maintenance').length, color: '#ef4444' },
  ];

  // Data for Trips (Carreras)
  const tripsData = trucks.map(t => ({
    name: t.plate,
    Mensual: t.history.monthly,
    Quincenal: t.history.biweekly,
    Semanal: t.history.weekly,
  }));

  return (
    <div className="p-8 h-full overflow-y-auto bg-white/40 backdrop-blur-md flex flex-col gap-8">
      
      <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-white/50 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          Estado Actual de la Flota
        </h2>
        <div className="h-64 flex justify-between items-center px-10">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-1/3 space-y-4">
             {statusData.map((d, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-sm font-medium text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-lg">{d.value}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-white/50 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Comparativa de Carreras (Viajes)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tripsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Mensual" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Quincenal" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Semanal" fill="#EC4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
