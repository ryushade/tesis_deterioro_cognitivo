import librosa
import numpy as np
import joblib
import warnings
import os
warnings.filterwarnings('ignore') # Ocultar advertencias de librosa sobre MP3

def predecir_nuevo_audio(ruta_audio, ruta_modelo="voz_modelo_rf.pkl"):
    print("="*50)
    print(f"-> INICIANDO DIAGNOSTICO DEL AUDIO: {os.path.basename(ruta_audio)}")
    print("="*50)
    
    # 1. Cargar el cerebro (modelo)
    if not os.path.exists(ruta_modelo):
        print(f"Error: No se encontró el modelo entrenado en {ruta_modelo}.")
        return

    print("Cargando modelo Random Forest...")
    pipeline = joblib.load(ruta_modelo)
    scaler = pipeline['scaler']
    modelo = pipeline['model']
    orden_cols = pipeline['features_order']
    
    # 2. Cargar el archivo de audio (Asumimos que todo el audio es la voz del paciente)
    print("Procesando audio (esto puede tomar unos segundos)...")
    try:
        y, sr = librosa.load(ruta_audio, sr=None)
    except Exception as e:
        print(f"Error cargando el MP3 (¿Tienes ffmpeg instalado?): {e}")
        return
        
    if len(y) == 0:
        print("El audio parece estar vacío o corrupto.")
        return
        
    print(f"Audio cargado exitosamente. Duración aprox: {len(y)/sr:.2f} segundos.")
    
    # 3. Extracción Matemática idéntica al entrenamiento
    print("Extrayendo Biometría de la Voz (MFCCs, ZCR, Centroide)...")
    
    # MFCCs
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfccs_mean = np.mean(mfccs, axis=1)
    
    # ZCR
    zcr = librosa.feature.zero_crossing_rate(y)
    zcr_mean = np.mean(zcr)
    
    # Spectral Centroid
    cent = librosa.feature.spectral_centroid(y=y, sr=sr)
    cent_mean = np.mean(cent)
    
    # Armar el diccionario de características extraídas
    features_dict = {
        'zcr_mean': zcr_mean,
        'centroid_mean': cent_mean
    }
    for i, mfcc_val in enumerate(mfccs_mean):
        features_dict[f'mfcc_{i+1}'] = mfcc_val
        
    # Ordenar estrictamente en el mismo orden que el entrenamiento
    features_array = np.array([[features_dict[col] for col in orden_cols]])
    
    # 4. Escalar los datos usando el Scaler guardado
    print("Ajustando dimensiones matemáticas...")
    X_scaled = scaler.transform(features_array)
    
    # 5. Predicción
    print("Emitiendo diagnóstico...")
    probabilidades = modelo.predict_proba(X_scaled)[0]
    prediccion = modelo.predict(X_scaled)[0]
    
    # 6. Resultados
    print("\n" + "="*50)
    print("RESULTADOS DEL DIAGNOSTICO")
    print("="*50)
    
    prob_sano = probabilidades[0] * 100
    prob_enfermo = probabilidades[1] * 100
    
    if prediccion == 0:
        print(f"[OK] DIAGNOSTICO PRINCIPAL: SANO (Control)")
    else:
        print(f"[ALERTA] DIAGNOSTICO PRINCIPAL: POSIBLE DETERIORO COGNITIVO (Paciente)")
        
    print("\nDetalle de Probabilidades del Modelo:")
    print(f"Probabilidad de ser SANO:      {prob_sano:.2f}%")
    print(f"Probabilidad de DETERIORO:     {prob_enfermo:.2f}%")
    print("\nNota Médica: Recuerda que este análisis consideró el audio completo.")
    print("En un caso real estricto, la voz ruidosa o largos silencios del ambiente")
    print("pueden alterar los MFCCs, por lo que aislar la voz siempre mejora la eficacia.")
    print("="*50)

if __name__ == "__main__":
    import sys
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    # Si se pasa un argumento por consola, usamos ese archivo; si no, buscamos Recording.mp3
    if len(sys.argv) > 1:
        Ruta_Audio = sys.argv[1]
    else:
        Ruta_Audio = os.path.join(BASE_DIR, "Recording.mp3")
        
    Ruta_Modelo = os.path.join(BASE_DIR, "voz_modelo_rf.pkl")
    
    predecir_nuevo_audio(Ruta_Audio, Ruta_Modelo)
