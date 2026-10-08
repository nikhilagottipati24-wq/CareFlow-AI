@echo off
echo ========================================================
echo   Starting CareFlow AI - Hospital Discharge Coordinator
echo ========================================================
echo.

set "PYTHON_CMD=python"
if exist ".venv\Scripts\python.exe" (
    set "PYTHON_CMD=.venv\Scripts\python.exe"
)

echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "CareFlow AI Backend" cmd /k "%PYTHON_CMD% -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak > nul

echo Starting Vite Frontend on http://127.0.0.1:5173 ...
start "CareFlow AI Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak > nul

echo Opening CareFlow AI in your default web browser...
start http://127.0.0.1:5173/

echo.
echo CareFlow AI is running!
echo - Web Dashboard:  http://127.0.0.1:5173/
echo - API Docs:       http://127.0.0.1:8000/docs
echo ========================================================
