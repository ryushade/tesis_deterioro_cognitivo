"""
Clock Drawing Test (CDT) detector using TensorFlow/Keras.

Trains a simple one-class object detector (bounding box regressor)
from Roboflow-style CSV annotations (_annotations.csv) with columns:
  filename,width,height,class,xmin,ymin,xmax,ymax

Outputs normalized [x_min, y_min, x_max, y_max] in [0,1].
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Tuple, List, Dict, Any
from pathlib import Path

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


@dataclass
class ClockDetectorConfig:
    input_size: int = 512
    batch_size: int = 8
    epochs: int = 20
    learning_rate: float = 1e-4
    augment: bool = True


def _huber_loss(y_true, y_pred):
    return tf.keras.losses.Huber()(y_true, y_pred)


def _bbox_iou(b1, b2):
    """IoU for boxes in [x1,y1,x2,y2] normalized [0,1]. b1,b2: (...,4)."""
    x11, y11, x12, y12 = tf.unstack(b1, axis=-1)
    x21, y21, x22, y22 = tf.unstack(b2, axis=-1)

    xa1 = tf.maximum(x11, x21)
    ya1 = tf.maximum(y11, y21)
    xa2 = tf.minimum(x12, x22)
    ya2 = tf.minimum(y12, y22)

    inter = tf.maximum(0.0, xa2 - xa1) * tf.maximum(0.0, ya2 - ya1)
    area1 = tf.maximum(0.0, (x12 - x11)) * tf.maximum(0.0, (y12 - y11))
    area2 = tf.maximum(0.0, (x22 - x21)) * tf.maximum(0.0, (y22 - y21))
    union = area1 + area2 - inter + 1e-7
    return tf.clip_by_value(inter / union, 0.0, 1.0)


@tf.function
def iou_metric(y_true, y_pred):
    return tf.reduce_mean(_bbox_iou(y_true, y_pred))


class ClockDetector:
    def __init__(self, config: ClockDetectorConfig | None = None):
        self.cfg = config or ClockDetectorConfig()
        self.model: keras.Model | None = None
        # Base dir to save models under backend/models
        self._backend_dir = Path(__file__).resolve().parents[2]
        self._models_dir = self._backend_dir / 'models'

    def _build_model(self) -> keras.Model:
        size = self.cfg.input_size
        base = tf.keras.applications.MobileNetV2(
            input_shape=(size, size, 3), include_top=False, weights='imagenet'
        )
        base.trainable = False

        inputs = keras.Input(shape=(size, size, 3))
        x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs)
        x = base(x, training=False)
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dropout(0.2)(x)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        # 4 outputs: x_min, y_min, x_max, y_max in [0,1]
        outputs = layers.Dense(4, activation='sigmoid')(x)

        model = keras.Model(inputs, outputs, name='cdt_clock_detector')
        model.compile(
            optimizer=keras.optimizers.Adam(self.cfg.learning_rate),
            loss=_huber_loss,
            metrics=[iou_metric]
        )
        return model

    @staticmethod
    def _load_annotations(csv_path: str) -> pd.DataFrame:
        df = pd.read_csv(csv_path)
        # Ensure lower/expected columns
        expected = {'filename', 'width', 'height', 'class', 'xmin', 'ymin', 'xmax', 'ymax'}
        missing = expected - set(df.columns)
        if missing:
            raise ValueError(f"CSV missing columns: {missing}")
        # One class: 'clock'. If multiple rows per image, pick first (or could merge)
        # Here we assume 1 object per image.
        df = df.groupby('filename').first().reset_index()
        return df

    def _make_dataset(self, images_dir: str, csv_path: str, shuffle: bool) -> tf.data.Dataset:
        df = self._load_annotations(csv_path)
        size = self.cfg.input_size

        def _load_row(row):
            img_path = tf.strings.join([images_dir, '/', row['filename']])
            image_raw = tf.io.read_file(img_path)
            image = tf.image.decode_jpeg(image_raw, channels=3)
            image = tf.image.convert_image_dtype(image, tf.float32)
            # Original dims
            w = tf.cast(row['width'], tf.float32)
            h = tf.cast(row['height'], tf.float32)
            # Normalize boxes to [0,1]
            x1 = tf.cast(row['xmin'], tf.float32) / w
            y1 = tf.cast(row['ymin'], tf.float32) / h
            x2 = tf.cast(row['xmax'], tf.float32) / w
            y2 = tf.cast(row['ymax'], tf.float32) / h
            bbox = tf.stack([x1, y1, x2, y2])
            # Resize image to model size
            image = tf.image.resize(image, (size, size), antialias=True)
            return image, bbox

        ds = tf.data.Dataset.from_tensor_slices(df.to_dict(orient='list'))
        ds = ds.map(lambda row: _load_row(row), num_parallel_calls=tf.data.AUTOTUNE)

        if shuffle:
            ds = ds.shuffle(buffer_size=min(len(df), 1024), seed=42)

        if self.cfg.augment and shuffle:
            # Light augmentations
            def _aug(img, bb):
                img = tf.image.random_brightness(img, 0.05)
                img = tf.image.random_contrast(img, 0.9, 1.1)
                img = tf.image.random_flip_left_right(img)
                return img, bb
            ds = ds.map(_aug, num_parallel_calls=tf.data.AUTOTUNE)

        ds = ds.batch(self.cfg.batch_size).prefetch(tf.data.AUTOTUNE)
        return ds

    def train(self, train_dir: str, valid_dir: str) -> Dict[str, Any]:
        train_csv = os.path.join(train_dir, '_annotations.csv')
        valid_csv = os.path.join(valid_dir, '_annotations.csv')
        if not os.path.exists(train_csv) or not os.path.exists(valid_csv):
            raise FileNotFoundError('No se encontraron _annotations.csv en train/valid')

        train_ds = self._make_dataset(train_dir, train_csv, shuffle=True)
        valid_ds = self._make_dataset(valid_dir, valid_csv, shuffle=False)

        if self.model is None:
            self.model = self._build_model()

        # Ensure model dir exists
        os.makedirs(self._models_dir, exist_ok=True)
        callbacks = [
            keras.callbacks.ModelCheckpoint(
                filepath=str(self._models_dir / 'cdt_clock_detector.keras'),
                save_best_only=True,
                monitor='val_iou_metric',
                mode='max'
            ),
            keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True, monitor='val_iou_metric', mode='max')
        ]

        history = self.model.fit(
            train_ds,
            validation_data=valid_ds,
            epochs=self.cfg.epochs,
            callbacks=callbacks,
            verbose=1
        )
        return {k: [float(x) for x in v] for k, v in history.history.items()}

    def evaluate(self, test_dir: str) -> Dict[str, Any]:
        test_csv = os.path.join(test_dir, '_annotations.csv')
        if not os.path.exists(test_csv):
            raise FileNotFoundError('No se encontró _annotations.csv en test')
        test_ds = self._make_dataset(test_dir, test_csv, shuffle=False)
        results = self.model.evaluate(test_ds, return_dict=True, verbose=0)
        return {k: float(v) for k, v in results.items()}

    def predict_image(self, image_path: str) -> Dict[str, Any]:
        if self.model is None:
            raise ValueError('Modelo no cargado')
        size = self.cfg.input_size
        img_raw = tf.io.read_file(image_path)
        img = tf.image.decode_jpeg(img_raw, channels=3)
        h = tf.shape(img)[0]
        w = tf.shape(img)[1]
        img = tf.image.convert_image_dtype(img, tf.float32)
        img_resized = tf.image.resize(img, (size, size))
        pred = self.model.predict(tf.expand_dims(img_resized, 0), verbose=0)[0]
        x1n, y1n, x2n, y2n = [float(x) for x in pred]
        # de-normalize to pixels
        x1 = float(x1n) * float(w.numpy())
        y1 = float(y1n) * float(h.numpy())
        x2 = float(x2n) * float(w.numpy())
        y2 = float(y2n) * float(h.numpy())
        return {
            'bbox_norm': [x1n, y1n, x2n, y2n],
            'bbox_px': [x1, y1, x2, y2]
        }

    def save(self, out_path: str):
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        self.model.save(out_path)
