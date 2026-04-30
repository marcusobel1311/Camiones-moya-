import React, { createContext, useContext, useState, useEffect } from 'react';
import { Truck, MOCK_TRUCKS } from '../data/mockData';
import { supabase } from '../lib/supabase';

export type Trip = {
  id: string;
  name: string;
  startName: string;
  endName: string;
  startCoords: [number, number];
  endCoords: [number, number];
  requiredTruckType: string;
  status: 'pending' | 'in-progress' | 'completed';
  startTimeMs?: number;
  durationMs?: number;
  assignedTruckId?: string;
  routePath?: [number, number][];
  distanceKm?: number;
  initialFuel?: number;
};

export type DriverInfo = {
  id: string;
  name: string;
  age: number;
  license: string;
};

interface AppContextType {
  dbStatus: 'connecting' | 'connected' | 'error';
  trucks: Truck[];
  setTrucks: React.Dispatch<React.SetStateAction<Truck[]>>;
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  drivers: DriverInfo[];
  setDrivers: React.Dispatch<React.SetStateAction<DriverInfo[]>>;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTripTruckType: (tripId: string, truckType: string) => void;
  assignAndStartTrip: (tripId: string, truckId: string) => void;
  addDriver: (driver: Omit<DriverInfo, 'id'>) => void;
  removeDriver: (id: string) => void;
  addTruck: (truckData: any) => void;
  removeTruck: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Intentar cargar datos desde Supabase al iniciar
  useEffect(() => {
    const fetchData = async () => {
      setDbStatus('connecting');
      try {
        const { data: dbConductores, error: errorD } = await supabase.from('conductores').select('*');
        if (errorD) throw errorD;
        const mappedDrivers = (dbConductores || []).map(d => ({
          id: d.id,
          name: d.nombre,
          age: d.edad,
          license: d.licencia
        }));
        setDrivers(mappedDrivers);

        const { data: dbViajes, error: errorV } = await supabase.from('viajes').select('*');
        if (errorV) throw errorV;
        const mappedTrips: Trip[] = (dbViajes || []).map(v => ({
          id: v.id,
          name: v.nombre,
          startName: v.origen_nombre || 'Origen',
          endName: v.destino_nombre || 'Destino',
          startCoords: [v.start_lat, v.start_lng],
          endCoords: [v.end_lat, v.end_lng],
          requiredTruckType: v.tipo_camion_requerido || 'Cualquiera',
          status: v.estado as any,
          assignedTruckId: v.camion_asignado_id || undefined,
          startTimeMs: v.inicio_ms ? Number(v.inicio_ms) : undefined,
          durationMs: v.duracion_ms ? Number(v.duracion_ms) : undefined
        }));
        setTrips(mappedTrips);

        const { data: dbCamiones, error: errorC } = await supabase.from('camiones').select('*, conductores(*)');
        if (errorC) throw errorC;
        const mappedTrucks: Truck[] = (dbCamiones || []).map((c: any) => {
          const tRoutes = mappedTrips.filter(t => t.assignedTruckId === c.id).map(t => ({
            id: t.id,
            name: t.name,
            status: t.status
          }));
          return {
            id: c.id,
            plate: c.placa,
            status: c.estado,
            location: {
              lat: c.latitud,
              lng: c.longitud,
              address: c.direccion || 'Ubicación Desconocida'
            },
            driver: c.conductores ? {
              name: c.conductores.nombre,
              age: c.conductores.edad,
              license: c.conductores.licencia
            } : { name: 'Sin Asignar', age: 0, license: 'N/A' },
            stopDurationMinutes: c.estado === 'stopped' ? 45 : 0,
            fuel: {
              amountLiters: c.combustible_litros,
              capacityLiters: c.combustible_capacidad,
              type: c.combustible_tipo
            },
            vehicle: {
              color: c.color,
              brand: c.marca,
              model: c.modelo,
              year: c.anio,
              details: c.detalles || ''
            },
            history: { weekly: 0, biweekly: 0, monthly: 0, total: 0 },
            maintenance: [],
            routes: tRoutes
          };
        });
        setTrucks(mappedTrucks);
        setDbStatus('connected');
      } catch (err) {
        console.error("No se pudo conectar a Supabase o no existen las tablas", err);
        setDbStatus('error');
      }
    };

    fetchData();
  }, []);

  // Simulate movement
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setTrucks(prevTrucks => {
        return prevTrucks.map(truck => {
          // Find the active trip for this truck
          const activeTrip = trips.find(t => t.assignedTruckId === truck.id && t.status === 'in-progress');
          if (activeTrip && activeTrip.startTimeMs && activeTrip.durationMs) {
            // Aceleramos la simulación 120 veces (1 hora de viaje en la vida real se completará en 30 segundos en la pantalla)
            const SIMULATION_SPEED = 120;
            const elapsed = (now - activeTrip.startTimeMs) * SIMULATION_SPEED;
            let progress = elapsed / activeTrip.durationMs;

            if (progress >= 1) {
              progress = 1;
              // Mark trip completed and free the truck
              setTimeout(() => {
                setTrips(curr => curr.map(t => t.id === activeTrip.id ? { ...t, status: 'completed' } : t));
                setTrucks(curr => curr.map(tk => tk.id === truck.id ? { ...tk, status: 'stopped' } : tk));

                // Update Supabase silently
                supabase.from('viajes').update({ estado: 'completed' }).eq('id', activeTrip.id).then();
                supabase.from('camiones').update({ estado: 'stopped' }).eq('id', truck.id).then();
              }, 0);
            }

            let lat = truck.location.lat;
            let lng = truck.location.lng;

            if (activeTrip.routePath && activeTrip.routePath.length > 0) {
              // Interpolate along route array
              const path = activeTrip.routePath;
              const index = progress * (path.length - 1);
              const lower = Math.floor(index);
              const upper = Math.ceil(index);
              const fraction = index - lower;
              lat = path[lower][0] + (path[upper][0] - path[lower][0]) * fraction;
              lng = path[lower][1] + (path[upper][1] - path[lower][1]) * fraction;
            } else {
              // Linear interpolation
              lat = activeTrip.startCoords[0] + (activeTrip.endCoords[0] - activeTrip.startCoords[0]) * progress;
              lng = activeTrip.startCoords[1] + (activeTrip.endCoords[1] - activeTrip.startCoords[1]) * progress;
            }

            // Consumo: 35 litros por 100km aprox.
            let currentFuel = truck.fuel.amountLiters;
            if (activeTrip.distanceKm && activeTrip.initialFuel !== undefined) {
              const totalFuelNeeded = (activeTrip.distanceKm / 100) * 35;
              currentFuel = Math.max(0, activeTrip.initialFuel - (totalFuelNeeded * progress));
            }

            return {
              ...truck,
              location: { ...truck.location, lat, lng },
              fuel: { ...truck.fuel, amountLiters: currentFuel }
            };
          }
          return truck;
        });
      });
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, [trips]);

  const addTrip = async (trip: Omit<Trip, 'id'>) => {
    try {
      const { data, error } = await supabase.from('viajes').insert([{
        nombre: trip.name,
        origen_nombre: trip.startName,
        destino_nombre: trip.endName,
        start_lat: trip.startCoords[0],
        start_lng: trip.startCoords[1],
        end_lat: trip.endCoords[0],
        end_lng: trip.endCoords[1],
        tipo_camion_requerido: trip.requiredTruckType,
        estado: trip.status
      }]).select();

      if (error) {
        console.error("Error al insertar viaje:", error);
        return;
      }

      if (data && data[0]) {
        const newTrip = { ...trip, id: data[0].id };
        setTrips(prev => [...prev, newTrip]);
      }
    } catch (err) {
      console.error("Excepción al insertar viaje:", err);
    }
  };

  const updateTripTruckType = async (tripId: string, truckType: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, requiredTruckType: truckType } : t));
  };

  const assignAndStartTrip = async (tripId: string, truckId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const truck = trucks.find(t => t.id === truckId);

    let routePath: [number, number][] | undefined;
    let distanceKm = Math.sqrt(Math.pow(trip.endCoords[0] - trip.startCoords[0], 2) + Math.pow(trip.endCoords[1] - trip.startCoords[1], 2)) * 111;

    try {
      // Usamos OSRM para trazar ruta por calle (Llng, Lat por API)
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${trip.startCoords[1]},${trip.startCoords[0]};${trip.endCoords[1]},${trip.endCoords[0]}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        // OSRM retorna [lng, lat], Leaflet usa [lat, lng]
        routePath = data.routes[0].geometry.coordinates.map((c: any[]) => [c[1], c[0]]);
        distanceKm = data.routes[0].distance / 1000;
      }
    } catch (e) {
      console.warn("Fallo ruta OSRM, usando línea recta", e);
    }

    const durationHours = distanceKm / 60; // 60 km/h avg
    const durationMs = durationHours * 60 * 60 * 1000;
    const now = Date.now();
    const initialFuel = truck?.fuel.amountLiters || 0;

    setTrips(prev => prev.map(t => t.id === tripId ? {
      ...t,
      status: 'in-progress',
      assignedTruckId: truckId,
      startTimeMs: now,
      durationMs: durationMs,
      distanceKm: distanceKm,
      routePath: routePath,
      initialFuel: initialFuel
    } : t));

    setTrucks(prev => prev.map(tk => tk.id === truckId ? { ...tk, status: 'active' } : tk));

    try {
      await supabase.from('viajes').update({
        camion_asignado_id: truckId,
        estado: 'in-progress',
        inicio_ms: now,
        duracion_ms: durationMs
      }).eq('id', tripId);

      await supabase.from('camiones').update({ estado: 'active' }).eq('id', truckId);
    } catch (err) { /* ignore */ }
  };

  const addDriver = async (driver: Omit<DriverInfo, 'id'>) => {
    try {
      const { data, error } = await supabase.from('conductores').insert([{
        nombre: driver.name,
        edad: driver.age,
        licencia: driver.license
      }]).select();

      if (error) {
        alert("Error al insertar conductor: " + error.message);
        console.error("Error al insertar conductor:", error);
        return;
      }

      if (data && data[0]) {
        setDrivers(prev => [...prev, {
          id: data[0].id,
          name: data[0].nombre,
          age: data[0].edad,
          license: data[0].licencia
        }]);
      }
    } catch (err: any) {
      alert("Excepción al insertar conductor: " + err.message);
      console.error("Excepción al insertar conductor:", err);
    }
  };

  const removeDriver = async (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
    try {
      await supabase.from('conductores').delete().eq('id', id);
    } catch (err) { /* ignore */ }
  };

  const addTruck = async (truckData: any) => {
    let assignedDriver = { name: 'Sin Asignar', age: 0, license: 'N/A' };
    let conductorId = null;

    if (truckData.driverId) {
      const foundDriver = drivers.find(d => d.id === truckData.driverId);
      if (foundDriver) {
        assignedDriver = { name: foundDriver.name, age: foundDriver.age, license: foundDriver.license };
        conductorId = foundDriver.id;
      }
    }

    try {
      const { data, error } = await supabase.from('camiones').insert([{
        placa: truckData.plate,
        estado: 'stopped',
        latitud: 10.4806,
        longitud: -66.9036,
        direccion: 'Base Principal',
        combustible_litros: truckData.fuelCapacity,
        combustible_capacidad: truckData.fuelCapacity,
        combustible_tipo: truckData.fuelType,
        color: truckData.color,
        marca: truckData.brand,
        modelo: truckData.model,
        anio: truckData.year,
        detalles: truckData.details,
        conductor_id: conductorId
      }]).select();

      if (error) {
        alert("Error al insertar camión: " + error.message);
        console.error("Error al insertar camión:", error);
        return;
      }

      if (data && data[0]) {
        const newTruck: Truck = {
          id: data[0].id,
          plate: truckData.plate,
          status: 'stopped',
          location: { lat: 10.4806, lng: -66.9036, address: 'Base Principal' },
          driver: assignedDriver,
          stopDurationMinutes: 0,
          fuel: { amountLiters: truckData.fuelCapacity, capacityLiters: truckData.fuelCapacity, type: truckData.fuelType },
          vehicle: {
            color: truckData.color, brand: truckData.brand, model: truckData.model,
            year: truckData.year, details: truckData.details
          },
          history: { weekly: 0, biweekly: 0, monthly: 0, total: 0 },
          maintenance: [],
          routes: []
        };
        setTrucks(prev => [...prev, newTruck]);
      }
    } catch (err: any) {
      alert("Excepción al insertar camión: " + err.message);
      console.error("Excepción al insertar camión:", err);
    }
  };

  const removeTruck = async (id: string) => {
    setTrucks(prev => prev.filter(t => t.id !== id));
    try {
      await supabase.from('camiones').delete().eq('id', id);
    } catch (err) { /* ignore */ }
  };

  return (
    <AppContext.Provider value={{ dbStatus, trucks, setTrucks, trips, setTrips, drivers, setDrivers, addTrip, updateTripTruckType, assignAndStartTrip, addDriver, removeDriver, addTruck, removeTruck }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
