"""
Herramienta de validación clínica para clasificaciones ROCF
Permite a neuropsicólogos revisar y corregir clasificaciones automáticas
"""

import pandas as pd
import streamlit as st
import cv2
import numpy as np
from PIL import Image
import os

class ROCFClinicalValidator:
    def __init__(self):
        self.class_names = {
            0: "Cognitivamente Sano",
            1: "Deterioro Cognitivo Leve", 
            2: "Deterioro Cognitivo Grave"
        }
        
        self.clinical_criteria = {
            "Estructura Principal": [
                "Rectángulo central presente y bien formado",
                "Diagonal principal visible", 
                "Triángulos laterales presentes",
                "Proporciones generales mantenidas"
            ],
            "Detalles Internos": [
                "Líneas internas del rectángulo",
                "Círculo en esquina superior izquierda",
                "Detalles en triángulos",
                "Elementos decorativos menores"
            ],
            "Organización Espacial": [
                "Ubicación correcta de elementos",
                "Proporción entre partes",
                "Orientación mantenida",
                "Distribución equilibrada"
            ],
            "Calidad Motora": [
                "Firmeza del trazo",
                "Continuidad de líneas",
                "Precisión en uniones",
                "Ausencia de temblor"
            ]
        }
    
    def create_validation_interface(self, automatic_results_path, images_path):
        """Crea interfaz web para validación clínica"""
        
        st.title("🧠 Validador Clínico ROCF")
        st.write("Sistema de validación para clasificaciones automáticas")
        
        # Cargar resultados automáticos
        if os.path.exists(automatic_results_path):
            auto_results = pd.read_csv(automatic_results_path)
            
            st.sidebar.header("📊 Estadísticas")
            st.sidebar.write(f"Total de casos: {len(auto_results)}")
            
            # Mostrar distribución automática
            auto_dist = auto_results['classification'].value_counts().sort_index()
            for class_id, count in auto_dist.items():
                st.sidebar.write(f"{self.class_names[class_id]}: {count}")
            
            # Selector de caso
            selected_idx = st.selectbox(
                "Seleccionar caso para revisar:",
                range(len(auto_results)),
                format_func=lambda x: f"Caso {x+1}: {auto_results.iloc[x]['filename']}"
            )
            
            case = auto_results.iloc[selected_idx]
            
            # Mostrar imagen
            img_path = os.path.join(images_path, case['filename'])
            if os.path.exists(img_path):
                image = Image.open(img_path)
                st.image(image, caption=f"Caso: {case['filename']}", width=400)
            
            # Mostrar clasificación automática
            st.subheader("🤖 Clasificación Automática")
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("Clasificación", self.class_names[case['classification']])
                st.metric("Puntuación Total", f"{case['total_score']}/30")
                
            with col2:
                st.metric("Confianza", f"{case['confidence']:.2f}")
                
                # Mostrar desglose de puntuaciones
                st.write("**Desglose:**")
                st.write(f"• Estructura: {case['structural_score']}/6")
                st.write(f"• Detalles: {case['detail_score']}/18") 
                st.write(f"• Organización: {case['spatial_score']}/4")
                st.write(f"• Calidad: {case['line_score']}/2")
            
            # Validación clínica
            st.subheader("👨‍⚕️ Validación Clínica")
            
            # Checklist clínico
            clinical_scores = {}
            for criteria_group, items in self.clinical_criteria.items():
                st.write(f"**{criteria_group}:**")
                clinical_scores[criteria_group] = {}
                
                for item in items:
                    clinical_scores[criteria_group][item] = st.checkbox(
                        item, 
                        key=f"{selected_idx}_{criteria_group}_{item}"
                    )
            
            # Clasificación clínica final
            clinical_classification = st.selectbox(
                "Clasificación Clínica Final:",
                [0, 1, 2],
                format_func=lambda x: self.class_names[x],
                index=case['classification']
            )
            
            # Comentarios del clínico
            clinical_notes = st.text_area(
                "Observaciones Clínicas:",
                placeholder="Comentarios adicionales del neuropsicólogo..."
            )
            
            # Guardar validación
            if st.button("💾 Guardar Validación"):
                self.save_clinical_validation(
                    case['filename'],
                    case['classification'],
                    clinical_classification,
                    clinical_scores,
                    clinical_notes
                )
                st.success("✅ Validación guardada exitosamente")
    
    def save_clinical_validation(self, filename, auto_class, clinical_class, scores, notes):
        """Guarda la validación clínica"""
        
        validation_data = {
            'filename': filename,
            'automatic_classification': auto_class,
            'clinical_classification': clinical_class,
            'agreement': auto_class == clinical_class,
            'clinical_scores': scores,
            'notes': notes,
            'timestamp': pd.Timestamp.now()
        }
        
        # Guardar en archivo de validaciones
        validation_file = 'rocf_clinical_validations.csv'
        
        if os.path.exists(validation_file):
            validations = pd.read_csv(validation_file)
            # Actualizar si ya existe o agregar nuevo
            mask = validations['filename'] == filename
            if mask.any():
                for key, value in validation_data.items():
                    if key != 'filename':
                        validations.loc[mask, key] = str(value)
            else:
                validations = pd.concat([validations, pd.DataFrame([validation_data])], ignore_index=True)
        else:
            validations = pd.DataFrame([validation_data])
        
        validations.to_csv(validation_file, index=False)
    
    def generate_validation_report(self):
        """Genera reporte de validación clínica"""
        
        validation_file = 'rocf_clinical_validations.csv'
        
        if not os.path.exists(validation_file):
            print("❌ No hay validaciones clínicas disponibles")
            return
        
        validations = pd.read_csv(validation_file)
        
        print("📋 REPORTE DE VALIDACIÓN CLÍNICA")
        print("=" * 50)
        print(f"Total de casos validados: {len(validations)}")
        
        # Acuerdo entre automático y clínico
        agreement_rate = validations['agreement'].mean()
        print(f"Tasa de acuerdo: {agreement_rate:.2%}")
        
        # Matriz de confusión
        print("\n📊 Matriz de Confusión:")
        confusion = pd.crosstab(
            validations['automatic_classification'], 
            validations['clinical_classification'],
            margins=True
        )
        print(confusion)
        
        # Casos con mayor discrepancia
        disagreements = validations[~validations['agreement']]
        if len(disagreements) > 0:
            print(f"\n⚠️  Casos con discrepancias ({len(disagreements)}):")
            for _, case in disagreements.iterrows():
                auto_name = self.class_names[int(case['automatic_classification'])]
                clinical_name = self.class_names[int(case['clinical_classification'])]
                print(f"  {case['filename']}: {auto_name} → {clinical_name}")

def create_clinical_interface():
    """Crea la interfaz para neuropsicólogos"""
    
    validator = ROCFClinicalValidator()
    
    # Configurar Streamlit
    st.set_page_config(
        page_title="Validador ROCF",
        page_icon="🧠",
        layout="wide"
    )
    
    # Paths
    automatic_results = "rocf_automatic_classification.csv"
    images_path = "rocfd528_binary_images"
    
    if not os.path.exists(automatic_results):
        st.error("❌ Primero ejecuta el análisis automático")
        st.code("python rocf_automatic_scorer.py")
        return
    
    validator.create_validation_interface(automatic_results, images_path)

if __name__ == "__main__":
    # Para ejecutar la interfaz: streamlit run rocf_clinical_validator.py
    create_clinical_interface()
