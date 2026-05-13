import db.database as db

def obtener_categorias_mmse():
    conn = None
    try:
        conn = db.obtener_conexion()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    c.id_categoria,
                    c.nombre_categoria,
                    c.descripcion,
                    c.puntaje_maximo,
                    c.estado,
                    COUNT(DISTINCT s.id_seccion) AS total_secciones,
                    COUNT(DISTINCT i.id_item) FILTER (
                        WHERE i.estado = 1
                    ) AS total_items_configurados
                FROM public.categoria_mmse c
                JOIN public.prueba_catalogo p
                    ON p.id_prueba = c.id_prueba
                LEFT JOIN public.seccion_mmse s
                    ON s.id_categoria = c.id_categoria
                   AND s.estado = 1
                LEFT JOIN public.opcion_seccion_mmse o
                    ON o.id_seccion = s.id_seccion
                   AND o.estado = 1
                LEFT JOIN public.item_mmse i
                    ON i.id_opcion = o.id_opcion
                   AND i.estado = 1
                WHERE UPPER(p.nombre_prueba) = 'MMSE'
                GROUP BY
                    c.id_categoria,
                    c.nombre_categoria,
                    c.descripcion,
                    c.puntaje_maximo,
                    c.estado
                ORDER BY c.id_categoria;
            """)
            return cur.fetchall()
    except Exception as e:
        print(f"Error obteniendo categorias MMSE: {e}")
        return None
    finally:
        if conn:
            conn.close()

