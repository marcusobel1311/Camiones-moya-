-- ==============================================================================
-- SISTEMA FLOTA DE CAMIONES: ALEXANDER MOYA
-- SCRIPT DE BASE DE DATOS SUPABASE
-- ==============================================================================

-- 1. Habilitar extensión pgcrypto para encriptación "sencilla"
-- Permite usar las funciones 'crypt' y 'gen_salt' para encriptar contraseñas.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- TABLAS
-- ==========================================

-- Tabla de Usuarios (Administradores, Gerentes, Conductores)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'gerente', 'conductor')),
  nombre VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Conductores (Detalles adicionales vinculados al usuario)
CREATE TABLE conductores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  edad INTEGER NOT NULL,
  licencia VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de Camiones
CREATE TABLE camiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa VARCHAR(20) UNIQUE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'stopped' CHECK (estado IN ('active', 'stopped', 'maintenance')),
  latitud DOUBLE PRECISION NOT NULL,
  longitud DOUBLE PRECISION NOT NULL,
  direccion VARCHAR(255),
  conductor_id UUID REFERENCES conductores(id) ON DELETE SET NULL,
  combustible_litros DOUBLE PRECISION NOT NULL,
  combustible_capacidad DOUBLE PRECISION NOT NULL,
  combustible_tipo VARCHAR(50) NOT NULL,
  color VARCHAR(50),
  marca VARCHAR(50),
  modelo VARCHAR(50),
  anio INTEGER,
  detalles TEXT
);

-- Tabla de Rutas/Viajes (Relacionada con Camiones)
CREATE TABLE viajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  origen_nombre VARCHAR(255),
  destino_nombre VARCHAR(255),
  start_lat DOUBLE PRECISION NOT NULL,
  start_lng DOUBLE PRECISION NOT NULL,
  end_lat DOUBLE PRECISION NOT NULL,
  end_lng DOUBLE PRECISION NOT NULL,
  tipo_camion_requerido VARCHAR(50) DEFAULT 'Cualquiera',
  estado VARCHAR(50) DEFAULT 'pending' CHECK (estado IN ('pending', 'in-progress', 'completed')),
  camion_asignado_id UUID REFERENCES camiones(id) ON DELETE SET NULL,
  inicio_ms BIGINT,
  duracion_ms BIGINT
);

-- ==========================================
-- FUNCIONES RPC (Para llamar desde el Frontend)
-- ==========================================

-- Función para verificar login usando la encriptación pgcrypto
-- Esto compara la contraseña ingresada con el hash encriptado de la BD.
CREATE OR REPLACE FUNCTION verificar_login(p_email VARCHAR, p_password VARCHAR, p_role VARCHAR)
RETURNS TABLE(id UUID, email VARCHAR, role VARCHAR, nombre VARCHAR)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.role, u.nombre
  FROM usuarios u
  WHERE u.email = p_email 
    AND u.role = p_role 
    -- crypt(password_entrante, hash_almacenado) debe ser igual al hash_almacenado
    AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$;


-- ==========================================
-- DATOS DE PRUEBA (MOCK DATA)
-- ==========================================

-- Insertar un Administrador (Pass: admin123)
INSERT INTO usuarios (email, password_hash, role, nombre)
VALUES ('admin@alexandermoya.com', crypt('admin123', gen_salt('bf')), 'admin', 'Admin Principal');

-- Insertar un Gerente (Pass: gerente123)
INSERT INTO usuarios (email, password_hash, role, nombre)
VALUES ('gerente@alexandermoya.com', crypt('gerente123', gen_salt('bf')), 'gerente', 'Gerente de Transporte');

-- Insertar un Conductor (Pass: conductor123)
INSERT INTO usuarios (id, email, password_hash, role, nombre)
VALUES ('11111111-1111-1111-1111-111111111111', 'conductor@alexandermoya.com', crypt('conductor123', gen_salt('bf')), 'conductor', 'Carlos Mendoza');

-- Crear el perfil de conductor vinculado al usuario anterior
INSERT INTO conductores (id, usuario_id, nombre, edad, licencia)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Carlos Mendoza', 45, 'C3-987654321');

-- Insertar un camión y asignarle el conductor
INSERT INTO camiones (placa, estado, latitud, longitud, direccion, conductor_id, combustible_litros, combustible_capacidad, combustible_tipo, color, marca, modelo, anio, detalles)
VALUES ('AM-1042', 'stopped', 10.4806, -66.9036, 'Autopista Valle - Coche', '22222222-2222-2222-2222-222222222222', 120, 300, 'Diesel Extra', 'Blanco', 'Volvo', 'FH16', 2021, 'Remolque refrigerado');
