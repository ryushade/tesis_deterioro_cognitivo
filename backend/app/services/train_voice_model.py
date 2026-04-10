import os
import pandas as pd
import numpy as np
import joblib
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score, confusion_matrix
from sklearn.preprocessing import StandardScaler

def entrenar_modelo_voz(features_csv="voice_features.csv", output_model="voz_modelo_rf.pkl"):
    """
    Entrena un modelo predictivo a partir del dataset procesado, manejando 
    el desbalance de clases usando la técnica SMOTE.
    """
    print(f"Cargando características de {features_csv}...")
    if not os.path.exists(features_csv):
        print(f"Error: No se encuentra el archivo {features_csv}. Primero debes correr extract_voice_features.py")
        return
        
    df = pd.read_csv(features_csv)
    
    # 1. Preparar Variables (X) y Objetivo (y)
    # Eliminamos columnas identificadoras (No son matemáticas)
    X = df.drop(columns=['pac_id', 'target', 'diagnosis_raw'])
    y = df['target'].values
    
    # Estandarizar valores para evitar que variables grandes (como ZCR) dominen a las pequeñas (MFCCs)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print("\n--- ANTES DEL BALANCEO (SMOTE) ---")
    unique, counts = np.unique(y, return_counts=True)
    print(dict(zip(["Control (0)", "Deterioro (1)"], counts)))
    
    # 2. Dividir en Entrenamiento y Prueba (antes del SMOTE para no hacer trampa)
    # Usamos test_size 0.25 y stratify=y para intentar mantener la proporción en el test
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.25, random_state=42, stratify=y)
    
    # 3. Aplicar Balanceo de Clases usando SMOTE SOLO en Entrenamiento
    smote = SMOTE(random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
    
    print("\n--- DESPUÉS DEL BALANCEO (Sólo Training Set) ---")
    unique_res, counts_res = np.unique(y_train_res, return_counts=True)
    print(dict(zip(["Control (0)", "Deterioro (1)"], counts_res)))
    
    # 4. Entrenamiento del Modelo (Random Forest suele ser el mejor para pocos audios/datos asimétricos)
    # Usamos class_weight="balanced" como doble protección contra el sesgo
    modelo = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
    
    print("\nEntrenando Modelo Random Forest Classifier...")
    modelo.fit(X_train_res, y_train_res)
    
    # 5. Evaluación Exhaustiva
    print("\n" + "="*50)
    print("EVALUACIÓN DEL MODELO (Sobre Datos Nuevos / Test Set)")
    print("="*50)
    
    y_pred = modelo.predict(X_test)
    y_pred_proba = modelo.predict_proba(X_test)[:, 1]
    
    print("Reporte de Clasificación:")
    print(classification_report(y_test, y_pred, target_names=["Sano (0)", "Deterioro (1)"]))
    
    print("Matriz de Confusión:")
    print(confusion_matrix(y_test, y_pred))
    
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    print(f"\nROC-AUC Score: {roc_auc:.4f} (1.0 es perfecto, 0.5 es adivinación al azar)")
    
    # 6. Guardar Inteligencia (Modelo + Scaler para usarlo en producción/inferencia)
    print("\nExportando modelo entrenado...")
    pipeline = {
        'scaler': scaler,
        'model': modelo,
        'features_order': list(X.columns)
    }
    joblib.dump(pipeline, output_model)
    print(f"¡Éxito! Cerebro guardado como: {output_model}")
    print("Puedes usar este archivo para predecir audios nuevos llamando `joblib.load()`")
    
if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    FEATURES_CSV = os.path.join(BASE_DIR, "voice_features.csv")
    OUTPUT_MODEL = os.path.join(BASE_DIR, "voz_modelo_rf.pkl")
    
    entrenar_modelo_voz(FEATURES_CSV, OUTPUT_MODEL)
