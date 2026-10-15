# One-time setup for the doctor: a private Python environment and the three browser engines
# (Chromium, WebKit = Safari, Firefox) inside tools/doctor, nothing installed system-wide.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
python -m venv "$here\.venv"
& "$here\.venv\Scripts\python.exe" -m pip install --quiet -r "$here\requirements.txt"
$env:PLAYWRIGHT_BROWSERS_PATH = "$here\.browsers"
& "$here\.venv\Scripts\python.exe" -m playwright install chromium webkit firefox
Write-Host "Готово. Запуск: tools\doctor\doctor.ps1"
