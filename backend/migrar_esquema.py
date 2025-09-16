#!/usr/bin/env python3
"""
Script para crear las nuevas tablas del sistema de evaluaciones cognitivas
Ejecuta el esquema SQL propuesto
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de base de datos
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'tesis_deterioro_cognitivo'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password')
}

# SQL para crear las tablas según tu esquema
SCHEMA_SQL = """
-- PACIENTE (mínimo, compatible con tu esquema de rol/usuario con IDs enteros)
CREATE TABLE IF NOT EXISTS public.paciente (
  id_paciente BIGSERIAL PRIMARY KEY,
  nombres VARCHAR(120) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  sexo CHAR(1) CHECK (sexo IN ('M','F')),
  anos_escolaridad SMALLINT
);

-- CÓDIGOS DE ACCESO (código → paciente y tipo de evaluación)
CREATE TABLE IF NOT EXISTS public.codigo_acceso (
  id_codigo BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(32) NOT NULL UNIQUE,
  id_paciente BIGINT NOT NULL REFERENCES public.paciente(id_paciente) ON UPDATE CASCADE ON DELETE RESTRICT,
  tipo_evaluacion VARCHAR(20) NOT NULL CHECK (tipo_evaluacion IN ('CDT','MMSE','MOCA','ACE')),
  vence_at TIMESTAMPTZ NOT NULL,
  estado VARCHAR(12) NOT NULL DEFAULT 'emitido' CHECK (estado IN ('emitido','usado','vencido','revocado')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultimo_uso_en TIMESTAMPTZ,
  UNIQUE (id_codigo, id_paciente)
);

-- EVALUACIONES COGNITIVAS (incluye campos mínimos para CDT por foto)
CREATE TABLE IF NOT EXISTS public.evaluaciones_cognitivas (
  id_evaluacion BIGSERIAL PRIMARY KEY,
  id_paciente BIGINT NOT NULL REFERENCES public.paciente(id_paciente) ON UPDATE CASCADE ON DELETE RESTRICT,
  id_codigo BIGINT REFERENCES public.codigo_acceso(id_codigo) ON UPDATE CASCADE ON DELETE SET NULL,

  tipo_evaluacion VARCHAR(20) NOT NULL CHECK (tipo_evaluacion IN ('CDT','MMSE','MOCA','ACE')),
  fecha_evaluacion TIMESTAMPTZ DEFAULT now(),

  puntuacion_total NUMERIC(5,2) NOT NULL,
  puntuacion_maxima NUMERIC(5,2) NOT NULL,
  porcentaje_acierto NUMERIC(5,2)
    GENERATED ALWAYS AS ((puntuacion_total / puntuacion_maxima) * 100) STORED,
  CONSTRAINT ck_eval_scores CHECK (puntuacion_total >= 0 AND puntuacion_maxima > 0 AND puntuacion_total <= puntuacion_maxima),

  clasificacion VARCHAR(50),
  confianza NUMERIC(5,2),

  estado_procesamiento VARCHAR(12) NOT NULL DEFAULT 'pendiente'
    CHECK (estado_procesamiento IN ('pendiente','procesando','completada','fallida')),
  tiempo_procesamiento NUMERIC(8,3),
  version_algoritmo VARCHAR(20),
  observaciones TEXT,

  -- específicos para CDT capturado por foto
  imagen_url TEXT,
  metodo_cdt TEXT,

  datos_especificos JSONB,
  archivos_paths JSONB,

  creado_por INTEGER, -- REFERENCES public.usuario(id_usuario) ON UPDATE CASCADE ON DELETE SET NULL,
  actualizado_en TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT ck_eval_cdt_campos CHECK (
    (tipo_evaluacion <> 'CDT') OR (imagen_url IS NOT NULL AND metodo_cdt IS NOT NULL)
  ),
  CONSTRAINT fk_eval_codigo_paciente_coincide
    FOREIGN KEY (id_codigo, id_paciente)
    REFERENCES public.codigo_acceso (id_codigo, id_paciente)
    ON UPDATE CASCADE ON DELETE SET NULL
);

-- CRITERIOS / SUBPRUEBAS DE CADA EVALUACIÓN
CREATE TABLE IF NOT EXISTS public.criterios_evaluacion (
  id_criterio BIGSERIAL PRIMARY KEY,
  id_evaluacion BIGINT NOT NULL REFERENCES public.evaluaciones_cognitivas(id_evaluacion) ON DELETE CASCADE,
  dominio_cognitivo VARCHAR(50) NOT NULL,
  subcriterio VARCHAR(100) NOT NULL,
  puntuacion_obtenida NUMERIC(4,2) NOT NULL,
  puntuacion_maxima NUMERIC(4,2) NOT NULL,
  respuesta_paciente TEXT,
  tiempo_respuesta NUMERIC(6,2),
  observaciones_criterio TEXT,
  datos_vision JSONB,
  orden_aplicacion INTEGER,
  CONSTRAINT ck_criterio_scores CHECK (
    puntuacion_obtenida >= 0 AND puntuacion_maxima > 0 AND puntuacion_obtenida <= puntuacion_maxima
  )
);

-- ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_evaluaciones_paciente_tipo 
ON public.evaluaciones_cognitivas(id_paciente, tipo_evaluacion, fecha_evaluacion);

CREATE INDEX IF NOT EXISTS idx_evaluaciones_estado 
ON public.evaluaciones_cognitivas(estado_procesamiento, tipo_evaluacion);

CREATE INDEX IF NOT EXISTS idx_codigo_acceso_codigo 
ON public.codigo_acceso(codigo, estado);

CREATE INDEX IF NOT EXISTS idx_criterios_evaluacion 
ON public.criterios_evaluacion(id_evaluacion, orden_aplicacion);

-- ÍNDICE GIN PARA BÚSQUEDAS EN JSON
CREATE INDEX IF NOT EXISTS idx_evaluaciones_datos_gin 
ON public.evaluaciones_cognitivas USING GIN (datos_especificos);

-- COMENTARIOS EN TABLAS
COMMENT ON TABLE public.paciente IS 'Información básica de pacientes para evaluaciones cognitivas';
COMMENT ON TABLE public.codigo_acceso IS 'Códigos temporales para acceso a evaluaciones específicas';
COMMENT ON TABLE public.evaluaciones_cognitivas IS 'Evaluaciones cognitivas (CDT, MMSE, MOCA, ACE) con resultados';
COMMENT ON TABLE public.criterios_evaluacion IS 'Criterios específicos y subpruebas de cada evaluación';

-- VISTA PARA RESUMEN DE EVALUACIONES
CREATE OR REPLACE VIEW public.resumen_evaluaciones AS
SELECT 
    e.id_evaluacion,
    e.id_paciente,
    CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
    p.sexo,
    EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) as edad,
    e.tipo_evaluacion,
    e.fecha_evaluacion,
    e.puntuacion_total,
    e.puntuacion_maxima,
    e.porcentaje_acierto,
    e.clasificacion,
    e.estado_procesamiento,
    e.tiempo_procesamiento,
    
    -- Última evaluación por tipo
    ROW_NUMBER() OVER (
        PARTITION BY e.id_paciente, e.tipo_evaluacion 
        ORDER BY e.fecha_evaluacion DESC
    ) as es_ultima,
    
    -- Comparación con evaluación anterior
    LAG(e.puntuacion_total) OVER (
        PARTITION BY e.id_paciente, e.tipo_evaluacion 
        ORDER BY e.fecha_evaluacion
    ) as puntuacion_anterior,
    
    -- Tendencia
    CASE 
        WHEN LAG(e.puntuacion_total) OVER (
            PARTITION BY e.id_paciente, e.tipo_evaluacion 
            ORDER BY e.fecha_evaluacion
        ) IS NULL THEN 'Primera'
        WHEN e.puntuacion_total > LAG(e.puntuacion_total) OVER (
            PARTITION BY e.id_paciente, e.tipo_evaluacion 
            ORDER BY e.fecha_evaluacion
        ) THEN 'Mejora'
        WHEN e.puntuacion_total < LAG(e.puntuacion_total) OVER (
            PARTITION BY e.id_paciente, e.tipo_evaluacion 
            ORDER BY e.fecha_evaluacion
        ) THEN 'Declive'
        ELSE 'Estable'
    END as tendencia

FROM public.evaluaciones_cognitivas e
JOIN public.paciente p ON e.id_paciente = p.id_paciente
WHERE e.estado_procesamiento = 'completada';

COMMENT ON VIEW public.resumen_evaluaciones IS 'Vista consolidada con análisis de tendencias por paciente';
"""

# SQL para datos de prueba
SAMPLE_DATA_SQL = """
-- DATOS DE PRUEBA
INSERT INTO public.paciente (nombres, apellidos, fecha_nacimiento, sexo, anos_escolaridad) VALUES
('Juan Carlos', 'González Martínez', '1950-03-15', 'M', 8),
('María Elena', 'Rodríguez López', '1955-07-22', 'F', 12),
('Pedro', 'Sánchez García', '1948-11-08', 'M', 6),
('Ana', 'Torres Fernández', '1952-01-30', 'F', 16)
ON CONFLICT DO NOTHING;

-- Generar algunos códigos de acceso de prueba
INSERT INTO public.codigo_acceso (codigo, id_paciente, tipo_evaluacion, vence_at) 
SELECT 
    'CDT-TEST-' || LPAD(p.id_paciente::text, 4, '0'),
    p.id_paciente,
    'CDT',
    now() + INTERVAL '30 days'
FROM public.paciente p
ON CONFLICT (codigo) DO NOTHING;
"""


def conectar_bd():
    """Conectar a la base de datos PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except psycopg2.Error as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        sys.exit(1)


def ejecutar_sql(conn, sql, descripcion):
    """Ejecutar SQL y manejar errores"""
    try:
        cursor = conn.cursor()
        cursor.execute(sql)
        print(f"✅ {descripcion}")
        return True
    except psycopg2.Error as e:
        print(f"❌ Error en {descripcion}: {e}")
        return False
    finally:
        cursor.close()


def verificar_tablas(conn):
    """Verificar que las tablas se crearon correctamente"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('paciente', 'codigo_acceso', 'evaluaciones_cognitivas', 'criterios_evaluacion')
        ORDER BY table_name;
    """)
    
    tablas = cursor.fetchall()
    print(f"\n📊 Tablas encontradas: {len(tablas)}")
    for tabla in tablas:
        print(f"   - {tabla[0]}")
    
    cursor.close()
    return len(tablas) == 4


def main():
    print("🚀 MIGRACIÓN DE BASE DE DATOS - SISTEMA EVALUACIONES COGNITIVAS")
    print("=" * 60)
    
    # Conectar a la base de datos
    print("🔌 Conectando a la base de datos...")
    conn = conectar_bd()
    print(f"✅ Conectado a: {DB_CONFIG['database']}@{DB_CONFIG['host']}")
    
    # Ejecutar creación de esquema
    print("\n📋 Creando esquema de tablas...")
    if not ejecutar_sql(conn, SCHEMA_SQL, "Creación de tablas y estructuras"):
        print("❌ Falló la creación del esquema")
        sys.exit(1)
    
    # Verificar tablas
    if verificar_tablas(conn):
        print("✅ Todas las tablas se crearon correctamente")
    else:
        print("⚠️  Algunas tablas no se crearon")
    
    # Insertar datos de prueba
    print("\n🧪 Insertando datos de prueba...")
    ejecutar_sql(conn, SAMPLE_DATA_SQL, "Inserción de datos de prueba")
    
    # Verificar datos
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM public.paciente;")
    pacientes_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM public.codigo_acceso;")
    codigos_count = cursor.fetchone()[0]
    
    print(f"📊 Datos insertados:")
    print(f"   - Pacientes: {pacientes_count}")
    print(f"   - Códigos de acceso: {codigos_count}")
    
    cursor.close()
    conn.close()
    
    print("\n🎉 ¡Migración completada exitosamente!")
    print("\n📝 Próximos pasos:")
    print("   1. Ejecutar: python test_nuevo_esquema.py")
    print("   2. Probar API: python run.py")
    print("   3. Verificar endpoints CDT v2")


if __name__ == "__main__":
    main()
