"""
Controlador de CONFIGURACIÓN del instrumento MMSE (Fase 0 - edición dinámica).

Permite a un Administrador editar la definición de la prueba sin tocar código:
categoría -> sección -> opción -> ítem. Toda "eliminación" es lógica
(soft-delete, estado=0) para preservar la integridad de las evaluaciones
históricas, cuyas respuestas referencian estas filas mediante claves foráneas
con ON DELETE RESTRICT.

Reglas de la BD que este módulo respeta:
  - item_mmse.puntaje_maximo SIEMPRE = 1 (CONSTRAINT chk_item_puntaje).
  - item_mmse.tipo_respuesta ∈ TIPOS_RESPUESTA_VALIDOS.
  - puntaje_maximo > 0 en sección y opción.
  - 'orden' es único por padre (se autoasigna en la creación).
"""
import db.database as db


# Debe coincidir con CONSTRAINT chk_item_tipo_respuesta del esquema.
TIPOS_RESPUESTA_VALIDOS = {
    'verbal', 'texto', 'numero', 'ejecucion',
    'lectura_accion', 'escritura', 'dibujo', 'observacion'
}

# Rol con permiso para editar la definición del instrumento.
ROL_ADMINISTRADOR = 3


def usuario_es_administrador(id_usuario):
    """True si el usuario tiene rol Administrador (3)."""
    if not id_usuario:
        return False
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("SELECT id_rol FROM usuario WHERE id_usuario = %s", (id_usuario,))
            row = cur.fetchone()
            if not row:
                return False
            id_rol = row["id_rol"] if isinstance(row, dict) else row[0]
            return id_rol == ROL_ADMINISTRADOR
    except Exception as e:
        print(f"Error verificando rol de usuario: {e}")
        return False
    finally:
        if conn:
            conn.close()


def _obtener_id_prueba_mmse(cur):
    """Resuelve el id_prueba del MMSE por nombre (no se hardcodea, igual que las
    queries de lectura), para no depender de un ID fijo en el catálogo."""
    cur.execute("""
        SELECT id_prueba FROM prueba_catalogo
        WHERE (UPPER(nombre_prueba) LIKE '%MMSE%' OR UPPER(nombre_prueba) LIKE '%MINI%')
          AND estado = 1
        ORDER BY id_prueba
        LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        return None
    return row["id_prueba"] if isinstance(row, dict) else row[0]


def _siguiente_orden(cur, tabla, columna_padre, id_padre):
    """Devuelve MAX(orden)+1 para el padre dado (cuenta filas activas e inactivas
    porque la restricción UNIQUE de 'orden' no distingue estado)."""
    cur.execute(
        f"SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM {tabla} WHERE {columna_padre} = %s",
        (id_padre,),
    )
    row = cur.fetchone()
    return row["siguiente"] if isinstance(row, dict) else row[0]


def _validar_nombre(valor, campo="nombre"):
    if not valor or not str(valor).strip():
        return f"El {campo} es obligatorio."
    return None


def _validar_puntaje_positivo(valor, campo="puntaje máximo"):
    try:
        n = int(valor)
    except (ValueError, TypeError):
        return f"El {campo} debe ser un número entero."
    if n <= 0:
        return f"El {campo} debe ser mayor a 0."
    return None


# =========================================================
# CATEGORÍA
# =========================================================

def crear_categoria(data):
    error = _validar_nombre(data.get("nombre_categoria"), "nombre de la categoría")
    if error:
        return {"error": error}
    error = _validar_puntaje_positivo(data.get("puntaje_maximo"))
    if error:
        return {"error": error}

    estado = 1 if int(data.get("estado", 1)) == 1 else 0

    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            # Resolver el id_prueba del MMSE por nombre, salvo que se indique explícitamente.
            id_prueba = data.get("id_prueba") or _obtener_id_prueba_mmse(cur)
            if not id_prueba:
                return {"error": "No se encontró la prueba MMSE en el catálogo."}
            cur.execute("""
                INSERT INTO categoria_mmse (id_prueba, nombre_categoria, puntaje_maximo, estado)
                VALUES (%s, %s, %s, %s)
                RETURNING id_categoria
            """, (id_prueba, data["nombre_categoria"].strip(), int(data["puntaje_maximo"]), estado))
            row = cur.fetchone()
            conn.commit()
            return {"id_categoria": row["id_categoria"] if isinstance(row, dict) else row[0]}
    except Exception as e:
        print(f"Error creando categoría MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def actualizar_categoria(id_categoria, data):
    if "nombre_categoria" in data:
        error = _validar_nombre(data.get("nombre_categoria"), "nombre de la categoría")
        if error:
            return {"error": error}
    if "puntaje_maximo" in data:
        error = _validar_puntaje_positivo(data.get("puntaje_maximo"))
        if error:
            return {"error": error}

    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE categoria_mmse
                SET nombre_categoria = COALESCE(%s, nombre_categoria),
                    puntaje_maximo   = COALESCE(%s, puntaje_maximo),
                    estado           = COALESCE(%s, estado)
                WHERE id_categoria = %s
                RETURNING id_categoria
            """, (
                data["nombre_categoria"].strip() if "nombre_categoria" in data else None,
                int(data["puntaje_maximo"]) if "puntaje_maximo" in data else None,
                int(data["estado"]) if "estado" in data else None,
                id_categoria,
            ))
            row = cur.fetchone()
            if not row:
                return {"error": "Categoría no encontrada"}
            conn.commit()
            return {"id_categoria": id_categoria}
    except Exception as e:
        print(f"Error actualizando categoría MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def eliminar_categoria(id_categoria):
    """Soft-delete: estado=0. No borra físicamente para no romper evaluaciones previas."""
    return _soft_delete("categoria_mmse", "id_categoria", id_categoria, "Categoría")


# =========================================================
# SECCIÓN
# =========================================================

def crear_seccion(data):
    error = _validar_nombre(data.get("nombre_seccion"), "nombre de la sección")
    if error:
        return {"error": error}
    error = _validar_puntaje_positivo(data.get("puntaje_maximo"))
    if error:
        return {"error": error}
    if not data.get("id_categoria"):
        return {"error": "Falta id_categoria"}

    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            orden = data.get("orden") or _siguiente_orden(cur, "seccion_mmse", "id_categoria", data["id_categoria"])
            cur.execute("""
                INSERT INTO seccion_mmse
                    (id_categoria, nombre_seccion, descripcion, instrucciones_aplicacion,
                     orden, puntaje_maximo, permite_opciones, requiere_material, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id_seccion
            """, (
                data["id_categoria"], data["nombre_seccion"].strip(),
                data.get("descripcion"), data.get("instrucciones_aplicacion"),
                orden, int(data["puntaje_maximo"]),
                bool(data.get("permite_opciones", False)),
                bool(data.get("requiere_material", False)),
                1 if int(data.get("estado", 1)) == 1 else 0,
            ))
            row = cur.fetchone()
            conn.commit()
            return {"id_seccion": row["id_seccion"] if isinstance(row, dict) else row[0]}
    except Exception as e:
        print(f"Error creando sección MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def actualizar_seccion(id_seccion, data):
    if "nombre_seccion" in data:
        error = _validar_nombre(data.get("nombre_seccion"), "nombre de la sección")
        if error:
            return {"error": error}
    if "puntaje_maximo" in data:
        error = _validar_puntaje_positivo(data.get("puntaje_maximo"))
        if error:
            return {"error": error}

    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE seccion_mmse
                SET nombre_seccion           = COALESCE(%s, nombre_seccion),
                    descripcion              = COALESCE(%s, descripcion),
                    instrucciones_aplicacion = COALESCE(%s, instrucciones_aplicacion),
                    puntaje_maximo           = COALESCE(%s, puntaje_maximo),
                    permite_opciones         = COALESCE(%s, permite_opciones),
                    requiere_material        = COALESCE(%s, requiere_material),
                    orden                    = COALESCE(%s, orden),
                    estado                   = COALESCE(%s, estado)
                WHERE id_seccion = %s
                RETURNING id_seccion
            """, (
                data["nombre_seccion"].strip() if "nombre_seccion" in data else None,
                data.get("descripcion") if "descripcion" in data else None,
                data.get("instrucciones_aplicacion") if "instrucciones_aplicacion" in data else None,
                int(data["puntaje_maximo"]) if "puntaje_maximo" in data else None,
                bool(data["permite_opciones"]) if "permite_opciones" in data else None,
                bool(data["requiere_material"]) if "requiere_material" in data else None,
                int(data["orden"]) if "orden" in data else None,
                int(data["estado"]) if "estado" in data else None,
                id_seccion,
            ))
            row = cur.fetchone()
            if not row:
                return {"error": "Sección no encontrada"}
            conn.commit()
            return {"id_seccion": id_seccion}
    except Exception as e:
        print(f"Error actualizando sección MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def eliminar_seccion(id_seccion):
    return _soft_delete("seccion_mmse", "id_seccion", id_seccion, "Sección")


# =========================================================
# OPCIÓN
# =========================================================

def crear_opcion(data):
    error = _validar_nombre(data.get("nombre_opcion"), "nombre de la opción")
    if error:
        return {"error": error}
    error = _validar_puntaje_positivo(data.get("puntaje_maximo"))
    if error:
        return {"error": error}
    if not data.get("id_seccion"):
        return {"error": "Falta id_seccion"}

    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            orden = data.get("orden") or _siguiente_orden(cur, "opcion_seccion_mmse", "id_seccion", data["id_seccion"])
            cur.execute("""
                INSERT INTO opcion_seccion_mmse
                    (id_seccion, nombre_opcion, instrucciones, orden, es_default, puntaje_maximo, estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id_opcion
            """, (
                data["id_seccion"], data["nombre_opcion"].strip(),
                data.get("instrucciones"), orden,
                bool(data.get("es_default", True)), int(data["puntaje_maximo"]),
                1 if int(data.get("estado", 1)) == 1 else 0,
            ))
            row = cur.fetchone()
            conn.commit()
            return {"id_opcion": row["id_opcion"] if isinstance(row, dict) else row[0]}
    except Exception as e:
        print(f"Error creando opción MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def actualizar_opcion(id_opcion, data):
    if "nombre_opcion" in data:
        error = _validar_nombre(data.get("nombre_opcion"), "nombre de la opción")
        if error:
            return {"error": error}
    if "puntaje_maximo" in data:
        error = _validar_puntaje_positivo(data.get("puntaje_maximo"))
        if error:
            return {"error": error}

    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE opcion_seccion_mmse
                SET nombre_opcion  = COALESCE(%s, nombre_opcion),
                    instrucciones  = COALESCE(%s, instrucciones),
                    es_default     = COALESCE(%s, es_default),
                    puntaje_maximo = COALESCE(%s, puntaje_maximo),
                    orden          = COALESCE(%s, orden),
                    estado         = COALESCE(%s, estado)
                WHERE id_opcion = %s
                RETURNING id_opcion
            """, (
                data["nombre_opcion"].strip() if "nombre_opcion" in data else None,
                data.get("instrucciones") if "instrucciones" in data else None,
                bool(data["es_default"]) if "es_default" in data else None,
                int(data["puntaje_maximo"]) if "puntaje_maximo" in data else None,
                int(data["orden"]) if "orden" in data else None,
                int(data["estado"]) if "estado" in data else None,
                id_opcion,
            ))
            row = cur.fetchone()
            if not row:
                return {"error": "Opción no encontrada"}
            conn.commit()
            return {"id_opcion": id_opcion}
    except Exception as e:
        print(f"Error actualizando opción MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def eliminar_opcion(id_opcion):
    return _soft_delete("opcion_seccion_mmse", "id_opcion", id_opcion, "Opción")


# =========================================================
# ÍTEM
# =========================================================

def crear_item(data):
    error = _validar_nombre(data.get("texto_item"), "texto del ítem")
    if error:
        return {"error": error}
    if not data.get("id_opcion"):
        return {"error": "Falta id_opcion"}

    tipo_respuesta = data.get("tipo_respuesta", "verbal")
    if tipo_respuesta not in TIPOS_RESPUESTA_VALIDOS:
        return {"error": f"tipo_respuesta inválido. Permitidos: {', '.join(sorted(TIPOS_RESPUESTA_VALIDOS))}"}

    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            orden = data.get("orden") or _siguiente_orden(cur, "item_mmse", "id_opcion", data["id_opcion"])
            cur.execute("""
                INSERT INTO item_mmse
                    (id_opcion, texto_item, criterio_correccion, respuesta_esperada,
                     tipo_respuesta, orden, puntaje_maximo, requiere_revision_manual, estado)
                VALUES (%s, %s, %s, %s, %s, %s, 1, %s, %s)
                RETURNING id_item
            """, (
                data["id_opcion"], data["texto_item"].strip(),
                data.get("criterio_correccion"), data.get("respuesta_esperada"),
                tipo_respuesta, orden,
                bool(data.get("requiere_revision_manual", False)),
                1 if int(data.get("estado", 1)) == 1 else 0,
            ))
            row = cur.fetchone()
            conn.commit()
            return {"id_item": row["id_item"] if isinstance(row, dict) else row[0]}
    except Exception as e:
        print(f"Error creando ítem MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def actualizar_item(id_item, data):
    if "texto_item" in data:
        error = _validar_nombre(data.get("texto_item"), "texto del ítem")
        if error:
            return {"error": error}
    if "tipo_respuesta" in data and data["tipo_respuesta"] not in TIPOS_RESPUESTA_VALIDOS:
        return {"error": f"tipo_respuesta inválido. Permitidos: {', '.join(sorted(TIPOS_RESPUESTA_VALIDOS))}"}

    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE item_mmse
                SET texto_item               = COALESCE(%s, texto_item),
                    criterio_correccion      = COALESCE(%s, criterio_correccion),
                    respuesta_esperada       = COALESCE(%s, respuesta_esperada),
                    tipo_respuesta           = COALESCE(%s, tipo_respuesta),
                    orden                    = COALESCE(%s, orden),
                    requiere_revision_manual = COALESCE(%s, requiere_revision_manual),
                    estado                   = COALESCE(%s, estado)
                WHERE id_item = %s
                RETURNING id_item
            """, (
                data["texto_item"].strip() if "texto_item" in data else None,
                data.get("criterio_correccion") if "criterio_correccion" in data else None,
                data.get("respuesta_esperada") if "respuesta_esperada" in data else None,
                data.get("tipo_respuesta") if "tipo_respuesta" in data else None,
                int(data["orden"]) if "orden" in data else None,
                bool(data["requiere_revision_manual"]) if "requiere_revision_manual" in data else None,
                int(data["estado"]) if "estado" in data else None,
                id_item,
            ))
            row = cur.fetchone()
            if not row:
                return {"error": "Ítem no encontrado"}
            conn.commit()
            return {"id_item": id_item}
    except Exception as e:
        print(f"Error actualizando ítem MMSE: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def eliminar_item(id_item):
    return _soft_delete("item_mmse", "id_item", id_item, "Ítem")


# =========================================================
# Utilidades comunes
# =========================================================

def _soft_delete(tabla, columna_pk, id_valor, etiqueta):
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE {tabla} SET estado = 0 WHERE {columna_pk} = %s RETURNING {columna_pk}",
                (id_valor,),
            )
            row = cur.fetchone()
            if not row:
                return {"error": f"{etiqueta} no encontrada"}
            conn.commit()
            return {"ok": True, columna_pk: id_valor}
    except Exception as e:
        print(f"Error en soft-delete de {etiqueta}: {e}")
        if conn:
            conn.rollback()
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()


def validar_estructura(id_prueba=None):
    """
    Reporta incoherencias de puntaje en la estructura ACTIVA, sin bloquear.
    Devuelve {coherente: bool, total_prueba, suma_categorias, advertencias: [...]}.
    Las opciones se tratan como alternativas: el puntaje de la sección se compara
    con la opción por defecto (es_default) activa.
    """
    conn = None
    try:
        conn = db.obtener_conexion()
        advertencias = []
        with conn.cursor() as cur:
            if not id_prueba:
                id_prueba = _obtener_id_prueba_mmse(cur)
            if not id_prueba:
                return {"error": "No se encontró la prueba MMSE en el catálogo."}
            cur.execute("SELECT nombre_prueba, puntaje_maximo FROM prueba_catalogo WHERE id_prueba = %s", (id_prueba,))
            prueba = cur.fetchone()
            if not prueba:
                return {"error": "Prueba no encontrada"}
            total_prueba = prueba["puntaje_maximo"] if isinstance(prueba, dict) else prueba[1]

            # Suma de categorías activas
            cur.execute("""
                SELECT id_categoria, nombre_categoria, puntaje_maximo
                FROM categoria_mmse
                WHERE id_prueba = %s AND estado = 1
                ORDER BY id_categoria
            """, (id_prueba,))
            categorias = cur.fetchall()
            suma_categorias = sum((c["puntaje_maximo"] for c in categorias), 0)

            if suma_categorias != total_prueba:
                advertencias.append(
                    f"La suma de las categorías ({suma_categorias}) no coincide con el "
                    f"puntaje máximo de la prueba ({total_prueba})."
                )

            # Coherencia categoría -> secciones
            for cat in categorias:
                cur.execute("""
                    SELECT COALESCE(SUM(puntaje_maximo), 0) AS suma
                    FROM seccion_mmse WHERE id_categoria = %s AND estado = 1
                """, (cat["id_categoria"],))
                suma_secciones = cur.fetchone()["suma"]
                if suma_secciones != cat["puntaje_maximo"]:
                    advertencias.append(
                        f"Categoría '{cat['nombre_categoria']}': la suma de secciones "
                        f"({suma_secciones}) no coincide con su puntaje máximo "
                        f"({cat['puntaje_maximo']})."
                    )

            return {
                "coherente": len(advertencias) == 0,
                "total_prueba": total_prueba,
                "suma_categorias": suma_categorias,
                "advertencias": advertencias,
            }
    except Exception as e:
        print(f"Error validando estructura MMSE: {e}")
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()
