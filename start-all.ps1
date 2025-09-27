# Runs both backend (Flask) and frontend (Vite) together.
# Usage: ./start-all.ps1

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$py = Join-Path $repoRoot ".venv/Scripts/python.exe"
if (-not (Test-Path $py)) { $py = "python" }

Write-Host "Using Python: $py"
& $py "$repoRoot/dev_all.py"
