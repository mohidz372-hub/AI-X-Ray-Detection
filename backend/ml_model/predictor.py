"""
ML Model Service
─────────────────
This is the bridge between your trained Keras model and the FastAPI backend.
Drop your trained model file at: backend/ml_model/xray_model_v3.keras

The predict() function is called by the scans route when a new X-ray is uploaded.
"""

import numpy as np
import os
import cv2
from PIL import Image

MODEL_PATH = os.path.join(os.path.dirname(__file__), "D:\Files\AI X-Ray Detection\xray-detection\ml_models\02_model_training_heatmap.ipynb")
CLASS_NAMES = ["NORMAL", "PNEUMONIA"]
IMG_SIZE    = (224, 224)

# Load model once at startup (lazy loading)
_model = None

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            print(f"⚠️  Model not found at {MODEL_PATH}")
            print("   Place your trained model at backend/ml_model/xray_model_v3.keras")
            return None
        try:
            import tensorflow as tf
            _model = tf.keras.models.load_model(MODEL_PATH, compile=False)
            print("✅ ML Model loaded successfully")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            return None
    return _model


def preprocess_image(image_path: str) -> np.ndarray:
    """Load and preprocess image for model input."""
    img = Image.open(image_path).convert("RGB").resize(IMG_SIZE)
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, axis=0).astype(np.float32)


def generate_gradcam(model, img_array: np.ndarray, pred_index: int,
                     last_conv_layer: str = "conv5_block3_out") -> np.ndarray:
    """Generate Grad-CAM heatmap."""
    try:
        import tensorflow as tf

        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[model.get_layer(last_conv_layer).output, model.output]
        )
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            class_channel = predictions[:, pred_index]

        grads       = tape.gradient(class_channel, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap     = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap     = tf.squeeze(heatmap)
        heatmap     = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        return heatmap.numpy()
    except Exception as e:
        print(f"Grad-CAM error: {e}")
        return None


def save_heatmap_overlay(image_path: str, heatmap: np.ndarray,
                         output_path: str, alpha: float = 0.5) -> str:
    """Blend heatmap over original X-ray and save."""
    original = cv2.imread(image_path)
    original = cv2.resize(original, IMG_SIZE)

    heatmap_resized = cv2.resize(heatmap, IMG_SIZE)
    heatmap_colored = cv2.applyColorMap(
        np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET
    )

    overlay = cv2.addWeighted(original, 1 - alpha, heatmap_colored, alpha, 0)
    cv2.imwrite(output_path, overlay)
    return output_path


def predict(image_path: str, save_heatmap_to: str = None) -> dict:
    """
    Run prediction on an X-ray image.

    Returns:
        {
            "prediction":     "PNEUMONIA",
            "confidence":     0.94,
            "probabilities":  {"NORMAL": 0.06, "PNEUMONIA": 0.94},
            "heatmap_path":   "uploads/heatmaps/scan_001_heatmap.jpg"  # or None
        }
    """
    model = get_model()

    # ── Fallback: model not loaded yet ──
    # Returns realistic mock data so the UI works without the model
    if model is None:
        import random
        p_pneumonia = round(random.uniform(0.70, 0.97), 2)
        p_normal    = round(1 - p_pneumonia, 2)
        prediction  = "PNEUMONIA" if p_pneumonia > 0.5 else "NORMAL"
        return {
            "prediction":    prediction,
            "confidence":    p_pneumonia if prediction == "PNEUMONIA" else p_normal,
            "probabilities": {"NORMAL": p_normal, "PNEUMONIA": p_pneumonia},
            "heatmap_path":  None,
            "mock":          True   # flag so frontend knows model isn't loaded
        }

    try:
        img_array  = preprocess_image(image_path)
        preds      = model.predict(img_array, verbose=0)[0]
        pred_idx   = int(np.argmax(preds))
        prediction = CLASS_NAMES[pred_idx]
        confidence = float(preds[pred_idx])

        probs = {cls: float(p) for cls, p in zip(CLASS_NAMES, preds)}

        # Generate and save Grad-CAM heatmap
        heatmap_path = None
        if save_heatmap_to:
            heatmap = generate_gradcam(model, img_array, pred_idx)
            if heatmap is not None:
                os.makedirs(os.path.dirname(save_heatmap_to), exist_ok=True)
                save_heatmap_overlay(image_path, heatmap, save_heatmap_to)
                heatmap_path = save_heatmap_to

        return {
            "prediction":    prediction,
            "confidence":    confidence,
            "probabilities": probs,
            "heatmap_path":  heatmap_path,
            "mock":          False
        }

    except Exception as e:
        raise RuntimeError(f"Prediction failed: {e}")
