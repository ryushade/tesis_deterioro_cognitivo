import psycopg2
from config.config import Config

try:
    conn = psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        database=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD
    )
    cursor = conn.cursor()
    
    print('=== Estructura tabla codigo_acceso ===')
    cursor.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'codigo_acceso'
        ORDER BY ordinal_position;
    """)
    for row in cursor.fetchall():
        print(f'{row[0]}: {row[1]} (nullable: {row[2]}, default: {row[3]})')
    
    print('\n=== Restricciones de clave foránea ===')
    cursor.execute("""
        SELECT 
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
        WHERE constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'codigo_acceso' OR ccu.table_name = 'paciente');
    """)
    for row in cursor.fetchall():
        print(f'{row[0]}: {row[1]}.{row[2]} -> {row[3]}.{row[4]}')
    
    print('\n=== Datos en codigo_acceso para paciente 18 ===')
    cursor.execute('SELECT * FROM codigo_acceso WHERE id_paciente = 18')
    rows = cursor.fetchall()
    if rows:
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'codigo_acceso' ORDER BY ordinal_position")
        columns = [row[0] for row in cursor.fetchall()]
        print('Columnas:', columns)
        for row in rows:
            print('Datos:', row)
    else:
        print('No hay registros para paciente 18')
    
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')
