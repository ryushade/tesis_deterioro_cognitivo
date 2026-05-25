import torch
from flask import Flask, request, jsonify
from transformers import RobertaTokenizer, RobertaForSequenceClassification

app = Flask(__name__)

tokenizer = RobertaTokenizer.from_pretrained('textattack/roberta-base-CoLA')
model = RobertaForSequenceClassification.from_pretrained('textattack/roberta-base-CoLA')


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    sentence = data['sentence']
    inputs = tokenizer(sentence, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_label = predictions.argmax().item()
    return jsonify({'grammatically_correct': bool(predicted_label)})


@app.route('/health', methods=['GET'])
def healthcheck():
    return jsonify({'status': 'healthy'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=61234)
