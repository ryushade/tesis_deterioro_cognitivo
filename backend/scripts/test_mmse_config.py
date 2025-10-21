#!/usr/bin/env python3
"""
Script para verificar que las rutas de configuración MMSE estén funcionando
"""
import requests
import json
import sys

def test_mmse_config_routes():
    base_url = "http://localhost:5000"  # Ajusta según tu configuración
    
    # Endpoints a probar
    endpoints = [
        "/api/mmse/configuracion/respuestas",
        "/api/mmse/configuracion/contextos", 
        "/api/mmse/configuracion/preguntas"
    ]
    
    print("🔍 Probando endpoints de configuración MMSE...")
    print(f"Base URL: {base_url}")
    print("-" * 50)
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            print(f"Probando: {endpoint}")
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                print(f"✅ {endpoint} - OK")
                try:
                    data = response.json()
                    print(f"   Respuesta: {json.dumps(data, indent=2)[:100]}...")
                except:
                    print(f"   Respuesta (no JSON): {response.text[:100]}...")
            elif response.status_code == 401:
                print(f"🔐 {endpoint} - Requiere autenticación (OK)")
            elif response.status_code == 404:
                print(f"❌ {endpoint} - No encontrado")
            else:
                print(f"⚠️ {endpoint} - Status: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint} - Error de conexión (¿backend ejecutándose?)")
        except requests.exceptions.Timeout:
            print(f"⏰ {endpoint} - Timeout")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")
        
        print()
    
    print("-" * 50)
    print("💡 Consejos:")
    print("1. Asegúrate de que el backend esté ejecutándose")
    print("2. Verifica que la base de datos esté conectada")
    print("3. Ejecuta el script SQL de configuración MMSE")

if __name__ == "__main__":
    test_mmse_config_routes()
