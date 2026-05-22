import pypdf

pdf_path = r"c:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\IAEAV.pdf"
reader = pypdf.PdfReader(pdf_path)

output_path = r"c:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\scratch\iaeav_pages_13_20.txt"

with open(output_path, "w", encoding="utf-8") as f:
    for page_num in range(12, 20):  # 0-indexed, so pages 13 to 20
        if page_num < len(reader.pages):
            f.write(f"=== PAGE {page_num + 1} ===\n")
            f.write(reader.pages[page_num].extract_text())
            f.write("\n\n")

print(f"Dumped pages 13-20 to {output_path}")
