from flask import Flask, request, jsonify
from llama_cpp import Llama

# Initialize Flask app
app = Flask(__name__)

# Load the Llama model (specify the path to your model file)
model_path = "/Users/tenman/llama-gpt/models/llama-2-7b-chat.bin"
model = Llama(model_path=model_path)


@app.route('/generate', methods=['POST'])
def generate():
    try:
        # Extract data from POST request
        data = request.json
        prompt = data['prompt']
        max_tokens = data.get('max_tokens', 100)  # Default to 100 if not specified

        # Generate response using Llama model
        response = model(prompt, max_tokens=max_tokens, echo=True)

        # Return the response
        return jsonify({'response': response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def healthcheck():
    app.logger.info("Health check requested.")
    return jsonify({'status': 'healthy'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=61239)
