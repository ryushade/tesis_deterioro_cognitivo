#!/usr/bin/env python3
"""
Script para probar la API del sistema CDT
"""

import requests
import os
import json
from pathlib import Path

BASE_URL = "http://localhost:5000/api/cdt"

def test_info_endpoint():
    """Probar el endpoint de información"""
    print("🔍 Probando endpoint /info...")
    try:
        response = requests.get(f"{BASE_URL}/info")
        if response.status_code == 200:
            data = response.json()
            print("✅ Información del sistema:")
            print(f"   Version: {data.get('version', 'N/A')}")
            print(f"   Sistema: {data.get('sistema', 'N/A')}")
            print(f"   Clases disponibles: {len(data.get('clases_disponibles', []))}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_analyze_endpoint():
    """Probar el análisis de una imagen"""
    print("\n🔍 Probando endpoint /analyze...")
    
    # Buscar una imagen de prueba
    test_image_path = None
    dataset_path = Path("./dataset/test")
    
    if dataset_path.exists():
        for img_file in dataset_path.glob("*.jpg"):
            test_image_path = img_file
            break
    
    if not test_image_path or not test_image_path.exists():
        print("❌ No se encontró imagen de prueba")
        return False
        
    print(f"📷 Analizando: {test_image_path.name}")
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'file': f}
            data = {'paciente_id': 'test-patient-123'}
            
            response = requests.post(f"{BASE_URL}/analyze", files=files, data=data)
            
        if response.status_code == 200:
            result = response.json()
            print("✅ Análisis completado:")
            print(f"   Puntuación: {result.get('puntuacion_total', 'N/A')}/10")
            print(f"   Clasificación: {result.get('clasificacion', 'N/A')}")
            print(f"   Confianza: {result.get('confianza', 'N/A')}%")
            print(f"   Tiempo: {result.get('tiempo_procesamiento', 'N/A')}s")
            
            criterios = result.get('criterios_evaluados', {})
            if criterios:
                print("   📊 Criterios:")
                for criterio, valor in criterios.items():
                    print(f"      {criterio}: {valor}")
            
            return True
        else:
            print(f"❌ Error en análisis: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error durante análisis: {e}")
        return False

def test_model_status():
    """Probar el estado del modelo"""
    print("\n🔍 Probando endpoint /model/status...")
    try:
        response = requests.get(f"{BASE_URL}/model/status")
        if response.status_code == 200:
            data = response.json()
            print("✅ Estado del modelo:")
            print(f"   Cargado: {data.get('modelo_cargado', False)}")
            print(f"   Arquitectura: {data.get('arquitectura', 'N/A')}")
            print(f"   Parámetros: {data.get('parametros_totales', 'N/A')}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🧠 PRUEBAS DE LA API CDT")
    print("=" * 40)
    
    # Ejecutar pruebas
    tests = [
        ("Info del Sistema", test_info_endpoint),
        ("Estado del Modelo", test_model_status),
        ("Análisis de Imagen", test_analyze_endpoint),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 {test_name}")
        result = test_func()
        results.append((test_name, result))
    
    # Resumen
    print("\n" + "=" * 40)
    print("📋 RESUMEN DE PRUEBAS:")
    for test_name, passed in results:
        status = "✅ PASÓ" if passed else "❌ FALLÓ"
        print(f"   {test_name}: {status}")
    
    passed_tests = sum(1 for _, passed in results if passed)
    total_tests = len(results)
    print(f"\nResultado: {passed_tests}/{total_tests} pruebas exitosas")
    
    if passed_tests == total_tests:
        print("🎉 ¡Todas las pruebas pasaron!")
    else:
        print("⚠️  Algunas pruebas fallaron")
