from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

model = joblib.load("models/phish_model.pkl")
vectorizer_path = os.path.join('data', 'vectorizer.pkl')
vectorizer = joblib.load(vectorizer_path)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'Missing URL'}), 400

    features = vectorizer.transform([url])
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    return jsonify({
        'prediction': int(prediction),
        'probability': float(probability)
    })

if __name__ == '__main__':
    app.run(debug=True)
