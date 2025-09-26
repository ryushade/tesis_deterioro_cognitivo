"""
Script para generar etiquetas de ejemplo para prueba del modelo ROCF
NOTA: Estas son etiquetas SIMULADAS para prueba del sistema, no diagnósticos reales
"""

import pandas as pd
import numpy as np
from pathlib import Path

def generate_sample_labels():
    """
    Genera etiquetas de ejemplo para probar el sistema
    IMPORTANTE: No son diagnósticos reales, solo para prueba del modelo
    """
    
    # Leer plantilla limpia
    df = pd.read_csv('rocf_labeling_template_clean.csv')
    
    print("⚠️  IMPORTANTE: Generando etiquetas SIMULADAS para prueba del sistema")
    print("   Estas NO son diagnósticos clínicos reales")
    print("   Solo para validar el funcionamiento del modelo")
    
    # Configurar distribución realista
    # Típicamente: ~60% sanos, ~25% deterioro leve, ~15% deterioro grave
    np.random.seed(42)  # Para reproducibilidad
    
    total_participants = len(df)
    
    # Distribución simulada
    n_healthy = int(total_participants * 0.60)  # 60% sanos
    n_mild = int(total_participants * 0.25)     # 25% deterioro leve  
    n_severe = total_participants - n_healthy - n_mild  # 15% deterioro grave
    
    # Crear lista de etiquetas
    labels = ([0] * n_healthy + 
              [1] * n_mild + 
              [2] * n_severe)
    
    # Mezclar aleatoriamente
    np.random.shuffle(labels)
    
    # Asignar etiquetas
    df['cognitive_status'] = labels
    
    # Agregar notas explicativas
    label_descriptions = {
        0: "Simulado: Cognitivamente sano",
        1: "Simulado: Deterioro cognitivo leve", 
        2: "Simulado: Deterioro cognitivo grave"
    }
    
    df['notes'] = df['cognitive_status'].map(label_descriptions)
    
    # Agregar información demográfica simulada
    ages = np.random.choice(['18-35', '36-50', '51-65', '66-80', '80+'], 
                           size=total_participants, 
                           p=[0.15, 0.20, 0.25, 0.30, 0.10])
    
    genders = np.random.choice(['M', 'F'], size=total_participants, p=[0.45, 0.55])
    
    education = np.random.choice(['Primaria', 'Secundaria', 'Técnica', 'Universitaria'], 
                                size=total_participants,
                                p=[0.20, 0.35, 0.25, 0.20])
    
    df['age_group'] = ages
    df['gender'] = genders  
    df['education_level'] = education
    
    # Guardar archivo con etiquetas simuladas
    output_file = 'rocf_labels_simulated.csv'
    df.to_csv(output_file, index=False)
    
    # Mostrar estadísticas
    print(f"\n📊 ETIQUETAS SIMULADAS GENERADAS:")
    print(f"   • Total participantes: {total_participants}")
    print(f"   • Cognitivamente sanos (0): {n_healthy} ({n_healthy/total_participants*100:.1f}%)")
    print(f"   • Deterioro leve (1): {n_mild} ({n_mild/total_participants*100:.1f}%)")
    print(f"   • Deterioro grave (2): {n_severe} ({n_severe/total_participants*100:.1f}%)")
    
    print(f"\n📁 Archivo guardado: {output_file}")
    print(f"🔧 Ahora puedes ejecutar: python train_rocf_pipeline.py")
    
    # Crear archivo de estadísticas
    stats_content = f"""
# ESTADÍSTICAS DEL DATASET ROCF SIMULADO

## Distribución de Clases:
- Cognitivamente Sanos: {n_healthy} participantes ({n_healthy/total_participants*100:.1f}%)
- Deterioro Cognitivo Leve: {n_mild} participantes ({n_mild/total_participants*100:.1f}%)
- Deterioro Cognitivo Grave: {n_severe} participantes ({n_severe/total_participants*100:.1f}%)

## Distribución por Edad:
- 18-35 años: {sum(ages == '18-35')} participantes
- 36-50 años: {sum(ages == '36-50')} participantes  
- 51-65 años: {sum(ages == '51-65')} participantes
- 66-80 años: {sum(ages == '66-80')} participantes
- 80+ años: {sum(ages == '80+')} participantes

## Distribución por Género:
- Masculino: {sum(genders == 'M')} participantes
- Femenino: {sum(genders == 'F')} participantes

## Distribución por Educación:
- Primaria: {sum(education == 'Primaria')} participantes
- Secundaria: {sum(education == 'Secundaria')} participantes
- Técnica: {sum(education == 'Técnica')} participantes
- Universitaria: {sum(education == 'Universitaria')} participantes

⚠️ IMPORTANTE: Estas son etiquetas SIMULADAS para prueba del sistema.
Para uso clínico real, se requiere evaluación neuropsicológica profesional.
"""
    
    with open('rocf_simulated_stats.md', 'w', encoding='utf-8') as f:
        f.write(stats_content)
    
    return df

def create_real_labeling_instructions():
    """Crea instrucciones para etiquetado real"""
    
    instructions = """
# INSTRUCCIONES PARA ETIQUETADO CLÍNICO REAL

## 🏥 PARA USO CLÍNICO REAL:

1. **EVALUACIÓN PROFESIONAL REQUERIDA**
   - Neuropsicólogo clínico
   - Neurólogo especialista
   - Evaluación cognitiva completa

2. **CRITERIOS DIAGNÓSTICOS**
   - Usar escalas validadas (MMSE, MoCA, etc.)
   - Correlacionar con evaluación neuropsicológica
   - Considerar historial clínico completo

3. **PROCESO DE ETIQUETADO**
   - Revisar expediente clínico completo
   - Evaluar todas las pruebas cognitivas
   - Consenso entre evaluadores
   - Documentar criterios de decisión

4. **VALIDACIÓN**
   - Segunda opinión profesional
   - Seguimiento longitudinal
   - Correlación con neuroimagen si disponible

## 📝 ARCHIVO PARA ETIQUETADO REAL:
Usar: rocf_labeling_template_clean.csv

## 🧪 PARA PRUEBAS DEL SISTEMA:
Usar: rocf_labels_simulated.csv (generado automáticamente)
"""
    
    with open('REAL_LABELING_INSTRUCTIONS.md', 'w', encoding='utf-8') as f:
        f.write(instructions)
    
    print("📋 Instrucciones para etiquetado real creadas: REAL_LABELING_INSTRUCTIONS.md")

if __name__ == "__main__":
    print("🎲 Generando etiquetas simuladas para prueba del sistema...")
    
    # Generar etiquetas simuladas
    df = generate_sample_labels()
    
    # Crear instrucciones para uso real
    create_real_labeling_instructions()
    
    print(f"\n✅ SISTEMA LISTO PARA PRUEBA")
    print(f"📊 Dataset: 523 imágenes de 240 participantes")
    print(f"🏷️ Etiquetas: Distribuidas realísticamente")
    print(f"🚀 Siguiente: python train_rocf_pipeline.py")
