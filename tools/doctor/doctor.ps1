# Runs the doctor with its own environment; any arguments go to doctor.py (for example -- --quick).
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path "$here\.venv\Scripts\python.exe")) { & "$here\setup.ps1" }
$env:PYTHONIOENCODING = 'utf-8'
& "$here\.venv\Scripts\python.exe" "$here\doctor.py" @args
