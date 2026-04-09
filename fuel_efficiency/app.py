import os
from typing import Any

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS


MODEL_PATH = os.environ.get('MODEL_PATH', 'model (1).pkl')
FEATURE_NAMES = [
    'cylinders',
    'displacement',
    'horsepower',
    'weight',
    'acceleration',
    'model_year',
    'origin',
]

app = Flask(__name__)
CORS(app)

model = joblib.load(MODEL_PATH)


def _to_float_list(values: list[Any]) -> list[float]:
    return [float(value) for value in values]


def _extract_features(payload: dict[str, Any]) -> list[float]:
    if all(key in payload for key in FEATURE_NAMES):
        return _to_float_list([payload[name] for name in FEATURE_NAMES])

    if 'features' in payload:
        features = payload['features']
        if isinstance(features, dict) and all(key in features for key in FEATURE_NAMES):
            return _to_float_list([features[name] for name in FEATURE_NAMES])
        if isinstance(features, list):
            if len(features) == 1 and isinstance(features[0], list):
                return _to_float_list(features[0])
            return _to_float_list(features)

    if 'input' in payload and isinstance(payload['input'], list):
        values = payload['input']
        if len(values) == 1 and isinstance(values[0], list):
            return _to_float_list(values[0])
        return _to_float_list(values)

    raise ValueError('No supported feature format found in payload.')


@app.get('/health')
def health() -> Any:
    return jsonify({'status': 'ok'})


@app.post('/predict')
def predict() -> Any:
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({'error': 'Expected JSON object body.'}), 400

    try:
        features = _extract_features(data)
        if len(features) != 7:
            return jsonify({'error': 'Expected exactly 7 feature values.'}), 400

        prediction = model.predict(np.array(features, dtype=float).reshape(1, -1))
        mpg = float(np.asarray(prediction).ravel()[0])
        return jsonify({'prediction': mpg})
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    app.run(host='127.0.0.1', port=port, debug=True)
