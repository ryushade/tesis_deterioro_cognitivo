# Backend structure overview

This backend combines a Flask API (app/) with ML utilities and datasets used for ROCF/CDT experiments. To reduce clutter, artifacts, data and docs are organized into subfolders.

- app/ — Flask application (blueprints, models, services)
- config/ — Environment/config classes
- migrations/ — Alembic/Flask-Migrate files
- uploads/ — User-uploaded files (if any)
- dataset/ and rocfd528_binary_images/ — Raw datasets (left in place to avoid breaking paths)
- data/
  - labels/ — Label CSVs and templates
  - samples/ — Example images
- artifacts/
  - models/ — Trained model files (.h5, metadata)
  - reports/ — Confusion matrices, training history, CSV outputs, reports
- docs/ — Guides, summaries, notes related to ROCF/CDT
- scripts/ — (optional) Keep helper scripts here; current runnable scripts remain in root for compatibility

If you add new assets, prefer placing them under data/ or artifacts/ to keep the root clean. Paths in `rocf_config.py` point to these folders (e.g., model at `artifacts/models/best_rocf_model_real.h5`, labels at `data/labels/rocf_labeling_template.csv`).
