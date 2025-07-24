import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import pickle

# === Step 1: Load trained model and tokenizer from local folder ===
model_path = "./my_model"

model = DistilBertForSequenceClassification.from_pretrained(model_path)
tokenizer = DistilBertTokenizerFast.from_pretrained(model_path)

# === Step 2: Load label encoder ===
with open("label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)

# === Step 3: Prediction function ===
def predict_category(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class_id = logits.argmax().item()
        predicted_label = label_encoder.inverse_transform([predicted_class_id])[0]
        return predicted_label

# === Step 4: Test examples ===
sample_sentences = [
    "I bought a pizza for 500 rupees",
    "cleared my late payment fee of 1000 rupees",
]

for sentence in sample_sentences:
    category = predict_category(sentence)
    print(f"📌 Sentence: {sentence}")
    print(f"➡️ Predicted Category: {category}\n")

