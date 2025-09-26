import pandas as pd

# Cargar clasificaciones
df = pd.read_csv('rocf_automatic_classification.csv')

print("📊 ANÁLISIS DE CLASIFICACIONES AUTOMÁTICAS")
print("=" * 50)

print("\n🔍 Distribución de clases:")
class_counts = df['classification'].value_counts().sort_index()
print(class_counts)

print("\n📈 Detalles por clase:")
class_names = {0: 'Sanos', 1: 'Deterioro Leve', 2: 'Deterioro Grave'}
total = len(df)

for cls in [0, 1, 2]:
    count = (df['classification'] == cls).sum()
    percentage = (count / total) * 100
    print(f"Clase {cls} ({class_names[cls]}): {count} imágenes ({percentage:.1f}%)")

print(f"\nTotal de imágenes: {total}")

# Verificar si hay clase 2
if 2 in df['classification'].values:
    print("✅ Se detectaron casos de deterioro grave")
else:
    print("❌ NO se detectaron casos de deterioro grave")
    print("⚠️  Solo hay 2 clases: Sanos y Deterioro Leve")
