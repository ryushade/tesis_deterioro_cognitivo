import os

file_path = r"C:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\frontend\src\pages\MMSE\ComponentsMMSE\MMSEPacienteEvaluacion.tsx"

keywords = ["audio", "recording", "grab", "repeticion", "base64", "cierre", "cierre los ojos", "abrir", "abra"]

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
        
    for kw in keywords:
        print(f"\n--- Searching for: {kw} ---")
        matches = 0
        for i, line in enumerate(lines):
            if kw.lower() in line.lower():
                print(f"Line {i+1}: {line.strip()}")
                matches += 1
                if matches > 15:
                    print("... too many matches, truncated ...")
                    break
else:
    print("File does not exist")
