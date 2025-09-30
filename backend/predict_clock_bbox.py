import os
import sys
from pathlib import Path
import tensorflow as tf
from app.services.clock_detector import ClockDetector, ClockDetectorConfig, iou_metric, _huber_loss

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python backend/predict_clock_bbox.py <image_path>')
        sys.exit(1)

    image_path = sys.argv[1]
    backend_dir = Path(__file__).resolve().parent
    model_path = backend_dir / 'models' / 'cdt_clock_detector.keras'

    det = ClockDetector(ClockDetectorConfig())
    det.model = tf.keras.models.load_model(str(model_path), custom_objects={'iou_metric': iou_metric, '_huber_loss': _huber_loss})

    res = det.predict_image(image_path)
    print(res)
