"""
ML API — X-Ray Detection with Grad-CAM Heatmaps
Run: python ml_api.py
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import numpy as np
from PIL import Image
import os, io, base64, traceback

app  = Flask(__name__)
CORS(app)

# ── Update this path to your model location ──
MODEL_PATH  = r'D:\AI X-Ray Detection\Models\EfficientNetB4_finetuned.keras'
CLASS_NAMES = ['normal', 'pneumonia', 'tuberculosis']

model = None

# ─────────────────────────────────────────────
#  Load Model
# ─────────────────────────────────────────────
def load_model():
    global model
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        print(f'✅ Model loaded: {MODEL_PATH}')
        print(f'   Classes     : {CLASS_NAMES}')
        print(f'   Input shape : {model.input_shape}')
    except Exception as e:
        print(f'⚠️  Model not loaded: {e}')
        print('   API will return mock results')

# ─────────────────────────────────────────────
#  Grad-CAM Heatmap
# ─────────────────────────────────────────────
def make_gradcam(img_array, pred_index=None):
    try:
        import tensorflow as tf

        # Find last conv layer
        last_conv = None
        for layer in reversed(model.layers):
            if hasattr(layer, 'filters') or 'conv' in layer.name.lower():
                last_conv = layer.name
                break

        if last_conv is None:
            return None

        grad_model = tf.keras.models.Model(
            inputs  = model.inputs,
            outputs = [model.get_layer(last_conv).output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            if pred_index is None:
                pred_index = tf.argmax(predictions[0])
            class_channel = predictions[:, pred_index]

        grads        = tape.gradient(class_channel, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap      = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap      = tf.squeeze(heatmap)
        heatmap      = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        return heatmap.numpy()
    except Exception as e:
        print(f'Grad-CAM error: {e}')
        return None

def heatmap_to_base64(heatmap, original_img):
    """Convert heatmap to base64 overlay image"""
    import cv2
    try:
        img_arr     = np.array(original_img.resize((224, 224)))
        heatmap_r   = cv2.resize(heatmap, (224, 224))
        heatmap_col = cv2.applyColorMap(np.uint8(255 * heatmap_r), cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap_col, cv2.COLOR_BGR2RGB)
        overlay     = (0.55 * img_arr + 0.45 * heatmap_rgb).astype(np.uint8)
        pil_img     = Image.fromarray(overlay)
        buffer      = io.BytesIO()
        pil_img.save(buffer, format='PNG')
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    except Exception as e:
        print(f'Heatmap overlay error: {e}')
        return None

# ─────────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status'      : 'ok',
        'model_loaded': model is not None,
        'classes'     : CLASS_NAMES
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # ── Get image from request ──
        img = None

        # Option 1: File upload (multipart form)
        if 'file' in request.files:
            file = request.files['file']
            img  = Image.open(file.stream).convert('RGB')

        # Option 2: Image path (JSON)
        elif request.is_json:
            data       = request.json
            image_path = data.get('image_path')
            if image_path and os.path.exists(image_path):
                img = Image.open(image_path).convert('RGB')
            else:
                return jsonify({'error': 'Image not found'}), 400

        else:
            return jsonify({'error': 'No image provided'}), 400

        # ── Mock response if model not loaded ──
        if model is None:
            return jsonify({
                'prediction'  : 'PNEUMONIA',
                'confidence'  : 0.87,
                'probabilities': {
                    'normal'      : 0.05,
                    'pneumonia'   : 0.87,
                    'tuberculosis': 0.08
                },
                'heatmap_base64': None
            })

        # ── Preprocess ──
        img_resized = img.resize((224, 224))
        img_array   = np.expand_dims(np.array(img_resized) / 255.0, axis=0).astype(np.float32)

        # ── Predict ──
        import tensorflow as tf
        preds    = model.predict(img_array, verbose=0)[0]
        pred_idx = int(np.argmax(preds))
        confidence = float(preds[pred_idx])

        probabilities = {cls: round(float(preds[i]), 4)
                         for i, cls in enumerate(CLASS_NAMES)}

        # ── Grad-CAM ──
        heatmap         = make_gradcam(img_array, pred_idx)
        heatmap_base64  = heatmap_to_base64(heatmap, img) if heatmap is not None else None

        return jsonify({
            'prediction'     : CLASS_NAMES[pred_idx].upper(),
            'confidence'     : round(confidence, 4),
            'probabilities'  : probabilities,
            'heatmap_base64' : heatmap_base64,
            'class_names'    : CLASS_NAMES
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    load_model()
    print('🚀 ML API running on http://localhost:8000')
    app.run(host='0.0.0.0', port=8000, debug=False)
