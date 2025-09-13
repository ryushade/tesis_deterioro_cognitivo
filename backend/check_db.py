import psycopg2

try:
    # Conectar a PostgreSQL
    conn = psycopg2.connect(
        host='localhost',
        database='tesis_deterioro_cognitivo',
        user='postgres',
        password='12345678'
    )
    cursor = conn.cursor()
    
    print("✅ Conexión exitosa a PostgreSQL")
    
    # Verificar tablas
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
    tables = cursor.fetchall()
    print("\n📋 Tablas disponibles:")
    for table in tables:
        print(f"- {table[0]}")
    
    # Verificar estructura de tabla usuario si existe
    cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='usuario');")
    usuario_exists = cursor.fetchone()[0]
    
    if usuario_exists:
        print("\n👤 Estructura de tabla 'usuario':")
        cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='usuario' ORDER BY ordinal_position;")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
        
        # Mostrar algunos datos
        cursor.execute("SELECT * FROM usuario LIMIT 5;")
        users = cursor.fetchall()
        print(f"\n📊 Datos de usuario ({len(users)} registros):")
        for user in users:
            print(f"  - {user}")
    
    # Verificar estructura de tabla rol si existe
    cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='rol');")
    rol_exists = cursor.fetchone()[0]
    
    if rol_exists:
        print("\n🏷️  Estructura de tabla 'rol':")
        cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='rol' ORDER BY ordinal_position;")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
        
        # Mostrar algunos datos
        cursor.execute("SELECT * FROM rol LIMIT 5;")
        roles = cursor.fetchall()
        print(f"\n📊 Datos de rol ({len(roles)} registros):")
        for role in roles:
            print(f"  - {role}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
