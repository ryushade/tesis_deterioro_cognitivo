import os
import pandas as pd
import numpy as np
import librosa
import soundfile as sf
import tqdm

def procesar_datasets(metadata_path, audio_dir, labels_dir, output_csv="voice_features.csv"):
    """
    IMPORTANTE: Debido a que los audios están en un ZIP Multi-volumen (.z01, .z02, .zip),
    Python no puede descomprimirlos nativamente.
    DEBES descomprimir los audios manualmente (usando WinRAR o 7-Zip) y colocar 
    todos los .wav en `audio_dir` y todos los .txt en `labels_dir` antes de correr esto.
    """
    
    print("Cargando Metadata...")
    if not os.path.exists(metadata_path):
        print(f"Error: No se encuentra {metadata_path}")
        return
        
    df_meta = pd.read_csv(metadata_path)
    
    features_list = []
    
    print(f"Buscando audios en: {audio_dir}")
    print(f"Buscando etiquetas en: {labels_dir}")
    
    # Filtrar solo los que realmente procesaremos
    for index, row in tqdm.tqdm(df_meta.iterrows(), total=len(df_meta)):
        pac_id = row['Participant ID']
        grupo = row['Group']
        dx = row['Diagnosis (only patients)']
        
        audio_path = os.path.join(audio_dir, f"{pac_id}.wav")
        txt_path = os.path.join(labels_dir, f"{pac_id}.txt")
        
        if not os.path.exists(audio_path) or not os.path.exists(txt_path):
            continue # Si falta el archivo (ej. no ha sido extraído), lo saltamos
            
        try:
            # 1. Leer los tiempos donde habla el PACIENTE
            pac_segments = []
            with open(txt_path, 'r', encoding='utf-8') as f:
                for line in f:
                    partes = line.strip().split()
                    if len(partes) >= 3 and partes[2] == 'PAC':
                        t_start = float(partes[0])
                        t_end = float(partes[1])
                        pac_segments.append((t_start, t_end))
                        
            if not pac_segments:
                continue # No hay voz del paciente marcada
                
            # 2. Cargar el audio original
            # Cargar todo toma tiempo, pero es necesario
            y, sr = librosa.load(audio_path, sr=None) # sr=None mantiene sr original
            
            # 3. Recortar solo la voz del paciente
            y_pac = []
            for start, end in pac_segments:
                s_idx = int(start * sr)
                e_idx = int(end * sr)
                y_pac.append(y[s_idx:e_idx])
                
            y_pac_compilado = np.concatenate(y_pac)
            
            if len(y_pac_compilado) == 0:
                continue
                
            # 4. Extracción de Características (Feature Engineering)
            # Extraemos las matemáticas de la voz del paciente
            
            # MFCCs (Timbre vocal) - 13 coeficientes promediados en el tiempo
            mfccs = librosa.feature.mfcc(y=y_pac_compilado, sr=sr, n_mfcc=13)
            mfccs_mean = np.mean(mfccs, axis=1)
            
            # Zero Crossing Rate (Ronquera/Ruido en la voz)
            zcr = librosa.feature.zero_crossing_rate(y_pac_compilado)
            zcr_mean = np.mean(zcr)
            
            # Spectral Centroid (Brillo de la voz)
            cent = librosa.feature.spectral_centroid(y=y_pac_compilado, sr=sr)
            cent_mean = np.mean(cent)
            
            # 5. Estructurar el dato resultante (El "Y" será 0 control, 1 Deterioro)
            label_binario = 0 if grupo == "Control" else 1
            
            feature_dict = {
                'pac_id': pac_id,
                'target': label_binario,
                'diagnosis_raw': dx if pd.notna(dx) else "Healthy",
                'zcr_mean': zcr_mean,
                'centroid_mean': cent_mean
            }
            
            # Agregar los 13 coeficientes a la fila individualmente
            for i, mfcc_val in enumerate(mfccs_mean):
                feature_dict[f'mfcc_{i+1}'] = mfcc_val
                
            features_list.append(feature_dict)
            
        except Exception as e:
            print(f"Error procesando {pac_id}: {e}")
            
    # Guardar a CSV
    if features_list:
        df_features = pd.DataFrame(features_list)
        df_features.to_csv(output_csv, index=False)
        print(f"\n¡Éxito! Dataset estructurado guardado en {output_csv}")
        print(f"Muestras procesadas: {len(df_features)} (Controles: {(df_features['target']==0).sum()}, Pacientes: {(df_features['target']==1).sum()})")
    else:
        print("No se procesó ninguna muestra exitosamente.")

if __name__ == "__main__":
    # DIRECTORIOS QUE EL USUARIO DEBE PREPARAR
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    METADATA_PATH = os.path.join(BASE_DIR, "voz_dataset", "metadata.csv")
    
    # Asumimos que el usuario ha extraído TODO (audios y labels) en estas carpetas:
    AUDIO_DIR = os.path.join(BASE_DIR, "voz_dataset_extraido", "audios")
    LABELS_DIR = os.path.join(BASE_DIR, "voz_dataset_extraido", "labels")
    
    OUTPUT_CSV = os.path.join(BASE_DIR, "voice_features.csv")
    
    procesar_datasets(METADATA_PATH, AUDIO_DIR, LABELS_DIR, OUTPUT_CSV)
