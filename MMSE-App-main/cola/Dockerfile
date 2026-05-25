# Use an official PyTorch runtime as a parent image
FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install any needed packages specified in requirements.txt
# Assuming Flask and transformers are in the requirements.txt file
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the models and tokenizer to ensure they are cached in the image
RUN python -c "from transformers import RobertaTokenizer, RobertaForSequenceClassification; RobertaTokenizer.from_pretrained('textattack/roberta-base-CoLA'); RobertaForSequenceClassification.from_pretrained('textattack/roberta-base-CoLA')"

RUN apt-get update && apt-get install -y curl

# Make port 61234 available to the world outside this container
EXPOSE 61234

# Run app.py when the container launches
CMD ["python", "app.py"]
