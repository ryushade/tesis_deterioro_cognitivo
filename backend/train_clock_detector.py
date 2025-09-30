import os
from pathlib import Path
from app.services.clock_detector import ClockDetector, ClockDetectorConfig

if __name__ == '__main__':
    # Paths (relative to this file: backend/)
    backend_dir = Path(__file__).resolve().parent
    dataset_dir = backend_dir / 'dataset'
    train_dir = str(dataset_dir / 'train')
    valid_dir = str(dataset_dir / 'valid')
    test_dir = str(dataset_dir / 'test')

    # Config
    cfg = ClockDetectorConfig(
        input_size=512,
        batch_size=8,
        epochs=20,
        learning_rate=1e-4,
        augment=True,
    )

    detector = ClockDetector(cfg)

    print('Training CDT clock detector...')
    hist = detector.train(train_dir, valid_dir)
    print('Training history keys:', list(hist.keys()))

    print('Evaluating on test set...')
    eval_res = detector.evaluate(test_dir)
    print('Test metrics:', eval_res)

    out_path = backend_dir / 'models' / 'cdt_clock_detector.keras'
    detector.save(str(out_path))
    print('Saved model to', str(out_path))
