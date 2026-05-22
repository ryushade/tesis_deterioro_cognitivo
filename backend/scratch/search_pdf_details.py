import pypdf

pdf_path = r"c:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\IAEAV.pdf"
reader = pypdf.PdfReader(pdf_path)

keywords = ["concat", "pooling", "pool", "capa", "dim", "embedding", "fusion", "fusión", "aberta", "wert", "transcrip"]

for i, page in enumerate(reader.pages):
    text = page.extract_text()
    for line in text.split("\n"):
        if any(kw in line.lower() for kw in keywords):
            print(f"Page {i+1}: {line.strip()}")
