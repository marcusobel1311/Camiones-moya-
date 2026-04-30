export type Truck = {
  id: string;
  plate: string;
  status: 'active' | 'stopped' | 'maintenance';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  driver: {
    name: string;
    age: number;
    license: string;
    id?: string;
  };
  companion?: {
    name: string;
    age: number;
  };
  stopDurationMinutes: number; // For >30 min alerts
  fuel: {
    amountLiters: number;
    type: string;
    capacityLiters: number;
  };
  vehicle: {
    color: string;
    brand: string;
    model: string;
    year: number;
    details: string;
  };
  history: {
    weekly: number;
    biweekly: number;
    monthly: number;
    total: number;
  };
  maintenance: {
    date: string;
    service: string;
    cost?: number;
  }[];
  routes: {
    id: string;
    name: string;
    status: 'completed' | 'in-progress' | 'pending';
  }[];
};

export const MOCK_TRUCKS: Truck[] = [
  {
    id: 't-001',
    plate: 'AM-1042',
    status: 'stopped',
    location: {
      lat: 10.4806,
      lng: -66.9036,
      address: 'Autopista Valle - Coche',
    },
    driver: {
      name: 'Carlos Mendoza',
      age: 45,
      license: 'C3-987654321',
    },
    companion: {
      name: 'Luis Suarez',
      age: 28,
    },
    stopDurationMinutes: 10,
    fuel: {
      amountLiters: 120,
      capacityLiters: 300,
      type: 'Diesel Extra',
    },
    vehicle: {
      color: 'Blanco',
      brand: 'Volvo',
      model: 'FH16',
      year: 2021,
      details: 'Remolque refrigerado, Thermo King',
    },
    history: {
      weekly: 4,
      biweekly: 9,
      monthly: 18,
      total: 145,
    },
    maintenance: [
      { date: '2023-10-15', service: 'Cambio de aceite y filtros' },
      { date: '2023-11-05', service: 'Revisión de frenos de aire' },
    ],
    routes: [
      { id: 'r-1', name: 'Caracas - Valencia', status: 'in-progress' },
      { id: 'r-2', name: 'Valencia - Barquisimeto', status: 'pending' },
    ],
  },
  {
    id: 't-002',
    plate: 'AM-2055',
    status: 'stopped',
    location: {
      lat: 10.5990,
      lng: -66.9304,
      address: 'Puerto de La Guaira',
    },
    driver: {
      name: 'Fernando Restrepo',
      age: 52,
      license: 'C3-112233445',
    },
    stopDurationMinutes: 45, // Will trigger alert
    fuel: {
      amountLiters: 45,
      capacityLiters: 250,
      type: 'Diesel Corriente',
    },
    vehicle: {
      color: 'Rojo',
      brand: 'Kenworth',
      model: 'T800',
      year: 2018,
      details: 'Carrocería estacas, carpa negra',
    },
    history: {
      weekly: 2,
      biweekly: 5,
      monthly: 12,
      total: 310,
    },
    maintenance: [
      { date: '2023-09-10', service: 'Suspensión general' },
    ],
    routes: [
      { id: 'r-3', name: 'Caracas - La Guaira', status: 'completed' },
    ],
  },
  {
    id: 't-003',
    plate: 'AM-3099',
    status: 'maintenance',
    location: {
      lat: 10.3444,
      lng: -67.0431,
      address: 'Taller Principal Los Teques',
    },
    driver: {
      name: 'Javier Orozco',
      age: 38,
      license: 'C3-556677889',
    },
    companion: {
      name: 'Manuel Pineda',
      age: 22,
    },
    stopDurationMinutes: 1440,
    fuel: {
      amountLiters: 10,
      capacityLiters: 300,
      type: 'Diesel Extra',
    },
    vehicle: {
      color: 'Azul',
      brand: 'Freightliner',
      model: 'Cascadia',
      year: 2022,
      details: 'Cabina extendida, cisterna',
    },
    history: {
      weekly: 0,
      biweekly: 3,
      monthly: 15,
      total: 88,
    },
    maintenance: [
      { date: '2023-11-10', service: 'Reparación de inyectores (En progreso)' },
    ],
    routes: [],
  },
];
