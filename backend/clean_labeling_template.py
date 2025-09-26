"""
Script para limpiar y mejorar la plantilla de etiquetado ROCF
"""

import pandas as pd
import ast
import numpy as np

def clean_labeling_template():
    """Limpia la plantilla de etiquetado generada"""
    
    # Leer archivo original
    df = pd.read_csv('rocf_labeling_template.csv')
    
    # Limpiar la columna de evaluaciones
    def clean_evaluations(eval_str):
        if pd.isna(eval_str):
            return []
        try:
            # Convertir string a lista real
            eval_list = ast.literal_eval(eval_str)
            # Extraer valores de numpy int64
            clean_list = []
            for item in eval_list:
                if hasattr(item, 'item'):  # Es numpy int64
                    clean_list.append(int(item.item()))
                else:
                    clean_list.append(int(item))
            return clean_list
        except:
            return []
    
    # Aplicar limpieza
    df['evaluations_clean'] = df['evaluations'].apply(clean_evaluations)
    df['evaluations_count'] = df['evaluations_clean'].apply(len)
    df['evaluations_list'] = df['evaluations_clean'].apply(lambda x: ', '.join(map(str, x)))
    
    # Crear DataFrame limpio
    clean_df = pd.DataFrame({
        'participant_id': df['participant_id'],
        'num_images': df['num_images'], 
        'evaluations': df['evaluations_list'],
        'cognitive_status': '',  # Para llenar manualmente
        'notes': '',
        'age_group': '',  # Opcional: grupo etario
        'gender': '',     # Opcional: género
        'education_level': ''  # Opcional: nivel educativo
    })
    
    # Guardar archivo limpio
    clean_df.to_csv('rocf_labeling_template_clean.csv', index=False)
    
    # Crear archivo de ejemplo con algunas etiquetas de muestra
    example_df = clean_df.copy()
    
    # Agregar algunos ejemplos para mostrar el formato
    example_df.loc[0, 'cognitive_status'] = '0'
    example_df.loc[0, 'notes'] = 'Ejemplo: Cognitivamente sano'
    example_df.loc[1, 'cognitive_status'] = '1'
    example_df.loc[1, 'notes'] = 'Ejemplo: Deterioro cognitivo leve'
    example_df.loc[2, 'cognitive_status'] = '2'
    example_df.loc[2, 'notes'] = 'Ejemplo: Deterioro cognitivo grave'
    
    example_df.to_csv('rocf_labeling_example.csv', index=False)
    
    print("✅ Plantilla limpiada guardada como: rocf_labeling_template_clean.csv")
    print("📄 Archivo de ejemplo creado: rocf_labeling_example.csv")
    print(f"📊 Total de participantes para etiquetar: {len(clean_df)}")
    
    return clean_df

def create_labeling_guide():
    """Crea guía para el etiquetado clínico"""
    
    guide_content = """
# GUÍA PARA ETIQUETADO CLÍNICO - FIGURAS COMPLEJAS DE REY-OSTERRIETH

## 📋 CATEGORÍAS DE CLASIFICACIÓN:

### 0 = COGNITIVAMENTE SANO
- Dibujo completo y bien organizado
- Elementos principales presentes y correctamente ubicados
- Proporciones adecuadas
- Líneas firmes y precisas
- Secuencia lógica de construcción

### 1 = DETERIORO COGNITIVO LEVE  
- Dibujo mayormente completo pero con algunos errores menores
- Elementos principales presentes con pequeñas distorsiones
- Proporciones ligeramente alteradas
- Algunas líneas imprecisas o fragmentadas
- Organización general preservada

### 2 = DETERIORO COGNITIVO GRAVE
- Dibujo incompleto o significativamente distorsionado
- Elementos principales ausentes o incorrectamente ubicados
- Proporciones muy alteradas
- Líneas imprecisas, fragmentadas o temblor evidente
- Desorganización espacial marcada
- Pérdida de la estructura global

## 🔍 CRITERIOS DE EVALUACIÓN:

1. **PRECISIÓN VISUOMOTORA**: Calidad de las líneas y formas
2. **ORGANIZACIÓN ESPACIAL**: Ubicación correcta de elementos
3. **PLANIFICACIÓN**: Secuencia lógica de construcción
4. **MEMORIA VISUAL**: Presencia de elementos principales
5. **FUNCIONES EJECUTIVAS**: Organización general del dibujo

## ⚠️ CONSIDERACIONES IMPORTANTES:

- Evaluar en conjunto todas las evaluaciones de un participante
- Considerar consistencia entre diferentes sesiones
- Tener en cuenta factores como edad y educación
- Consultar con neuropsicólogos para casos dudosos
- Documentar observaciones específicas en la columna 'notes'

## 📝 PROCESO DE ETIQUETADO:

1. Revisar todas las imágenes del participante
2. Evaluar según criterios clínicos establecidos
3. Asignar categoría (0, 1, o 2)
4. Agregar notas explicativas
5. Validar con segundo evaluador en casos dudosos
"""
    
    with open('ROCF_Labeling_Guide.md', 'w', encoding='utf-8') as f:
        f.write(guide_content)
    
    print("📖 Guía de etiquetado creada: ROCF_Labeling_Guide.md")

if __name__ == "__main__":
    print("🔧 Limpiando plantilla de etiquetado...")
    clean_df = clean_labeling_template()
    
    print("\n📖 Creando guía de etiquetado...")
    create_labeling_guide()
    
    print(f"\n🎯 SIGUIENTE PASO:")
    print(f"1. Revisar 'rocf_labeling_example.csv' para ver el formato")
    print(f"2. Completar 'rocf_labeling_template_clean.csv' con las etiquetas")
    print(f"3. Usar 'ROCF_Labeling_Guide.md' como referencia clínica")
    print(f"4. Una vez completado, ejecutar: python train_rocf_pipeline.py")
