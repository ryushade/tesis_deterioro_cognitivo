param(
  [switch] $UpdateConfig
)

Write-Host "Organizing backend files into data/, artifacts/, docs/ ..." -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root\..

$targets = @(
  'backend/data/labels',
  'backend/data/samples',
  'backend/artifacts/models',
  'backend/artifacts/reports',
  'backend/docs'
)
$targets | ForEach-Object { if(-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ | Out-Null } }

function Move-IfExists($src, $dst){
  if(Test-Path $src){
    $dir = Split-Path -Parent $dst
    if(-not (Test-Path $dir)){ New-Item -ItemType Directory -Path $dir | Out-Null }
    Move-Item -Path $src -Destination $dst -Force
    Write-Host "Moved: $src -> $dst" -ForegroundColor Green
  }
}

# Models and metadata
Move-IfExists 'backend/best_cdt_model.h5'             'backend/artifacts/models/best_cdt_model.h5'
Move-IfExists 'backend/cdt_classification_model.h5'   'backend/artifacts/models/cdt_classification_model.h5'
Move-IfExists 'backend/best_rocf_model_balanced.h5'   'backend/artifacts/models/best_rocf_model_balanced.h5'
Move-IfExists 'backend/best_rocf_model_real.h5'       'backend/artifacts/models/best_rocf_model_real.h5'
Move-IfExists 'backend/cdt_classification_model_metadata.json' 'backend/artifacts/models/cdt_classification_model_metadata.json'

# Reports and images
Move-IfExists 'backend/cdt_classification_model_training_history.png' 'backend/artifacts/reports/cdt_classification_model_training_history.png'
Move-IfExists 'backend/rocf_training_history.png'                     'backend/artifacts/reports/rocf_training_history.png'
Move-IfExists 'backend/rocf_confusion_matrix.png'                     'backend/artifacts/reports/rocf_confusion_matrix.png'
Move-IfExists 'backend/rocf_confusion_matrix_balanced.png'            'backend/artifacts/reports/rocf_confusion_matrix_balanced.png'
Move-IfExists 'backend/rocf_confusion_matrix_final.png'               'backend/artifacts/reports/rocf_confusion_matrix_final.png'
Move-IfExists 'backend/rocf_dataset_analysis.csv'                     'backend/artifacts/reports/rocf_dataset_analysis.csv'
Move-IfExists 'backend/rocf_automatic_classification.csv'             'backend/artifacts/reports/rocf_automatic_classification.csv'
Move-IfExists 'backend/rocf_training_report.txt'                      'backend/artifacts/reports/rocf_training_report.txt'

# Labels and samples
Move-IfExists 'backend/rocf_labeling_template.csv'         'backend/data/labels/rocf_labeling_template.csv'
Move-IfExists 'backend/rocf_labeling_template_clean.csv'   'backend/data/labels/rocf_labeling_template_clean.csv'
Move-IfExists 'backend/rocf_labels_simulated.csv'          'backend/data/labels/rocf_labels_simulated.csv'
Move-IfExists 'backend/rocf_labeling_example.csv'          'backend/data/labels/rocf_labeling_example.csv'
Move-IfExists 'backend/reloj_correcto_10_10.jpg'           'backend/data/samples/reloj_correcto_10_10.jpg'
Move-IfExists 'backend/reloj_incorrecto_12_00.jpg'         'backend/data/samples/reloj_incorrecto_12_00.jpg'
Move-IfExists 'backend/reloj_incorrecto_3_15.jpg'          'backend/data/samples/reloj_incorrecto_3_15.jpg'

# Docs
Move-IfExists 'backend/ROCF_BINARY_RESULTS.md'             'backend/docs/ROCF_BINARY_RESULTS.md'
Move-IfExists 'backend/ROCF_TRAINING_SUMMARY.md'           'backend/docs/ROCF_TRAINING_SUMMARY.md'
Move-IfExists 'backend/ROCF_Labeling_Guide.md'             'backend/docs/ROCF_Labeling_Guide.md'
Move-IfExists 'backend/REAL_LABELING_INSTRUCTIONS.md'      'backend/docs/REAL_LABELING_INSTRUCTIONS.md'
Move-IfExists 'backend/CDT_README.md'                      'backend/docs/CDT_README.md'
Move-IfExists 'backend/rocf_simulated_stats.md'            'backend/docs/rocf_simulated_stats.md'

if($UpdateConfig){
  $cfg = 'backend/rocf_config.py'
  if(Test-Path $cfg){
    (Get-Content -Raw $cfg) `
      -replace 'LABELS_PATH\s*=\s*.*', 'LABELS_PATH = os.path.join("data", "labels", "rocf_labeling_template.csv")' `
      -replace 'MODEL_PATH\s*=\s*.*', 'MODEL_PATH = os.path.join("artifacts", "models", "best_rocf_model_real.h5")' `
      | Set-Content -Encoding UTF8 $cfg
    Write-Host "Updated rocf_config.py paths" -ForegroundColor Yellow
  }
}

Write-Host "Done." -ForegroundColor Cyan
