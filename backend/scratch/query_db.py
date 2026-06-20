import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from db.database import obtener_conexion

conn = obtener_conexion()
try:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT s.id_seccion, s.nombre_seccion, o.id_opcion, o.nombre_opcion, 
                   i.id_item, i.texto_item, i.tipo_respuesta 
            FROM seccion_mmse s 
            JOIN opcion_seccion_mmse o ON o.id_seccion = s.id_seccion 
            JOIN item_mmse i ON i.id_opcion = o.id_opcion 
            ORDER BY s.id_seccion, o.id_opcion, i.id_item
        """)
        rows = cur.fetchall()
        print(f"Total rows: {len(rows)}")
        for r in rows:
            print(f"Sec {r['id_seccion']} ({r['nombre_seccion']}) | Opc {r['id_opcion']} ({r['nombre_opcion']}) | Item {r['id_item']} ({r['texto_item']}) | Type {r['tipo_respuesta']}")
finally:
    conn.close()
