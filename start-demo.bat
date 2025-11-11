@echo off
echo ========================================
echo   Auprolis Demo Server
echo ========================================
echo.
echo Starting local demo server...
echo.
echo Once the server starts, open your browser to:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Or use another method described in DEMO-SETUP.md
    pause
    exit /b 1
)

REM Start the HTTP server
python -m http.server 8000

pause
