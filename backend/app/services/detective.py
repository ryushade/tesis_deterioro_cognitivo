import pyreadstat

# Ruta directa al archivo de tu Ronda 1
ruta_prueba = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\app\controllers\cdt_dataset\1\labels\NHATS_Round_1_SP_File.sas7bdat"

print("Leyendo el archivo SAS (esto tomará unos segundos)...")
df, meta = pyreadstat.read_sas7bdat(ruta_prueba)

# Pasamos todo a minúsculas y quitamos espacios en blanco por si acaso
columnas = df.columns.str.lower().str.strip()

# Filtramos las columnas que contengan 'clk' (clock)
columnas_reloj = [col for col in columnas if 'clk' in col]

print("\n¡Búsqueda terminada!")
print(f"Columnas que contienen 'clk': {columnas_reloj}")

# Por si acaso "clk" no está, busquemos "draw" o "cdt"
columnas_respaldo = [col for col in columnas if 'draw' in col or 'cdt' in col]
print(f"Columnas de respaldo (draw/cdt): {columnas_respaldo}")