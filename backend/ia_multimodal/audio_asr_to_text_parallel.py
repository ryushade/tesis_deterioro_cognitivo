import os
import csv
import torch
import numpy as np
import librosa
from tqdm import tqdm
from transformers import AutoTokenizer, AutoModel
import multiprocessing as mp
import time

# Import custom modules
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from recognize import SpeechRecognizer
from core import normalize_transcription
from helpers import get_device

# Global variable to hold the extractor per process
_extractor = None

class ProcessFeatureExtractor:
    def __init__(self, asr_model_name="jonatasgrosman/wav2vec2-large-xlsr-53-spanish", 
                 bert_model_name="dccuchile/bert-base-spanish-wwm-uncased"):
        # Force CPU usage to avoid lockups/OOM and since CUDA was False
        self.device = "cpu"
        torch.set_num_threads(2)
        print(f"Process worker initializing models on CPU (threads=2)...")
        
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

def init_worker():
    global _extractor
    if _extractor is None:
        _extractor = ProcessFeatureExtractor()

def worker_process_record(rec_data):
    try:
        global _extractor
        rec, output_dir = rec_data
        out_file = os.path.join(output_dir, f"{rec['id']}.npz")
        
        if os.path.exists(out_file):
            return rec['id'], True, "Already exists"
            
        start_time = time.time()
        
        # 1. Extract PAC signal
        pac_audio = _extractor.extract_pac_segments(rec['wav_path'], rec['lbl_path'])
        
        # 2. Wav2Vec2 ASR and acoustic embeddings
        transcription, acoustic_emb = _extractor.asr_recognizer.transcribe_and_embed(pac_audio)
        
        # 3. Clean transcription
        clean_trans = normalize_transcription(transcription)
        
        # 4. BETO text embeddings
        text_emb = _extractor.extract_text_embedding(clean_trans)
        
        # 5. Save all features
        np.savez(
            out_file,
            id=rec['id'],
            label=rec['label'],
            transcription=transcription,
            clean_transcription=clean_trans,
            acoustic_emb=acoustic_emb,
            text_emb=text_emb
        )
        
        elapsed = time.time() - start_time
        return rec['id'], True, f"Success ({elapsed:.1f}s)"
        
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        return rec_data[0]['id'], False, f"Failed: {str(e)}\n{err_msg}"

def main():
    dataset_path = r"c:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\ia_audio\datasets\dataset_IAEAV"
    output_path = r"c:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\ia_multimodal\processed_features"
    
    os.makedirs(output_path, exist_ok=True)
    metadata_path = os.path.join(dataset_path, "metadata.csv")
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Metadata file not found: {metadata_path}")
        
    # Parse metadata
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
    
    # Select a balanced subset of controls
    np.random.seed(42)
    selected_controls = np.random.choice(controls, len(patients), replace=False).tolist()
    
    # Select a small subset of 8 patients and 8 controls for fast verification/training
    patients_subset = patients[:8]
    controls_subset = selected_controls[:8]
    
    # Interleave to process patients and controls in parallel
    records_to_process = []
    for p, c in zip(patients_subset, controls_subset):
        records_to_process.append(p)
        records_to_process.append(c)
        
    print(f"Selected interleaved subset for training: {len(records_to_process)} records (8 patients, 8 controls).")
    
    # Prepare multiprocessing arguments
    pool_inputs = [(rec, output_path) for rec in records_to_process]
    
    # Use 3 workers to keep CPU usable and avoid high context switching overhead
    num_workers = 3
    print(f"Starting parallel processing with {num_workers} workers...")
    
    start_all = time.time()
    
    # Initialize process pool
    with mp.Pool(processes=num_workers, initializer=init_worker) as pool:
        results = []
        for res in tqdm(pool.imap_unordered(worker_process_record, pool_inputs), 
                        total=len(pool_inputs), desc="Processing in Parallel"):
            results.append(res)
            # Print immediate updates for completed files
            print(f"Finished {res[0]}: {res[2]}")
            
    success_count = sum(1 for r in results if r[1])
    print(f"\nCompleted {success_count}/{len(pool_inputs)} successfully.")
    print(f"Total time elapsed: {time.time() - start_all:.2f} seconds.")

if __name__ == "__main__":
    # Windows compatibility for multiprocessing
    mp.freeze_support()
    main()
