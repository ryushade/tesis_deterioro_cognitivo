import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from db.database import obtener_conexion

conn = obtener_conexion()
try:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                c.nombre_categoria,
                s.nombre_seccion,
                o.nombre_opcion,
                i.id_item,
                i.texto_item,
                i.respuesta_esperada,
                i.tipo_respuesta
            FROM categoria_mmse c
            JOIN seccion_mmse s ON s.id_categoria = c.id_categoria
            JOIN opcion_seccion_mmse o ON o.id_seccion = s.id_seccion
            JOIN item_mmse i ON i.id_opcion = o.id_opcion
            ORDER BY c.id_categoria, s.orden, o.orden, i.orden
        """)
        rows = cur.fetchall()
        print(f"Total items found: {len(rows)}")
        for r in rows[:40]: # Print first 40 items
            print(f"Cat: {r['nombre_categoria']} | Sec: {r['nombre_seccion']} | Opc: {r['nombre_opcion']} | Item: {r['texto_item']} | Resp: {r['respuesta_esperada']} | Tipo: {r['tipo_respuesta']}")
finally:
    conn.close()
