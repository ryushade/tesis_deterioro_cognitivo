-- Script para actualizar las claves foráneas a DELETE CASCADE
-- Esto permitirá eliminar pacientes junto con sus registros dependientes

-- 1. Eliminar la restricción actual de codigo_acceso
ALTER TABLE public.codigo_acceso 
DROP CONSTRAINT IF EXISTS codigo_acceso_id_paciente_fkey;

-- 2. Agregar la nueva restricción con DELETE CASCADE
ALTER TABLE public.codigo_acceso 
ADD CONSTRAINT codigo_acceso_id_paciente_fkey 
FOREIGN KEY (id_paciente) 
REFERENCES public.paciente (id_paciente) 
MATCH SIMPLE
ON UPDATE CASCADE
ON DELETE CASCADE;

-- 3. También verificar si existe la tabla evaluaciones_cognitivas y actualizar si es necesario
-- Verificar si existe la tabla primero
DO $$
BEGIN
    -- Si existe la tabla evaluaciones_cognitivas, actualizar su restricción también
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'evaluaciones_cognitivas') THEN
        -- Eliminar restricción existente si existe
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name LIKE '%evaluaciones_cognitivas%paciente%' 
                  AND table_name = 'evaluaciones_cognitivas') THEN
            EXECUTE 'ALTER TABLE public.evaluaciones_cognitivas DROP CONSTRAINT ' || 
                   (SELECT constraint_name FROM information_schema.table_constraints 
                    WHERE constraint_name LIKE '%evaluaciones_cognitivas%paciente%' 
                    AND table_name = 'evaluaciones_cognitivas' LIMIT 1);
        END IF;
        
        -- Agregar nueva restricción con CASCADE
        ALTER TABLE public.evaluaciones_cognitivas 
        ADD CONSTRAINT evaluaciones_cognitivas_id_paciente_fkey 
        FOREIGN KEY (id_paciente) 
        REFERENCES public.paciente (id_paciente) 
        MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Verificar los cambios
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    rc.update_rule,
    rc.delete_rule,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'paciente'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
