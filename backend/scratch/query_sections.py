import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import db.database as db

conn = db.obtener_conexion()
cur = conn.cursor()
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import db.database as db

conn = db.obtener_conexion()
cur = conn.cursor()

# Get column names for categoria_mmse
cur.execute("SELECT * FROM categoria_mmse LIMIT 1")
print("categoria_mmse columns:", [desc[0] for desc in cur.description])
print("categoria_mmse row:", dict(cur.fetchone()) if cur.rowcount > 0 else "empty")

# Get column names for seccion_mmse
cur.execute("SELECT * FROM seccion_mmse LIMIT 1")
print("seccion_mmse columns:", [desc[0] for desc in cur.description])
print("seccion_mmse row:", dict(cur.fetchone()) if cur.rowcount > 0 else "empty")

# Print all records
cur.execute("""
    SELECT s.id_seccion, s.nombre_seccion, s.orden as seccion_orden, 
           c.id_categoria, c.nombre_categoria
    FROM seccion_mmse s
    JOIN categoria_mmse c ON c.id_categoria = s.id_categoria
    WHERE s.estado = 1
""")
rows = cur.fetchall()
for r in rows:
    print(f"Cat: {r['id_categoria']} | Sec: {r['id_seccion']} (ord {r['seccion_orden']}) | Name: {r['nombre_seccion']:30s} | CatName: {r['nombre_categoria']}")

conn.close()


