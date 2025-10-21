-- Tabla para configuración dinámica de respuestas correctas del MMSE
CREATE TABLE IF NOT EXISTS public.mmse_prueba_cognitiva_configuracion (
    id_configuracion BIGSERIAL PRIMARY KEY,
    id_prueba BIGINT NOT NULL REFERENCES public.prueba_cognitiva(id_prueba) ON DELETE CASCADE,
    pregunta_id VARCHAR(50) NOT NULL,
    respuesta_correcta TEXT NOT NULL,
    contexto VARCHAR(100), -- ej: "hospital_general", "clinica_privada", "posta"
    tipo_validacion VARCHAR(20) NOT NULL DEFAULT 'exacta', -- 'exacta', 'parcial', 'fuzzy'
    tolerancia_errores INTEGER DEFAULT 0, -- 0-3 caracteres para fuzzy matching
    puntuacion DECIMAL(3,2) DEFAULT 1.00, -- 0.00 - 1.00
    es_activa BOOLEAN NOT NULL DEFAULT true,
    orden INTEGER DEFAULT 1,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_prueba_pregunta_contexto_respuesta UNIQUE (id_prueba, pregunta_id, contexto, respuesta_correcta),
    CONSTRAINT chk_tipo_validacion CHECK (tipo_validacion IN ('exacta', 'parcial', 'fuzzy')),
    CONSTRAINT chk_tolerancia CHECK (tolerancia_errores >= 0 AND tolerancia_errores <= 3),
    CONSTRAINT chk_puntuacion CHECK (puntuacion >= 0.00 AND puntuacion <= 1.00)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_mmse_config_prueba_pregunta 
    ON public.mmse_prueba_cognitiva_configuracion (id_prueba, pregunta_id);

CREATE INDEX IF NOT EXISTS idx_mmse_config_activa 
    ON public.mmse_prueba_cognitiva_configuracion (es_activa) WHERE es_activa = true;

CREATE INDEX IF NOT EXISTS idx_mmse_config_contexto 
    ON public.mmse_prueba_cognitiva_configuracion (contexto) WHERE contexto IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mmse_config_pregunta_contexto 
    ON public.mmse_prueba_cognitiva_configuracion (pregunta_id, contexto);

-- Comentarios para documentación
COMMENT ON TABLE public.mmse_prueba_cognitiva_configuracion IS 'Configuración dinámica de respuestas correctas para el test MMSE';
COMMENT ON COLUMN public.mmse_prueba_cognitiva_configuracion.pregunta_id IS 'ID de la pregunta (ej: establecimiento, pais, ciudad, piso)';
COMMENT ON COLUMN public.mmse_prueba_cognitiva_configuracion.respuesta_correcta IS 'Respuesta considerada correcta para esta pregunta';
COMMENT ON COLUMN public.mmse_prueba_cognitiva_configuracion.contexto IS 'Contexto específico donde aplica esta respuesta (ej: hospital, clinica, posta)';
COMMENT ON COLUMN public.mmse_prueba_cognitiva_configuracion.tipo_validacion IS 'Tipo de validación: exacta, parcial (contiene), o fuzzy (tolerancia a errores)';
COMMENT ON COLUMN public.mmse_prueba_cognitiva_configuracion.tolerancia_errores IS 'Número de caracteres de diferencia permitidos en validación fuzzy (0-3)';
COMMENT ON COLUMN public.mmse_prueba_cognitiva_configuracion.puntuacion IS 'Puntuación que otorga esta respuesta (0.00 - 1.00)';
COMMENT ON COLUMN public.mmse_prueba_cognitiva_configuracion.orden IS 'Orden de preferencia cuando hay múltiples respuestas correctas';

-- Datos iniciales para MMSE
DO $$
DECLARE
    mmse_id BIGINT;
BEGIN
    -- Obtener o crear la prueba MMSE
    SELECT id_prueba INTO mmse_id 
    FROM public.prueba_cognitiva 
    WHERE UPPER(codigo) = 'MMSE';
    
    IF mmse_id IS NULL THEN
        INSERT INTO public.prueba_cognitiva (codigo, nombre, puntaje_maximo, modo_aplicacion, activo)
        VALUES ('MMSE', 'Mini-Mental State Examination', 30, 'digital', true)
        RETURNING id_prueba INTO mmse_id;
    END IF;
    
    -- Insertar configuraciones de respuestas correctas para MMSE
    INSERT INTO public.mmse_prueba_cognitiva_configuracion 
    (id_prueba, pregunta_id, respuesta_correcta, contexto, tipo_validacion, tolerancia_errores, puntuacion, orden) VALUES
    
    -- Configuración para ESTABLECIMIENTO - Hospital General
    (mmse_id, 'establecimiento', 'Hospital General', 'hospital_general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'establecimiento', 'Hospital', 'hospital_general', 'exacta', 0, 1.00, 2),
    (mmse_id, 'establecimiento', 'Centro de Salud', 'hospital_general', 'exacta', 0, 0.80, 3),
    (mmse_id, 'establecimiento', 'Ospital', 'hospital_general', 'fuzzy', 1, 0.90, 4),
    
    -- Configuración para ESTABLECIMIENTO - Clínica Privada
    (mmse_id, 'establecimiento', 'Clínica Privada', 'clinica_privada', 'exacta', 0, 1.00, 1),
    (mmse_id, 'establecimiento', 'Clínica', 'clinica_privada', 'exacta', 0, 1.00, 2),
    (mmse_id, 'establecimiento', 'Clinica', 'clinica_privada', 'fuzzy', 1, 0.95, 3),
    (mmse_id, 'establecimiento', 'Centro Médico', 'clinica_privada', 'exacta', 0, 0.90, 4),
    (mmse_id, 'establecimiento', 'Klinica', 'clinica_privada', 'fuzzy', 1, 0.85, 5),
    
    -- Configuración para ESTABLECIMIENTO - Posta Médica
    (mmse_id, 'establecimiento', 'Posta', 'posta', 'exacta', 0, 1.00, 1),
    (mmse_id, 'establecimiento', 'Posta Médica', 'posta', 'exacta', 0, 1.00, 2),
    (mmse_id, 'establecimiento', 'Centro de Salud', 'posta', 'exacta', 0, 0.90, 3),
    (mmse_id, 'establecimiento', 'Puesto de Salud', 'posta', 'exacta', 0, 0.90, 4),
    (mmse_id, 'establecimiento', 'Posta Medica', 'posta', 'fuzzy', 1, 0.95, 5),
    
    -- Configuración para PISO/SALA - Hospital General
    (mmse_id, 'piso', 'Piso 1', 'hospital_general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'piso', 'Primer Piso', 'hospital_general', 'exacta', 0, 1.00, 2),
    (mmse_id, 'piso', 'Planta Baja', 'hospital_general', 'exacta', 0, 1.00, 3),
    (mmse_id, 'piso', 'Sala 101', 'hospital_general', 'exacta', 0, 1.00, 4),
    (mmse_id, 'piso', 'Consultorio 1', 'hospital_general', 'exacta', 0, 1.00, 5),
    (mmse_id, 'piso', 'Piso 2', 'hospital_general', 'exacta', 0, 1.00, 6),
    (mmse_id, 'piso', 'Segundo Piso', 'hospital_general', 'exacta', 0, 1.00, 7),
    
    -- Configuración para PISO/SALA - Clínica Privada
    (mmse_id, 'piso', 'Consultorio 1', 'clinica_privada', 'exacta', 0, 1.00, 1),
    (mmse_id, 'piso', 'Consultorio 2', 'clinica_privada', 'exacta', 0, 1.00, 2),
    (mmse_id, 'piso', 'Recepción', 'clinica_privada', 'exacta', 0, 1.00, 3),
    (mmse_id, 'piso', 'Sala de Espera', 'clinica_privada', 'exacta', 0, 1.00, 4),
    (mmse_id, 'piso', 'Planta Baja', 'clinica_privada', 'exacta', 0, 1.00, 5),
    
    -- Configuración para PISO/SALA - Posta
    (mmse_id, 'piso', 'Consultorio 1', 'posta', 'exacta', 0, 1.00, 1),
    (mmse_id, 'piso', 'Sala de Atención', 'posta', 'exacta', 0, 1.00, 2),
    (mmse_id, 'piso', 'Recepción', 'posta', 'exacta', 0, 1.00, 3),
    (mmse_id, 'piso', 'Planta Baja', 'posta', 'exacta', 0, 1.00, 4),
    
    -- Configuración para PAÍS (general)
    (mmse_id, 'pais', 'España', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'México', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'Argentina', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'Colombia', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'Chile', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'Perú', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'Venezuela', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'Ecuador', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'Bolivia', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'Uruguay', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'pais', 'Paraguay', 'general', 'exacta', 0, 1.00, 1),
    
    -- Configuración para PROVINCIA/ESTADO (ejemplos)
    (mmse_id, 'provincia', 'Madrid', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Barcelona', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Ciudad de México', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Buenos Aires', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Bogotá', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Santiago', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Lima', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Caracas', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Quito', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'La Paz', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Montevideo', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'provincia', 'Asunción', 'general', 'exacta', 0, 1.00, 1),
    
    -- Configuración para CIUDAD (ejemplos)
    (mmse_id, 'ciudad', 'Madrid', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'Barcelona', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'México DF', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'Buenos Aires', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'Bogotá', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'Santiago', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'Lima', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'Caracas', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'Quito', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'La Paz', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'Montevideo', 'general', 'exacta', 0, 1.00, 1),
    (mmse_id, 'ciudad', 'Asunción', 'general', 'exacta', 0, 1.00, 1);
    
END $$;
