import os
import csv
import torch
import numpy as np
import librosa
from tqdm import tqdm
from transformers import AutoTokenizer, AutoModel
import time

# Import our custom speech recognizer
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from recognize import SpeechRecognizer
from core import normalize_transcription
from helpers import get_device

class FeatureExtractor:
    def __init__(self, asr_model_name="jonatasgrosman/wav2vec2-large-xlsr-53-spanish", 
                 bert_model_name="dccuchile/bert-base-spanish-wwm-uncased"):
        self.device = get_device()
        print(f"FeatureExtractor initializing models on {self.device}...")
        
        # Initialize Wav2Vec2 ASR
        self.asr_recognizer = SpeechRecognizer(model_name=asr_model_name, device=self.device)
        
        # Initialize BETO
        self.bert_tokenizer = AutoTokenizer.from_pretrained(bert_model_name)
        self.bert_model = AutoModel.from_pretrained(bert_model_name).to(self.device)
        self.bert_model.eval()
        
    def extract_text_embedding(self, text):
        if not text.strip():
            return np.zeros(768, dtype=np.float32)
            
        inputs = self.bert_tokenizer(
            text, 
            return_tensors="pt", 
            padding=True, 
            truncation=True, 
            max_length=512
        ).to(self.device)
        
        with torch.no_grad():
            outputs = self.bert_model(**inputs)
            cls_emb = outputs.last_hidden_state[:, 0, :].cpu().numpy()[0]
            
        return cls_emb

    def extract_pac_segments(self, wav_path, lbl_path, target_sr=16000):
        y, sr = librosa.load(wav_path, sr=target_sr)
        
        if not os.path.exists(lbl_path):
            return y
            
        pac_segments = []
        try:
            with open(lbl_path, 'r', encoding='utf-8') as f:
                for line in f:
                    parts = line.strip().split('\t')
                    if len(parts) >= 3:
                        start_time = float(parts[0])
                        end_time = float(parts[1])
                        label = parts[2].strip()
                        
                        if label.upper() == 'PAC':
                            start_sample = int(start_time * target_sr)
                            end_sample = int(end_time * target_sr)
                            segment = y[start_sample:end_sample]
                            if len(segment) > 0:
                                pac_segments.append(segment)
        except Exception as e:
            print(f"Error parsing label file {lbl_path}: {e}")
            return y
            
        if pac_segments:
            return np.concatenate(pac_segments)
        else:
            return y

def main():
    dataset_path = r"c:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\ia_audio\datasets\dataset_IAEAV"
    output_path = r"c:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\ia_multimodal\processed_features"
    
    os.makedirs(output_path, exist_ok=True)
    metadata_path = os.path.join(dataset_path, "metadata.csv")
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Metadata file not found: {metadata_path}")
        
    patients = []
    controls = []
    
    with open(metadata_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        header = next(reader)
        id_idx = header.index("Participant ID")
        group_idx = header.index("Group")
        
        for row in reader:
            if not row or len(row) <= max(id_idx, group_idx):
                continue
            p_id = row[id_idx].strip()
            group = row[group_idx].strip()
            
            if group.lower() == 'patient':
                label = 1
                wav_sub = "audio_patients"
                lbl_sub = "labels_patients"
                sub_list = patients
            elif group.lower() == 'control':
                label = 0
                wav_sub = "audio_controls"
                lbl_sub = "labels_controls"
                sub_list = controls
            else:
                continue
                
            wav_path = os.path.join(dataset_path, wav_sub, f"{p_id}.wav")
            lbl_path = os.path.join(dataset_path, lbl_sub, f"{p_id}.txt")
            
            if os.path.exists(wav_path):
                sub_list.append({
                    'id': p_id,
                    'label': label,
                    'wav_path': wav_path,
                    'lbl_path': lbl_path
                })
                
    print(f"Found {len(patients)} patients and {len(controls)} controls.")
    
    np.random.seed(42)
    selected_controls = np.random.choice(controls, len(patients), replace=False).tolist()
    
    patients_subset = patients[:8]
    controls_subset = selected_controls[:8]
    
    records_to_process = []
    for p, c in zip(patients_subset, controls_subset):
        records_to_process.append(p)
        records_to_process.append(c)
        
    print(f"Selected interleaved subset for training: {len(records_to_process)} records (8 patients, 8 controls).")
    
    extractor = FeatureExtractor()
    
    for rec in tqdm(records_to_process, desc="Extracting Multimodal Features"):
        out_file = os.path.join(output_path, f"{rec['id']}.npz")
        if os.path.exists(out_file):
            print(f"Skipping {rec['id']} (already exists)")
            continue
            
        start_time = time.time()
        print(f"Processing {rec['id']}...")
        
        pac_audio = extractor.extract_pac_segments(rec['wav_path'], rec['lbl_path'])
        transcription, acoustic_emb = extractor.asr_recognizer.transcribe_and_embed(pac_audio)
        clean_trans = normalize_transcription(transcription)
        text_emb = extractor.extract_text_embedding(clean_trans)
        
        np.savez(
            out_file,
            id=rec['id'],
            label=rec['label'],
            transcription=transcription,
            clean_transcription=clean_trans,
            acoustic_emb=acoustic_emb,
            text_emb=text_emb
        )
        print(f"Saved {rec['id']} features (elapsed: {time.time() - start_time:.1f}s)")
        
    print("Sequential extraction complete.")

if __name__ == "__main__":
    main()
