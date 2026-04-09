import zipfile
import os
import json

def crear_diccionario_dataset(ruta_audios, ruta_labels):
    """
    Lee los ZIPs sin extraerlos y construye un diccionario mapeando
    cada paciente con el contenido de su archivo TXT y verificando su audio.
    """
    diccionario_pacientes = {}

    print(f"Lectura de labels: {os.path.basename(ruta_labels)}")
    with zipfile.ZipFile(ruta_labels, 'r') as zip_labels:
        for nombre_archivo in zip_labels.namelist():
            if nombre_archivo.endswith('.txt'):
                # Extraer el ID (ej: de "iaeav-inv01-003.txt" a "iaeav-inv01-003")
                id_paciente = nombre_archivo.replace('.txt', '')
                
                # Leer el contenido del texto (puede ser 0, 1, o una transcripcion)
                with zip_labels.open(nombre_archivo) as file:
                    # Leemos el archivo, usamos decode para pasar de bytes a string
                    contenido_texto = file.read().decode('utf-8').strip()
                
                diccionario_pacientes[id_paciente] = {
                    'texto_etiqueta': contenido_texto,
                    'nombre_audio': f"{id_paciente}.wav"
                }

    print(f"Lectura de audios: {os.path.basename(ruta_audios)}")
    with zipfile.ZipFile(ruta_audios, 'r') as zip_audios:
        archivos_audio = zip_audios.namelist()
        
        # Verificar que a cada texto le corresponde realmente un audio en el otro zip
        for id_paciente, datos in diccionario_pacientes.items():
            if datos['nombre_audio'] in archivos_audio:
                datos['audio_existe'] = True
            else:
                datos['audio_existe'] = False

    return diccionario_pacientes

if __name__ == "__main__":
    # Ajustamos las rutas asumiendo que este script se corre desde /services/
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    ruta_audios = os.path.join(directorio_actual, "voz_dataset", "audio_patients.zip")
    ruta_labels = os.path.join(directorio_actual, "voz_dataset", "labels_patients.zip")
    
    if not os.path.exists(ruta_audios) or not os.path.exists(ruta_labels):
        print("Error: No se encontraron los archivos ZIP.")
        print(f"Se buscó audios en: {ruta_audios}")
        print(f"Se buscó labels en: {ruta_labels}")
    else:
        # Generar diccionario
        diccionario = crear_diccionario_dataset(ruta_audios, ruta_labels)
        
        print("\n" + "="*50)
        print("MUESTRA DEL DICCIONARIO GENERADO (Primeros 5 pacientes)")
        print("="*50)
        
        # Mostrar los primeros 5 pacientes para inspeccionar qué contiene el texto
        for i, (id_paciente, datos) in enumerate(diccionario.items()):
            if i >= 5:
                break
            print(f"[{id_paciente}]")
            # Limpiamos el texto para evitar problemas con la consola de Windows al imprimir
            texto_limpio = datos["texto_etiqueta"].encode("ascii", "ignore").decode("ascii")
            print(f" -- Contenido del TXT (limpio): '{texto_limpio}'")
            print(f" -- Tiene audio .wav:  {'Si' if datos['audio_existe'] else 'No'}")
            
        print("\n" + "="*50)
        print(f"Total de pacientes identificados exitosamente: {len(diccionario)}")
        print("Si quieres guardar este diccionario completo como JSON, descomenta el final del código.")
        
        # OPCIONAL: Guardar todo en un archivo JSON para usarlo luego fácilmente
        # ruta_json_salida = os.path.join(directorio_actual, "diccionario_voz.json")
        # with open(ruta_json_salida, 'w', encoding='utf-8') as f:
        #     json.dump(diccionario, f, indent=4, ensure_ascii=False)
        # print(f"Diccionario guardado en: {ruta_json_salida}")
