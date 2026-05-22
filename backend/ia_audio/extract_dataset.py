import os
import struct
import zlib
import sys

# Define target paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "datasets", "dataset_IAEAV")

class SplitZipExtractor:
    def __init__(self, base_name, parts_count):
        self.parts = []
        for i in range(1, parts_count):
            self.parts.append(os.path.join(DATASET_DIR, f"{base_name}.z{i:02d}"))
        self.parts.append(os.path.join(DATASET_DIR, f"{base_name}.zip"))
        
        self.file_handles = []
        self.file_sizes = []
        self.total_size = 0
        
        for p in self.parts:
            if os.path.exists(p):
                size = os.path.getsize(p)
                self.file_sizes.append(size)
                self.total_size += size
                self.file_handles.append(open(p, 'rb'))
            else:
                self.close()
                raise FileNotFoundError(f"Part not found: {p}")
        
        self.current_offset = 0

    def seek(self, offset):
        self.current_offset = offset

    def read(self, size):
        if self.current_offset >= self.total_size:
            return b""
        
        # Find which file contains the offset
        remaining = offset = self.current_offset
        file_idx = 0
        while file_idx < len(self.file_sizes) and offset >= self.file_sizes[file_idx]:
            offset -= self.file_sizes[file_idx]
            file_idx += 1
            
        if file_idx >= len(self.file_sizes):
            return b""
            
        data = b""
        while len(data) < size and file_idx < len(self.file_sizes):
            h = self.file_handles[file_idx]
            h.seek(offset)
            to_read = min(size - len(data), self.file_sizes[file_idx] - offset)
            chunk = h.read(to_read)
            data += chunk
            self.current_offset += len(chunk)
            offset = 0
            file_idx += 1
            
        return data

    def close(self):
        for h in self.file_handles:
            h.close()

def extract_split_zip(base_name, parts_count, output_folder_name):
    output_dir = os.path.join(DATASET_DIR, output_folder_name)
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n--- Extrayendo {base_name} ({parts_count} partes) hacia {output_dir} ---")
    reader = SplitZipExtractor(base_name, parts_count)
    
    # Check for split zip signature PK\x07\x08
    reader.seek(0)
    sig = reader.read(4)
    if sig == b'PK\x07\x08':
        print("Firma de split zip detectada en el inicio.")
    else:
        # Reset back to 0
        reader.seek(0)
        
    extracted_count = 0
    
    while True:
        pos = reader.current_offset
        sig = reader.read(4)
        if not sig:
            break
            
        if sig != b'PK\x03\x04':
            # Could be Central Directory or end of headers
            print(f"Llegó al final de cabeceras locales o firma desconocida en offset {pos}: {sig}")
            break
            
        # Read the local header fields
        # Local file header has 26 bytes after the signature
        header_data = reader.read(26)
        if len(header_data) < 26:
            print("Cabecera truncada.")
            break
            
        (
            version_needed, flags, compression_method,
            last_mod_time, last_mod_date, crc32,
            compressed_size, uncompressed_size,
            filename_len, extra_len
        ) = struct.unpack('<HHHHHIIIHH', header_data)
        
        filename = reader.read(filename_len).decode('utf-8', errors='ignore')
        # Skip extra field
        extra = reader.read(extra_len)
        
        # Read compressed data
        compressed_data = reader.read(compressed_size)
        
        # Skip directories
        if filename.endswith('/') or filename.endswith('\\'):
            continue
            
        # Clean filename basename (in case it contains subfolders)
        base_filename = os.path.basename(filename)
        if not base_filename:
            continue
            
        # Decompress
        if compression_method == 8:
            try:
                decompressed = zlib.decompress(compressed_data, -zlib.MAX_WBITS)
            except Exception as e:
                print(f"Error al descomprimir {filename}: {e}")
                continue
        elif compression_method == 0:
            decompressed = compressed_data
        else:
            print(f"Método de compresión {compression_method} no soportado para {filename}")
            continue
            
        # Write output file
        out_path = os.path.join(output_dir, base_filename)
        with open(out_path, 'wb') as out_f:
            out_f.write(decompressed)
            
        extracted_count += 1
        if extracted_count % 10 == 0 or extracted_count < 5:
            print(f"Extraído: {base_filename} ({extracted_count} archivos...)")
            
    reader.close()
    print(f"Finalizado: Se extrajeron {extracted_count} archivos en {output_dir}")
    return extracted_count

def main():
    try:
        # Extract patients
        p_count = extract_split_zip("audio_patients", 4, "audio_patients")
        # Extract controls
        c_count = extract_split_zip("audio_controls", 16, "audio_controls")
        
        print("\n=== Verificación de Extracción ===")
        print(f"Pacientes (esperados 39): {p_count}")
        print(f"Controles (esperados 184): {c_count}")
        
        if p_count == 39 and c_count == 184:
            print("¡Extracción exitosa y verificada!")
        else:
            print("Advertencia: El número de archivos extraídos difiere de los esperados.")
            
    except Exception as e:
        print(f"Error durante la extracción: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
