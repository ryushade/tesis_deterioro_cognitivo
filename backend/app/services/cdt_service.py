import pandas as pd
import os
import pyreadstat

# 1 Script para el dataset del test del reloj (CDT)
ruta_base = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\app\controllers\cdt_dataset"
nombre_subcarpeta_sas = "labels"

lista_df = []

print("Iniciando procesamiento a prueba de fallos...")

for ronda in range(1, 10):
    ronda_str = str(ronda)
    ruta_ronda = os.path.join(ruta_base, ronda_str)

    if not os.path.exists(ruta_ronda):
        continue

    ruta_labels = os.path.join(ruta_ronda, nombre_subcarpeta_sas)
    imagenes_ronda = [img for img in os.listdir(ruta_ronda) if img.endswith(('.tif', '.tiff'))]
    
    print(f"\n--- Ronda {ronda} ---")
    print(f"Imágenes físicas: {len(imagenes_ronda)}")

    if os.path.exists(ruta_labels):
        archivos_sas = [f for f in os.listdir(ruta_labels) if f.endswith('.sas7bdat')]
        
        for sas_file in archivos_sas:
            if "sp_file" not in sas_file.lower():
                continue 
                
            ruta_sas_completa = os.path.join(ruta_labels, sas_file)
            print(f"Leyendo: {sas_file}...")
            
            try:
                df, meta = pyreadstat.read_sas7bdat(ruta_sas_completa)
                df.columns = df.columns.str.lower()
                
                # === BÚSQUEDA INTELIGENTE DE LA COLUMNA ===
                # Buscamos cualquier columna que empiece con cg{ronda} y contenga 'clkdra'
                columnas_candidatas = [col for col in df.columns if col.startswith(f"cg{ronda}") and 'clkdra' in col]
                
                # Descartamos la columna de "claridad de imagen" (imgcl) si aparece
                columnas_puntaje = [col for col in columnas_candidatas if 'imgcl' not in col]
                
                if columnas_puntaje:
                    col_reloj = columnas_puntaje[0] # Tomamos la que encontró (ej: cg1dclkdraw o cg2dclkdra)
                    print(f"  -> Columna detectada automáticamente: {col_reloj}")
                    
                    df_filtrado = df[['spid', col_reloj]].copy()
                    df_filtrado = df_filtrado[df_filtrado[col_reloj] >= 0]
                    df_filtrado.rename(columns={col_reloj: 'puntaje_reloj'}, inplace=True)
                    df_filtrado['ronda'] = ronda
                    
                    rutas_img = []
                    for spid in df_filtrado['spid']:
                        spid_limpio = str(int(spid)) if pd.notnull(spid) else ""
                        nombre_img = f"{spid_limpio}.tif" 
                        ruta_img_absoluta = os.path.join(ruta_ronda, nombre_img)
                        
                        if nombre_img in imagenes_ronda:
                            rutas_img.append(ruta_img_absoluta.replace('\\', '/'))
                        else:
                            rutas_img.append(None)
                            
                    df_filtrado['ruta_imagen'] = rutas_img
                    df_final = df_filtrado.dropna(subset=['ruta_imagen'])
                    
                    lista_df.append(df_final)
                    print(f"  -> Éxito: {len(df_final)} pacientes emparejados con su foto.")
                else:
                    print(f"  -> ERROR GRAVE: No se encontró ninguna variable de reloj en la Ronda {ronda}.")
                    
            except Exception as e:
                print(f"Error procesando {sas_file}: {e}")

# Fase final: Combinar y guardar
if lista_df:
    df_completo = pd.concat(lista_df, ignore_index=True)
    print("\n" + "="*50)
    print(f"¡CONSTRUCCIÓN DEL DATASET FINALIZADA!")
    print(f"Total de registros listos para la Red Neuronal: {len(df_completo)}")
    
    ruta_exportacion = os.path.join(ruta_base, "dataset_cdt_maestro.csv")
    df_completo.to_csv(ruta_exportacion, index=False)
    print(f"Archivo Maestro guardado en: {ruta_exportacion}")
    print("="*50)