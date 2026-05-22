import os
import sys

print("Pre-downloading base models from Hugging Face to cache...")

try:
    from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor, AutoTokenizer, AutoModel
    
    # 1. Wav2Vec2 Spanish ASR
    asr_model_name = "jonatasgrosman/wav2vec2-large-xlsr-53-spanish"
    print(f"Downloading ASR Model: {asr_model_name}")
    Wav2Vec2Processor.from_pretrained(asr_model_name)
    Wav2Vec2ForCTC.from_pretrained(asr_model_name)
    
    # 2. BETO Spanish BERT
    bert_model_name = "dccuchile/bert-base-spanish-wwm-uncased"
    print(f"Downloading BERT Model: {bert_model_name}")
    AutoTokenizer.from_pretrained(bert_model_name)
    AutoModel.from_pretrained(bert_model_name)
    
    print("Success: Base models downloaded and cached successfully.")
    sys.exit(0)
    
except Exception as e:
    print(f"Error downloading models: {e}", file=sys.stderr)
    sys.exit(1)
