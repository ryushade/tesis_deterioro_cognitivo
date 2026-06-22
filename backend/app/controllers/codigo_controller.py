import db.database as db

#----------------Estado de los códigos-------------------
# 0 = Cancelado, 1 = Pendiente, 2 = Completado


def obtener_codigo_prueba():
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                SELECT ap.id_asignacion,
                       COALESCE(c.codigo_texto, 'SIN CÓDIGO') AS codigo_generado,
                       c.estado_codigo AS estado_codigo,
                       CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
                       pc.nombre_prueba,
                       ap.fecha_asignacion,
                       c.fecha_generacion
                FROM asignacion_prueba ap
                INNER JOIN paciente p ON ap.id_paciente = p.id_paciente
                INNER JOIN prueba_catalogo pc ON ap.id_prueba = pc.id_prueba
                LEFT JOIN codigo_acceso c ON c.id_asignacion = ap.id_asignacion;
            """)
            return cursor.fetchall()
    except Exception as e:
        print("Error", e)
        return None 
    finally:
        if conexion:
            conexion.close()

def resolver_id_prueba(tipo_evaluacion):
    """Resuelve el id_prueba a partir de un valor flexible.

    - Si es un entero (o string numérico) se asume que ya es un id_prueba válido.
    - Si es un nombre/alias ('CDT', 'MMSE', 'VOZ', o un nombre parcial) se busca
      dinámicamente en prueba_catalogo por coincidencia de nombre, evitando
      hardcodear ids que difieren del catálogo real de la BD.

    Devuelve el id_prueba (int) o None si no se puede resolver.
    """
    if tipo_evaluacion is None:
        return None

    # Caso directo: ya viene el id numérico
    if isinstance(tipo_evaluacion, int):
        return tipo_evaluacion
    texto = str(tipo_evaluacion).strip()
    if texto.isdigit():
        return int(texto)

    # Mapeo de alias a patrones LIKE para buscar en el catálogo real
    clave = texto.lower()
    if clave in ('cdt', 'reloj'):
        patrones = ['%reloj%']
    elif clave in ('mmse', 'minimental', 'mini-mental'):
        patrones = ['%mmse%', '%mini%']
    elif clave in ('voz', 'svf', 'fluidez'):
        patrones = ['%fluidez%', '%voz%']
    else:
        # Coincidencia genérica por el propio texto recibido
        patrones = ['%{}%'.format(clave)]

    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            for patron in patrones:
                cursor.execute(
                    "SELECT id_prueba FROM prueba_catalogo WHERE LOWER(nombre_prueba) LIKE %s ORDER BY id_prueba LIMIT 1",
                    (patron,)
                )
                res = cursor.fetchone()
                if res:
                    return res['id_prueba'] if isinstance(res, dict) else res[0]
        return None
    except Exception as e:
        print("Error resolviendo id_prueba:", e)
        return None
    finally:
        if conexion:
            conexion.close()


def asignar_y_generar_codigo(id_paciente, id_prueba, codigo_texto):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # 0. Verificación de seguridad: Evitar cualquier código activo de cualquier prueba para ese paciente
            cursor.execute("""
                SELECT c.codigo_texto
                FROM codigo_acceso c
                INNER JOIN asignacion_prueba ap ON c.id_asignacion = ap.id_asignacion
                WHERE ap.id_paciente = %s 
                  AND c.estado_codigo = 1
            """, (id_paciente, ))
            if cursor.fetchone():
                return {'error': 'El paciente ya cuenta con una evaluación activa. Debe culminar o cancelar la prueba actual antes de asignarle otra distinta.'}

            # 0.5 Verificación médica: Una misma prueba solo 1 vez por día
            cursor.execute("""
                SELECT ap.id_asignacion
                FROM asignacion_prueba ap
                WHERE ap.id_paciente = %s 
                  AND ap.id_prueba = %s
                  AND DATE(ap.fecha_asignacion) = CURRENT_DATE
            """, (id_paciente, id_prueba))
            if cursor.fetchone():
                return {'error': 'Por protocolo clínico, el paciente solo puede realizar la misma prueba 1 vez por día. Intente nuevamente mañana.'}

            # 1. Registrar asignación asociando la prueba al paciente
            cursor.execute("""
                INSERT INTO asignacion_prueba (id_paciente, id_prueba) 
                VALUES (%s, %s) RETURNING id_asignacion
            """, (id_paciente, id_prueba))
            res = cursor.fetchone()
            id_asignacion = res['id_asignacion'] if isinstance(res, dict) else res[0]
            
            # 2. Generar código relacionado
            cursor.execute("""
                INSERT INTO codigo_acceso (id_asignacion, codigo_texto, estado_codigo, fecha_generacion) 
                VALUES (%s, %s, 1, CURRENT_TIMESTAMP)
            """, (id_asignacion, codigo_texto))
            
            conexion.commit()
            return {'id_asignacion': id_asignacion}    
    except Exception as e:
        print("Error en transaccion de codigo:", e)
        if conexion:
            conexion.rollback()
        return None
    finally:
        if conexion:
            conexion.close()

def desactivar_codigo_acceso_prueba(id_asignacion):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            cursor.execute("""
                UPDATE codigo_acceso SET estado_codigo = '0' WHERE id_asignacion = %s
            """, (id_asignacion,))
            conexion.commit()
            return True
    except Exception as e:
        print("Error", e)
        return False
    finally:
        if conexion:
            conexion.close()


def actualizar_codigo(id_asignacion, estado_codigo, id_prueba=None):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Verificar si ya está completado (estado_codigo = 2)
            cursor.execute("SELECT estado_codigo FROM codigo_acceso WHERE id_asignacion = %s", (id_asignacion,))
            res = cursor.fetchone()
            if res:
                estado_actual = res['estado_codigo'] if isinstance(res, dict) else res[0]
                if int(estado_actual) == 2:
                    return False, "No se puede editar una prueba que ya ha sido completada."

            # Validar si intentan cambiar el estado a Completado (2) sin resultados en evaluacion_cognitiva
            if estado_codigo is not None and int(estado_codigo) == 2:
                cursor.execute("SELECT 1 FROM evaluacion_cognitiva WHERE id_asignacion = %s AND estado_evaluacion = 2", (id_asignacion,))
                tiene_resultado = cursor.fetchone()
                if not tiene_resultado:
                    return False, "No se puede marcar la prueba como completada porque no hay ningún resultado registrado en /resultados para esta asignación."

            # Actualizar estado
            if estado_codigo is not None:
                cursor.execute("""
                    UPDATE codigo_acceso SET estado_codigo = %s WHERE id_asignacion = %s
                """, (estado_codigo, id_asignacion))
            
            # Actualizar prueba asignada
            if id_prueba is not None:
                cursor.execute("""
                    UPDATE asignacion_prueba SET id_prueba = %s WHERE id_asignacion = %s
                """, (id_prueba, id_asignacion))
            
            conexion.commit()
            return True, "Código actualizado exitosamente"
    except Exception as e:
        print("Error en actualizar_codigo:", e)
        if conexion:
            conexion.rollback()
        return False, str(e)
    finally:
        if conexion:
            conexion.close()

def eliminar_codigo(id_asignacion):
    conexion = None
    try:
        conexion = db.obtener_conexion()
        with conexion.cursor() as cursor:
            # Verificar si el código está completado (estado_codigo = 2)
            cursor.execute("SELECT estado_codigo FROM codigo_acceso WHERE id_asignacion = %s", (id_asignacion,))
            res = cursor.fetchone()
            if res:
                estado = res['estado_codigo'] if isinstance(res, dict) else res[0]
                if int(estado) == 2:
                    return False  # No se puede eliminar una prueba completada

            # Primero eliminamos de codigo_acceso si existe
            cursor.execute("""
                DELETE FROM codigo_acceso WHERE id_asignacion = %s
            """, (id_asignacion,))
            # Luego eliminamos la asignacion de la prueba
            cursor.execute("""
                DELETE FROM asignacion_prueba WHERE id_asignacion = %s
            """, (id_asignacion,))
            conexion.commit()
            return True
    except Exception as e:
        print("Error eliminando código/asignación:", e)
        if conexion:
            conexion.rollback()
        return False
    finally:
        if conexion:
            conexion.close()