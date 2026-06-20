import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from db.database import obtener_conexion
from app.controllers import mmse_controller

conn = obtener_conexion()
try:
    with conn.cursor() as cur:
        # Find the writing item ID
        cur.execute("SELECT id_item, id_opcion FROM item_mmse WHERE tipo_respuesta = 'escritura' LIMIT 1")
        item_row = cur.fetchone()
        if not item_row:
            print("Writing item not found in DB!")
            sys.exit(1)
            
        id_item = item_row["id_item"]
        id_opcion = item_row["id_opcion"]
        print(f"Found writing item ID: {id_item}, Option ID: {id_opcion}")
        
        # Find or create a dummy eval section to avoid foreign key violations
        # First, find a valid id_evaluacion
        cur.execute("SELECT id_evaluacion FROM evaluacion_cognitiva LIMIT 1")
        eval_row = cur.fetchone()
        if not eval_row:
            print("No evaluations found in database to run integration test!")
            sys.exit(1)
        id_evaluacion = eval_row["id_evaluacion"]
        
        # Find the section ID for writing
        cur.execute("SELECT id_seccion FROM seccion_mmse WHERE nombre_seccion ILIKE '%escritura%' LIMIT 1")
        sec_row = cur.fetchone()
        if not sec_row:
            print("Writing section not found!")
            sys.exit(1)
        id_seccion = sec_row["id_seccion"]
        
        # Find or create evaluacion_mmse_seccion
        cur.execute("""
            INSERT INTO evaluacion_mmse_seccion (id_evaluacion, id_seccion, id_opcion_aplicada, orden_aplicacion)
            VALUES (%s, %s, %s, 1)
            ON CONFLICT (id_evaluacion, id_seccion) DO UPDATE SET id_opcion_aplicada = EXCLUDED.id_opcion_aplicada
            RETURNING id_eval_seccion
        """, (id_evaluacion, id_seccion, id_opcion))
        id_eval_seccion = cur.fetchone()["id_eval_seccion"]
        conn.commit()
        print(f"Using id_eval_seccion: {id_eval_seccion}")
        
        # Run test cases
        test_phrases = [
            ("El perro corre rápido.", True), # Should be graded as 1
            ("ventana verde", False),         # Should be graded as 0 (no verb)
        ]
        
        for phrase, expected in test_phrases:
            print(f"\n--- Testing Phrase: '{phrase}' ---")
            payload = {
                "id_eval_seccion": id_eval_seccion,
                "id_opcion": id_opcion,
                "id_item": id_item,
                "respuesta_texto": phrase,
                "correcto": True, # Frontend sends true initially
                "puntaje": 1      # Frontend sends 1 initially
            }
            
            # Call controller function
            result = mmse_controller.guardar_respuesta_item(payload)
            print("Result:", result)
            
            # Verify in DB
            cur.execute("""
                SELECT correcto, puntaje, observacion 
                FROM evaluacion_mmse_respuesta_item 
                WHERE id_eval_seccion = %s AND id_item = %s
            """, (id_eval_seccion, id_item))
            saved = cur.fetchone()
            print("Saved in DB:", saved)
            
finally:
    conn.close()
